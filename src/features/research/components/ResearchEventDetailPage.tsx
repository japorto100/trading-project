"use client";

import { ArrowLeft, Globe, Radar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildEventDetailHref, buildSurfaceReturnHref } from "@/lib/event-detail";
import { useResearchEventDetail } from "../hooks/useResearchEventDetail";

function severityTone(severity: number): string {
	if (severity >= 5) return "border-red-500/40 text-red-300";
	if (severity >= 4) return "border-amber-500/40 text-amber-300";
	if (severity >= 3) return "border-sky-500/40 text-sky-300";
	return "border-muted text-muted-foreground";
}

function returnLabel(returnTo: string): string {
	if (returnTo.startsWith("/calendar")) return "Calendar";
	if (returnTo.startsWith("/trading")) return "Trading";
	if (returnTo.startsWith("/geopolitical-map")) return "GeoMap";
	if (returnTo.startsWith("/control")) return "Control";
	return "Research";
}

export function ResearchEventDetailPage({ eventId }: { eventId: string }) {
	const searchParams = useSearchParams();
	const returnTo = searchParams.get("returnTo") || "/research";
	const query = useResearchEventDetail(eventId);

	if (query.isLoading) {
		return (
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-6">
				<div className="h-40 animate-pulse rounded-3xl border border-border/70 bg-card/50" />
				<div className="h-72 animate-pulse rounded-3xl border border-border/70 bg-card/50" />
			</div>
		);
	}

	if (query.isError || !query.data) {
		return (
			<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-6">
				<Button asChild variant="ghost" className="w-fit">
					<Link href={returnTo}>
						<ArrowLeft className="h-4 w-4" />
						Back
					</Link>
				</Button>
				<Alert variant="destructive">
					<AlertTitle>Event detail unavailable</AlertTitle>
					<AlertDescription>
						{query.error instanceof Error ? query.error.message : "Failed to load event detail."}
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	const event = query.data;
	const currentEventHref = buildEventDetailHref(event.id, returnTo);

	return (
		<main
			aria-labelledby="shared-event-title"
			className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6"
		>
			<Button asChild variant="ghost" className="w-fit">
				<Link href={returnTo} aria-label={`Back to ${returnLabel(returnTo)}`}>
					<ArrowLeft className="h-4 w-4" />
					Back to {returnLabel(returnTo)}
				</Link>
			</Button>

			<section
				aria-labelledby="shared-event-title"
				className="rounded-3xl border border-border/70 bg-card/70 p-6"
			>
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-3">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline" className={severityTone(event.severity)}>
								Severity {event.severity}
							</Badge>
							<Badge variant="outline">{event.status}</Badge>
							<Badge variant="outline">{event.category}</Badge>
						</div>
						<h1
							id="shared-event-title"
							className="text-3xl font-semibold tracking-tight text-foreground"
						>
							{event.title}
						</h1>
						<p className="max-w-3xl text-sm leading-6 text-muted-foreground">
							{event.summary ||
								event.analystNote ||
								"No analyst summary available for this event yet."}
						</p>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-2xl border border-border/70 bg-background/70 p-4">
							<p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
								Confidence
							</p>
							<p className="mt-2 text-sm font-semibold text-foreground">
								{Math.round((event.confidence / 4) * 100)}%
							</p>
						</div>
						<div className="rounded-2xl border border-border/70 bg-background/70 p-4">
							<p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
								Updated
							</p>
							<p className="mt-2 text-sm font-semibold text-foreground">
								{new Date(event.updatedAt).toLocaleString()}
							</p>
						</div>
					</div>
				</div>
			</section>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
				<div className="space-y-6">
					<section
						aria-labelledby="event-evidence-heading"
						className="rounded-3xl border border-border/70 bg-card/60 p-6"
					>
						<h2 id="event-evidence-heading" className="text-lg font-semibold text-foreground">
							Evidence and Scope
						</h2>
						<div className="mt-4 grid gap-4 md:grid-cols-2">
							<div className="rounded-2xl border border-border/70 bg-background/60 p-4">
								<p className="text-xs font-medium text-foreground">Regions</p>
								<p className="mt-2 text-sm text-muted-foreground">
									{event.regionIds.length > 0 ? event.regionIds.join(", ") : "No region ids"}
								</p>
							</div>
							<div className="rounded-2xl border border-border/70 bg-background/60 p-4">
								<p className="text-xs font-medium text-foreground">Countries</p>
								<p className="mt-2 text-sm text-muted-foreground">
									{event.countryCodes.length > 0
										? event.countryCodes.join(", ")
										: "No country codes"}
								</p>
							</div>
						</div>
						<div className="mt-4 space-y-3">
							{event.sources.length > 0 ? (
								event.sources.map((source) => (
									<a
										key={source.id}
										href={source.url}
										target="_blank"
										rel="noreferrer"
										className="block rounded-2xl border border-border/70 bg-background/60 p-4 hover:border-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
										aria-label={`Open evidence source: ${source.title || source.provider}`}
									>
										<p className="text-sm font-semibold text-foreground">
											{source.title || source.provider}
										</p>
										<p className="mt-1 text-xs text-muted-foreground">
											{source.provider} · tier {source.sourceTier} · reliability{" "}
											{source.reliability}
										</p>
									</a>
								))
							) : (
								<p className="text-sm text-muted-foreground">No source links are attached yet.</p>
							)}
						</div>
					</section>

					<section
						aria-labelledby="event-assets-heading"
						className="rounded-3xl border border-border/70 bg-card/60 p-6"
					>
						<h2 id="event-assets-heading" className="text-lg font-semibold text-foreground">
							Linked Assets
						</h2>
						<div className="mt-4 space-y-3">
							{event.assets.length > 0 ? (
								event.assets.map((asset) => (
									<div
										key={asset.id}
										className="rounded-2xl border border-border/70 bg-background/60 p-4"
									>
										<div className="flex items-center justify-between gap-3">
											<p className="text-sm font-semibold text-foreground">{asset.symbol}</p>
											<Badge variant="outline">{asset.relation}</Badge>
										</div>
										<p className="mt-2 text-xs text-muted-foreground">
											{asset.rationale || `${asset.assetClass} exposure`}
										</p>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground">No linked assets are attached yet.</p>
							)}
						</div>
					</section>
				</div>

				<aside aria-label="Event drilldowns" className="space-y-4">
					<h2 className="sr-only">Event drilldown actions</h2>
					<Button asChild className="w-full justify-start">
						<Link href={buildSurfaceReturnHref("/trading", currentEventHref)}>
							<TrendingUp className="h-4 w-4" />
							Open Trading Workspace
						</Link>
					</Button>
					<Button asChild variant="outline" className="w-full justify-start">
						<Link href={buildSurfaceReturnHref("/geopolitical-map", currentEventHref)}>
							<Globe className="h-4 w-4" />
							Open GeoMap
						</Link>
					</Button>
					<Button asChild variant="outline" className="w-full justify-start">
						<Link href="/control/overview">
							<Radar className="h-4 w-4" />
							Open Control
						</Link>
					</Button>
				</aside>
			</div>
		</main>
	);
}
