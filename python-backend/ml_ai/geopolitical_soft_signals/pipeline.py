from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from math import log2
from typing import Literal

from pydantic import BaseModel, Field

try:
    from sklearn.cluster import MiniBatchKMeans
    from sklearn.feature_extraction.text import TfidfVectorizer
except Exception:
    MiniBatchKMeans = None
    TfidfVectorizer = None


SourceTier = Literal["A", "B", "C"]


class ArticleInput(BaseModel):
    title: str = Field(min_length=3)
    url: str = Field(min_length=8)
    publishedAt: str
    source: str
    summary: str | None = None


class SignalRequest(BaseModel):
    adapterId: str
    generatedAt: str
    articles: list[ArticleInput] = Field(default_factory=list)
    maxCandidates: int = Field(default=6, ge=1, le=20)


class SourceRefOutput(BaseModel):
    provider: str
    url: str
    title: str
    publishedAt: str
    sourceTier: SourceTier = "C"
    reliability: float = Field(default=0.6, ge=0.0, le=1.0)


class CandidateOutput(BaseModel):
    headline: str
    confidence: float = Field(default=0.45, ge=0.0, le=1.0)
    severityHint: int = Field(default=2, ge=1, le=5)
    regionHint: str = "global"
    countryHints: list[str] = Field(default_factory=list)
    sourceRefs: list[SourceRefOutput] = Field(default_factory=list)
    symbol: str | None = None
    category: str | None = None


class SignalResponse(BaseModel):
    candidates: list[CandidateOutput]


@dataclass(frozen=True)
class ThemeRule:
    key: str
    tokens: tuple[str, ...]
    category: str
    symbol: str
    severity: int


THEMES: tuple[ThemeRule, ...] = (
    ThemeRule(
        key="sanctions",
        tokens=("sanction", "ofac", "export control", "embargo"),
        category="sanctions_export_controls",
        symbol="gavel",
        severity=3,
    ),
    ThemeRule(
        key="rates",
        tokens=("fomc", "ecb", "rate", "central bank", "inflation"),
        category="monetary_policy_rates",
        symbol="percent",
        severity=2,
    ),
    ThemeRule(
        key="conflict",
        tokens=("missile", "strike", "border", "war", "conflict", "troop"),
        category="military_conflict",
        symbol="shield-alert",
        severity=4,
    ),
    ThemeRule(
        key="energy",
        tokens=("pipeline", "oil", "gas", "opec", "lng"),
        category="energy_supply_shock",
        symbol="fuel",
        severity=3,
    ),
)

COUNTRY_KEYWORDS: dict[str, tuple[str, ...]] = {
    "US": ("united states", "u.s.", "america", "federal reserve", "washington"),
    "GB": ("uk", "britain", "london", "england"),
    "DE": ("germany", "berlin", "bundesbank"),
    "FR": ("france", "paris"),
    "CN": ("china", "beijing", "pbo"),
    "RU": ("russia", "moscow", "kremlin"),
    "UA": ("ukraine", "kyiv", "kiev"),
    "IR": ("iran", "tehran"),
    "IL": ("israel", "jerusalem", "tel aviv"),
}


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(value.lower().split())


def detect_countries(text: str) -> list[str]:
    countries: list[str] = []
    for code, keywords in COUNTRY_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            countries.append(code)
    return countries


