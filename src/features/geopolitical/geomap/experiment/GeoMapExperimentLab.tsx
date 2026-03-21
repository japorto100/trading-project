"use client";

import { Beaker, LayoutPanelLeft, PanelsTopLeft, Radar } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { GeoMapExperimentBackendBoard } from "./backend/components/GeoMapExperimentBackendBoard";
import { geoBackendOptions } from "./backend/geo-backend-options";
import { GeoMapCesiumExperimentBoard } from "./cesium/components/GeoMapCesiumExperimentBoard";
import { geoCesiumExperimentOptions } from "./cesium/geo-cesium-experiment-options";
import { GeoMapExperimentCoverageBoard } from "./components/GeoMapExperimentCoverageBoard";
import { GeoMapExperimentWorkspace } from "./components/GeoMapExperimentWorkspace";
import { GeoMapFlatExperimentBoard } from "./flat/components/GeoMapFlatExperimentBoard";
import { geoFlatExperimentOptions } from "./flat/geo-flat-experiment-options";
import type { GeoMapExperimentVariant } from "./types";
import { fusionAnalystVariant } from "./variants/fusion-analyst";
import { signalDeltaDeskVariant } from "./variants/signal-delta-desk";
import { worldmonitorMissionVariant } from "./variants/worldmonitor-mission";

const variants: GeoMapExperimentVariant[] = [
	worldmonitorMissionVariant,
	fusionAnalystVariant,
	signalDeltaDeskVariant,
];

function getViewportTheme(variantId: string): "mission" | "fusion" | "delta" {
	switch (variantId) {
		case "fusion-analyst":
			return "fusion";
		case "signal-delta-desk":
			return "delta";
		default:
			return "mission";
	}
}

function VariantSummary({ variant }: { variant: GeoMapExperimentVariant }) {
	return (
		<div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
			<div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
				<p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
					Why this variant exists
				</p>
				<div className="space-y-2 text-sm text-slate-200">
					{variant.rationale.map((line) => (
						<p key={line}>{line}</p>
					))}
				</div>
			</div>
			<div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
				<p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
					Reference mix
				</p>
				<div className="grid gap-2 text-sm text-slate-200">
					<div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
						`worldmonitor` for shell discipline and dock rhythm
					</div>
					<div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
						`Crucix` for delta/macro/market-first intelligence panels
					</div>
					<div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
						`worldwideview` + `GeoSentinel` for search/timeline/operator workflow
					</div>
					<div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
						`Shadowbroker` / `Sovereign_Watch` for replay/freshness/runtime realism
					</div>
				</div>
			</div>
		</div>
	);
}

export function GeoMapExperimentLab() {
	const [variantId, setVariantId] = useState(variants[0]?.id ?? "worldmonitor-mission");

	return (
		<div className="min-h-screen bg-[linear-gradient(180deg,#030712,#08111d_36%,#02050b)] px-6 py-8 text-white">
			<div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6">
				<header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,28,0.95),rgba(3,8,16,0.98))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_28%)]" />
					<div className="relative flex flex-col gap-6">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="max-w-4xl">
								<div className="mb-3 flex items-center gap-2 text-cyan-100">
									<div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 p-2">
										<Beaker className="size-4" />
									</div>
									<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
										/geomap/experiment
									</p>
								</div>
								<h1 className="text-3xl font-semibold tracking-tight text-white">
									Isolated GeoMap workspace laboratory
								</h1>
								<p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
									Fresh panel structures derived from the reference clones. This is intentionally
									isolated from the productive GeoMap so we can test shell rhythm, dock hierarchy,
									panel roles, and a broader TradeView Fusion surface without destabilizing the main
									runtime.
								</p>
							</div>
							<div className="grid gap-2">
								<Button
									variant="outline"
									className="justify-start border-white/12 bg-white/5 text-slate-100"
								>
									<PanelsTopLeft />
									Panel hierarchy first
								</Button>
								<Button
									variant="outline"
									className="justify-start border-white/12 bg-white/5 text-slate-100"
								>
									<LayoutPanelLeft />
									Dock + persistence aware
								</Button>
								<Button
									variant="outline"
									className="justify-start border-white/12 bg-white/5 text-slate-100"
								>
									<Radar />
									Flat / Globe aware
								</Button>
							</div>
						</div>

						<Tabs value={variantId} onValueChange={setVariantId} className="gap-4">
							<TabsList className="h-auto flex-wrap bg-white/6 p-1.5">
								{variants.map((variant) => (
									<TabsTrigger
										key={variant.id}
										value={variant.id}
										className="min-w-[10rem] rounded-2xl px-4 py-2 text-xs uppercase tracking-[0.18em]"
									>
										{variant.name}
									</TabsTrigger>
								))}
							</TabsList>
							{variants.map((variant) => (
								<TabsContent key={variant.id} value={variant.id} className="space-y-6">
									<VariantSummary variant={variant} />
									<div className="space-y-3">
										<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
											Clone coverage modules
										</p>
										<GeoMapExperimentCoverageBoard modules={variant.supportModules} />
									</div>
									<GeoMapExperimentWorkspace
										variant={variant}
										viewportTheme={getViewportTheme(variant.id)}
									/>
								</TabsContent>
							))}
						</Tabs>
					</div>
				</header>

				<div className="grid gap-4 lg:grid-cols-3">
					<div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
							Intended use
						</p>
						<p>
							Use this lab to decide panel roles, dock hierarchy, and which clone patterns deserve
							to graduate into the real GeoMap shell.
						</p>
					</div>
					<div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
							Not the goal
						</p>
						<p>
							This is not a direct code transplant from any clone and not yet a production shell. It
							is an isolated experiment surface.
						</p>
					</div>
					<div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
							Promotion rule
						</p>
						<p>
							Only promote patterns from here into the main GeoMap after explicit selection,
							execution-slice mapping, and live verification.
						</p>
					</div>
				</div>

				<GeoMapFlatExperimentBoard options={geoFlatExperimentOptions} />
				<GeoMapExperimentBackendBoard options={geoBackendOptions} />
				<GeoMapCesiumExperimentBoard options={geoCesiumExperimentOptions} />
			</div>
		</div>
	);
}
