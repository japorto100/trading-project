"use client";

import { Command, Network, RadioTower, RefreshCw, Waypoints } from "lucide-react";

import { cn } from "@/lib/utils";

import type {
	GeoMapExperimentModuleSpec,
	GeoMapExperimentReference,
	GeoMapExperimentStatus,
	GeoMapExperimentSurface,
} from "../types";

const statusClasses: Record<GeoMapExperimentStatus, string> = {
	live: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
	cached: "border-sky-400/40 bg-sky-500/10 text-sky-200",
	degraded: "border-amber-400/40 bg-amber-500/10 text-amber-200",
};

const surfaceClasses: Record<GeoMapExperimentSurface, string> = {
	globe: "border-teal-400/35 bg-teal-500/10 text-teal-100",
	flat: "border-blue-400/35 bg-blue-500/10 text-blue-100",
	both: "border-violet-400/35 bg-violet-500/10 text-violet-100",
};

const referenceLabels: Record<GeoMapExperimentReference, string> = {
	worldmonitor: "WorldMonitor",
	worldwideview: "WorldWideView",
	crucix: "Crucix",
	geosentinel: "GeoSentinel",
	shadowbroker: "Shadowbroker",
	sovereign_watch: "Sovereign Watch",
	conflict_globe_gl: "conflict-globe.gl",
};

function ModuleIcon({ placement }: { placement: GeoMapExperimentModuleSpec["placement"] }) {
	switch (placement) {
		case "topbar":
			return <Command className="size-4" />;
		case "runtime":
			return <RadioTower className="size-4" />;
		case "overlay":
			return <Waypoints className="size-4" />;
		default:
			return <Network className="size-4" />;
	}
}

function Chip({ label, className }: { label: string; className: string }) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
				className,
			)}
		>
			{label}
		</span>
	);
}

export function GeoMapExperimentCoverageBoard({
	modules,
}: {
	modules: GeoMapExperimentModuleSpec[];
}) {
	return (
		<div className="grid gap-4 xl:grid-cols-2">
			{modules.map((module) => (
				<section
					key={module.id}
					className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,24,40,0.96),rgba(7,11,20,0.98))] p-5"
				>
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.07),transparent_30%)]" />
					<div className="relative flex h-full flex-col gap-4">
						<div className="flex items-start justify-between gap-3">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<div className="rounded-full border border-white/10 bg-white/5 p-2 text-white">
										<ModuleIcon placement={module.placement} />
									</div>
									<div>
										<h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white">
											{module.title}
										</h3>
										<p className="text-xs text-slate-300">{module.summary}</p>
									</div>
								</div>
								<div className="flex flex-wrap gap-2">
									<Chip
										label={module.placement}
										className="border-white/10 bg-white/6 text-slate-100"
									/>
									<Chip label={module.appliesTo} className={surfaceClasses[module.appliesTo]} />
									<Chip label={module.status} className={statusClasses[module.status]} />
								</div>
							</div>
							<RefreshCw className="size-4 text-slate-500" />
						</div>

						<div className="grid gap-2">
							{module.items.map((item) => (
								<div
									key={item}
									className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-slate-200"
								>
									{item}
								</div>
							))}
						</div>

						<div className="mt-auto flex flex-wrap gap-2">
							{module.references.map((reference) => (
								<Chip
									key={reference}
									label={referenceLabels[reference]}
									className="border-white/10 bg-white/6 text-slate-100"
								/>
							))}
						</div>
					</div>
				</section>
			))}
		</div>
	);
}
