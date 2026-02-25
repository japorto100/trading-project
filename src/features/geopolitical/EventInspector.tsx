"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GeoContradiction, GeoEvent } from "@/lib/geopolitical/types";

interface EventInspectorProps {
	event: GeoEvent | null;
	busy: boolean;
	onAddSource: (payload: {
		provider: string;
		url: string;
		title?: string;
		sourceTier?: "A" | "B" | "C";
	}) => void;
	onAddAsset: (payload: {
		symbol: string;
		assetClass: "equity" | "etf" | "fx" | "commodity" | "crypto" | "index";
		relation: "beneficiary" | "exposed" | "hedge" | "uncertain";
		rationale?: string;
	}) => void;
}

export function EventInspector({ event, busy, onAddSource, onAddAsset }: EventInspectorProps) {
	const [sourceProvider, setSourceProvider] = useState("");
	const [sourceUrl, setSourceUrl] = useState("");
	const [sourceTitle, setSourceTitle] = useState("");
	const [assetSymbol, setAssetSymbol] = useState("");
	const [assetRationale, setAssetRationale] = useState("");
	const [relatedContradictions, setRelatedContradictions] = useState<GeoContradiction[]>([]);
	const [contradictionsLoading, setContradictionsLoading] = useState(false);
	const [contradictionsError, setContradictionsError] = useState<string | null>(null);

	const eventSourceUrls = useMemo(
		() =>
			new Set(
				(event?.sources ?? [])
					.map((source) => source.url.trim())
					.filter((value) => value.length > 0)
					.map((value) => value.toLowerCase()),
			),
		[event],
	);

	useEffect(() => {
		let cancelled = false;
		if (!event) {
			setRelatedContradictions([]);
			setContradictionsLoading(false);
			setContradictionsError(null);
			return;
		}

		setContradictionsLoading(true);
		setContradictionsError(null);

		void fetch("/api/geopolitical/contradictions", { cache: "no-store" })
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`contradictions fetch failed (${response.status})`);
				}
				const payload = (await response.json()) as {
					success?: boolean;
					contradictions?: GeoContradiction[];
				};
				const contradictions = Array.isArray(payload.contradictions) ? payload.contradictions : [];
				const linked = contradictions.filter((contradiction) => {
					const linkedByEvidence = contradiction.evidence.some(
						(evidence) => evidence.eventId === event.id,
					);
					if (linkedByEvidence) return true;
					if (contradiction.resolution?.mergedEventId === event.id) return true;
					const linkedBySource = contradiction.sourceRefs.some((source) =>
						eventSourceUrls.has(source.url.trim().toLowerCase()),
					);
					return linkedBySource;
				});
				if (cancelled) return;
				setRelatedContradictions(linked);
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				setContradictionsError(
					error instanceof Error ? error.message : "contradictions fetch failed",
				);
				setRelatedContradictions([]);
			})
			.finally(() => {
				if (!cancelled) setContradictionsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [event, eventSourceUrls]);

	if (!event) {
		return (
			<section className="rounded-md border border-border bg-card p-3">
				<h2 className="text-sm font-semibold">Event Inspector</h2>
				<p className="mt-2 text-xs text-muted-foreground">
					Select a map marker to inspect sources and asset links.
				</p>
			</section>
		);
	}

	return (
		<section className="rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">Event Inspector</h2>
			<p className="mt-1 text-xs text-muted-foreground">{event.title}</p>

			<div className="mt-3 rounded-md border border-border bg-background p-2">
				<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Sources ({event.sources.length})
				</h3>
				<div
					className="mt-2 max-h-24 space-y-1 overflow-y-auto text-xs"
					tabIndex={0}
					aria-label="Event sources list"
				>
					{event.sources.length === 0 ? (
						<p className="text-muted-foreground">No sources linked yet.</p>
					) : (
						event.sources.map((source) => (
							<div key={source.id} className="rounded border border-border px-2 py-1">
								<p className="font-medium">{source.provider}</p>
								<a
									className="text-[11px] text-blue-500 underline"
									href={source.url}
									target="_blank"
									rel="noreferrer"
								>
									{source.url}
								</a>
							</div>
						))
					)}
				</div>

				<div className="mt-2 space-y-2">
					<Input
						value={sourceProvider}
						onChange={(event) => setSourceProvider(event.target.value)}
						placeholder="Provider"
						aria-label="Source provider"
					/>
					<Input
						value={sourceUrl}
						onChange={(event) => setSourceUrl(event.target.value)}
						placeholder="https://..."
						aria-label="Source URL"
					/>
					<Input
						value={sourceTitle}
						onChange={(event) => setSourceTitle(event.target.value)}
						placeholder="Source title (optional)"
						aria-label="Source title"
					/>
					<Button
						size="sm"
						disabled={busy || !sourceProvider.trim() || !sourceUrl.trim()}
						onClick={() => {
							onAddSource({
								provider: sourceProvider.trim(),
								url: sourceUrl.trim(),
								title: sourceTitle.trim() || undefined,
								sourceTier: "B",
							});
							setSourceProvider("");
							setSourceUrl("");
							setSourceTitle("");
						}}
						aria-label="Add source to selected event"
					>
						Add source
					</Button>
				</div>
			</div>

			<div className="mt-3 rounded-md border border-border bg-background p-2">
				<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Contradictions ({relatedContradictions.length})
				</h3>
				<div
					className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs"
					tabIndex={0}
					aria-label="Related contradictions list"
				>
					{contradictionsLoading ? (
						<p className="text-muted-foreground">Loading contradictions…</p>
					) : contradictionsError ? (
						<p className="text-red-400">{contradictionsError}</p>
					) : relatedContradictions.length === 0 ? (
						<p className="text-muted-foreground">
							No linked contradictions found for this event (evidence, mergedEventId, or source
							overlap).
						</p>
					) : (
						relatedContradictions.map((contradiction) => (
							<div key={contradiction.id} className="rounded border border-border px-2 py-1">
								<div className="flex items-center justify-between gap-2">
									<p className="truncate font-medium">{contradiction.title}</p>
									<span className="text-[10px] text-muted-foreground">
										{contradiction.state} · S{contradiction.severityHint}
									</span>
								</div>
								<p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
									{contradiction.summary ?? contradiction.statementA}
								</p>
							</div>
						))
					)}
				</div>
			</div>

			<div className="mt-3 rounded-md border border-border bg-background p-2">
				<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Assets ({event.assets.length})
				</h3>
				<div
					className="mt-2 max-h-24 space-y-1 overflow-y-auto text-xs"
					tabIndex={0}
					aria-label="Event assets list"
				>
					{event.assets.length === 0 ? (
						<p className="text-muted-foreground">No asset links yet.</p>
					) : (
						event.assets.map((asset) => (
							<div key={asset.id} className="rounded border border-border px-2 py-1">
								<p className="font-medium">{asset.symbol}</p>
								<p className="text-[11px] text-muted-foreground">
									{asset.assetClass} | {asset.relation}
								</p>
							</div>
						))
					)}
				</div>

				<div className="mt-2 space-y-2">
					<Input
						value={assetSymbol}
						onChange={(event) => setAssetSymbol(event.target.value)}
						placeholder="Ticker/Symbol"
						aria-label="Asset symbol"
					/>
					<Input
						value={assetRationale}
						onChange={(event) => setAssetRationale(event.target.value)}
						placeholder="Rationale (optional)"
						aria-label="Asset rationale"
					/>
					<Button
						size="sm"
						disabled={busy || !assetSymbol.trim()}
						onClick={() => {
							onAddAsset({
								symbol: assetSymbol.trim(),
								assetClass: "equity",
								relation: "uncertain",
								rationale: assetRationale.trim() || undefined,
							});
							setAssetSymbol("");
							setAssetRationale("");
						}}
						aria-label="Add asset link to selected event"
					>
						Add asset link
					</Button>
				</div>
			</div>
		</section>
	);
}
