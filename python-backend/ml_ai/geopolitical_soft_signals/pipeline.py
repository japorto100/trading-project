from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime, timezone
from math import log2
import os
from typing import Literal

import httpx
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

SOURCE_RELIABILITY: dict[str, tuple[SourceTier, float]] = {
    "reuters": ("A", 0.88),
    "bloomberg": ("A", 0.86),
    "ft": ("A", 0.84),
    "ap": ("A", 0.82),
    "wsj": ("A", 0.84),
    "cnbc": ("B", 0.74),
    "marketwatch": ("B", 0.72),
    "x.com": ("C", 0.52),
    "twitter": ("C", 0.52),
    "reddit": ("C", 0.5),
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
    source_key = normalize_text(article.source)
    tier, reliability = SOURCE_RELIABILITY.get(source_key, ("C", 0.62))
    return SourceRefOutput(
        provider=f"{provider_prefix}:{article.source}",
        url=article.url,
        title=article.title,
        publishedAt=article.publishedAt,
        sourceTier=tier,
        reliability=reliability,
    )


def confidence_from_count(count: int, base: float = 0.42) -> float:
    return max(0.0, min(1.0, base + min(0.28, count * 0.04)))


def recency_boost(published_at: str) -> float:
    published = parse_iso(published_at)
    age_hours = max(0.0, (datetime.now(timezone.utc) - published).total_seconds() / 3600.0)
    return max(0.0, 0.14 - min(0.14, age_hours * 0.004))


def finbert_polarity_score(text: str) -> float | None:
    token = os.getenv("FINBERT_HF_API_TOKEN", "").strip()
    if not token:
        return None
    api_url = os.getenv(
        "FINBERT_HF_API_URL", "https://api-inference.huggingface.co/models/ProsusAI/finbert"
    ).strip()
    if not api_url:
        return None

    try:
        with httpx.Client(timeout=2.5) as client:
            response = client.post(
                api_url,
                headers={"Authorization": f"Bearer {token}"},
                json={"inputs": text[:800]},
            )
            if response.status_code >= 400:
                return None
            payload = response.json()
            labels = payload[0] if isinstance(payload, list) and payload else []
            if not isinstance(labels, list):
                return None
            positive = 0.0
            negative = 0.0
            neutral = 0.0
            for item in labels:
                if not isinstance(item, dict):
                    continue
                label = normalize_text(str(item.get("label", "")))
                score = float(item.get("score", 0.0))
                if "positive" in label:
                    positive = score
                elif "negative" in label:
                    negative = score
                elif "neutral" in label:
                    neutral = score
            if positive == 0.0 and negative == 0.0 and neutral == 0.0:
                return None
            # [-1, 1] where positive is bullish and negative is bearish.
            return max(-1.0, min(1.0, positive - negative))
    except Exception:
        return None


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
        unique_sources = len({normalize_text(item.source) for item in group})
        confidence = confidence_from_count(len(group), 0.5) + min(0.1, unique_sources * 0.02)
        confidence += recency_boost(primary.publishedAt)
        refs = [source_ref(item, "news_cluster") for item in group[:2]]
        candidates.append(
            CandidateOutput(
                headline=f"{theme.key.title()} cluster detected: {primary.title}",
                confidence=max(0.0, min(1.0, confidence)),
                severityHint=theme.severity,
                regionHint="global",
                countryHints=detect_countries(text),
                sourceRefs=refs,
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
        unique_sources = len({normalize_text(item.source) for item in grouped})
        confidence = confidence_from_count(len(grouped), 0.48) + min(0.08, unique_sources * 0.02)
        confidence += recency_boost(primary.publishedAt)
        refs = [source_ref(item, "news_cluster") for item in grouped[:2]]
        candidates.append(
            CandidateOutput(
                headline=f"{rule.key.title()} cluster detected: {primary.title}",
                confidence=max(0.0, min(1.0, confidence)),
                severityHint=rule.severity,
                regionHint="global",
                countryHints=countries,
                sourceRefs=refs,
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

    distinct_sources = len({normalize_text(article.source) for article in surge_articles})
    top = sorted(surge_articles, key=lambda item: parse_iso(item.publishedAt), reverse=True)[: payload.maxCandidates]
    candidates: list[CandidateOutput] = []
    for article in top:
        text = normalize_text(f"{article.title} {article.summary or ''}")
        confidence = confidence_from_count(len(surge_articles) + source_counter[article.source.lower()], 0.44)
        confidence += min(0.08, distinct_sources * 0.015)
        confidence += recency_boost(article.publishedAt)
        finbert = finbert_polarity_score(text)
        if finbert is not None:
            confidence += min(0.06, abs(finbert) * 0.06)
        candidates.append(
            CandidateOutput(
                headline=f"Social surge: {article.title}",
                confidence=max(0.0, min(1.0, confidence)),
                severityHint=2 if finbert is None else (3 if abs(finbert) > 0.45 else 2),
                regionHint="global",
                countryHints=detect_countries(text),
                sourceRefs=[source_ref(article, "social_surge")],
                symbol="message-circle-warning",
                category="social_chatter_surge",
            )
        )

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
        token_articles = [
            article
            for article in top_articles
            if token in normalize_text(f"{article.title} {article.summary or ''}")
        ]
        anchor = token_articles[0] if token_articles else None
        if anchor is None:
            continue
        source_count = len({normalize_text(article.source) for article in token_articles})
        confidence = max(0.35, min(0.95, 0.35 + drift_score * 0.5 + min(0.2, newer_counter[token] * 0.03)))
        confidence += min(0.08, source_count * 0.02)
        confidence += recency_boost(anchor.publishedAt)
        candidates.append(
            CandidateOutput(
                headline=f"Narrative shift around '{token}'",
                confidence=max(0.0, min(1.0, confidence)),
                severityHint=2,
                regionHint="global",
                countryHints=detect_countries(normalize_text(f"{anchor.title} {anchor.summary or ''}")),
                sourceRefs=[source_ref(article, "narrative_shift") for article in token_articles[:2]],
                symbol="brain-circuit",
                category="narrative_shift",
            )
        )

    return SignalResponse(candidates=candidates[: payload.maxCandidates])