def parse_iso(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
        return datetime.now(timezone.utc)


def source_ref(article: ArticleInput, provider_prefix: str) -> SourceRefOutput:
    return SourceRefOutput(
        provider=f"{provider_prefix}:{article.source}",
        url=article.url,
        title=article.title,
        publishedAt=article.publishedAt,
        sourceTier="C",
        reliability=0.62,
    )


def confidence_from_count(count: int, base: float = 0.42) -> float:
    return max(0.0, min(1.0, base + min(0.28, count * 0.04)))


def article_text(article: ArticleInput) -> str:
    return normalize_text(f"{article.title} {article.summary or ''} {article.source}")


def classify_theme(text: str) -> ThemeRule:
    best_rule = THEMES[0]
    best_score = -1
    for rule in THEMES:
        score = sum(1 for token in rule.tokens if token in text)
        if score > best_score:
            best_score = score
            best_rule = rule
    return best_rule


def build_news_cluster_ml(payload: SignalRequest) -> SignalResponse | None:
    if TfidfVectorizer is None or MiniBatchKMeans is None:
        return None
    if len(payload.articles) < 4:
        return None

    texts = [article_text(article) for article in payload.articles]
    n_clusters = max(1, min(payload.maxCandidates, min(6, len(payload.articles) // 2)))
    if n_clusters <= 1:
        return None

    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=1500)
        features = vectorizer.fit_transform(texts)
        model = MiniBatchKMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = model.fit_predict(features)
    except Exception:
        return None

    buckets: dict[int, list[ArticleInput]] = {}
    for article, label in zip(payload.articles, labels):
        buckets.setdefault(int(label), []).append(article)

    ranked_clusters = sorted(buckets.values(), key=lambda group: len(group), reverse=True)
    candidates: list[CandidateOutput] = []
    for group in ranked_clusters[: payload.maxCandidates]:
        primary = sorted(group, key=lambda item: parse_iso(item.publishedAt), reverse=True)[0]
        text = article_text(primary)
        theme = classify_theme(text)
        candidates.append(
            CandidateOutput(
                headline=f"{theme.key.title()} cluster detected: {primary.title}",
                confidence=confidence_from_count(len(group), 0.5),
                severityHint=theme.severity,
                regionHint="global",
                countryHints=detect_countries(text),
                sourceRefs=[source_ref(primary, "news_cluster")],
                symbol=theme.symbol,
                category=theme.category,
            )
        )

    return SignalResponse(candidates=candidates)


def build_news_cluster(payload: SignalRequest) -> SignalResponse:
    ml_result = build_news_cluster_ml(payload)
    if ml_result is not None and ml_result.candidates:
        return ml_result

    ranked = sorted(payload.articles, key=lambda item: parse_iso(item.publishedAt), reverse=True)
    buckets: dict[str, list[ArticleInput]] = {rule.key: [] for rule in THEMES}

    for article in ranked:
        text = normalize_text(f"{article.title} {article.summary or ''}")
        for rule in THEMES:
            if any(token in text for token in rule.tokens):
                buckets[rule.key].append(article)

    candidates: list[CandidateOutput] = []
    for rule in THEMES:
        grouped = buckets[rule.key]
        if not grouped:
            continue
        primary = grouped[0]
        text = normalize_text(f"{primary.title} {primary.summary or ''}")
        countries = detect_countries(text)
        candidates.append(
            CandidateOutput(
                headline=f"{rule.key.title()} cluster detected: {primary.title}",
                confidence=confidence_from_count(len(grouped), 0.48),
                severityHint=rule.severity,
                regionHint="global",
                countryHints=countries,
                sourceRefs=[source_ref(primary, "news_cluster")],
                symbol=rule.symbol,
                category=rule.category,
            )
        )

    return SignalResponse(candidates=candidates[: payload.maxCandidates])


def build_social_surge(payload: SignalRequest) -> SignalResponse:
    surge_articles: list[ArticleInput] = []
    source_counter: Counter[str] = Counter()
    for article in payload.articles:
        text = article_text(article)
        source_counter.update([article.source.lower()])
        if any(token in text for token in ("reddit", "x.com", "twitter", "viral", "trending", "surge")):
            surge_articles.append(article)
            continue
        if sum(1 for token in ("breaking", "urgent", "flash", "latest") if token in text) >= 2:
            surge_articles.append(article)

    if not surge_articles:
        return SignalResponse(candidates=[])

    top = sorted(surge_articles, key=lambda item: parse_iso(item.publishedAt), reverse=True)[: payload.maxCandidates]
    candidates = [
        CandidateOutput(
            headline=f"Social surge: {article.title}",
            confidence=confidence_from_count(len(surge_articles) + source_counter[article.source.lower()], 0.44),
            severityHint=2,
            regionHint="global",
            countryHints=detect_countries(normalize_text(f"{article.title} {article.summary or ''}")),
            sourceRefs=[source_ref(article, "social_surge")],
            symbol="message-circle-warning",
            category="social_chatter_surge",
        )
        for article in top
    ]

    return SignalResponse(candidates=candidates)


def js_divergence(left: Counter[str], right: Counter[str]) -> float:
    keys = set(left.keys()) | set(right.keys())
    if not keys:
        return 0.0
    left_total = sum(left.values()) or 1
    right_total = sum(right.values()) or 1
    midpoint: dict[str, float] = {}
    for key in keys:
        p = left[key] / left_total
        q = right[key] / right_total
        midpoint[key] = (p + q) / 2

    def kl(counter: Counter[str], total: int) -> float:
        value = 0.0
        for key in keys:
            p = counter[key] / total
            if p > 0 and midpoint[key] > 0:
                value += p * log2(p / midpoint[key])
        return value

    return (kl(left, left_total) + kl(right, right_total)) / 2


def build_narrative_shift(payload: SignalRequest) -> SignalResponse:
    ranked = sorted(payload.articles, key=lambda item: parse_iso(item.publishedAt))
    if len(ranked) < 6:
        return SignalResponse(candidates=[])

    split_at = len(ranked) // 2
    older = ranked[:split_at]
    newer = ranked[split_at:]

    older_tokens: list[str] = []
    newer_tokens: list[str] = []

    for article in older:
        older_tokens.extend([token for token in article_text(article).split(" ") if len(token) >= 5])
    for article in newer:
        newer_tokens.extend([token for token in article_text(article).split(" ") if len(token) >= 5])

    older_counter = Counter(older_tokens)
    newer_counter = Counter(newer_tokens)
    drift_score = js_divergence(older_counter, newer_counter)

    common = [
        token
        for token, count in newer_counter.most_common(50)
        if count >= 2 and count > older_counter.get(token, 0)
    ]
    if not common:
        return SignalResponse(candidates=[])

    top_articles = sorted(payload.articles, key=lambda item: parse_iso(item.publishedAt), reverse=True)
    candidates: list[CandidateOutput] = []
    for token in common[: payload.maxCandidates]:
        anchor = next(
            (article for article in top_articles if token in normalize_text(f"{article.title} {article.summary or ''}")),
            None,
        )
        if anchor is None:
            continue
        candidates.append(
            CandidateOutput(
                headline=f"Narrative shift around '{token}'",
                confidence=max(0.35, min(0.95, 0.35 + drift_score * 0.5 + min(0.2, newer_counter[token] * 0.03))),
                severityHint=2,
                regionHint="global",
                countryHints=detect_countries(normalize_text(f"{anchor.title} {anchor.summary or ''}")),
                sourceRefs=[source_ref(anchor, "narrative_shift")],
                symbol="brain-circuit",
                category="narrative_shift",
            )
        )

    return SignalResponse(candidates=candidates[: payload.maxCandidates])
