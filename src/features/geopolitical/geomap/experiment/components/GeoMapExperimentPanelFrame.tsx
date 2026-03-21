"use client";

import { Activity, Clock3, Layers3, Radio, ShieldAlert, Waypoints } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type {
	GeoMapExperimentPanelSpec,
	GeoMapExperimentReference,
	GeoMapExperimentRole,
	GeoMapExperimentStatus,
	GeoMapExperimentSurface,
} from "../types";

const statusClasses: Record<GeoMapExperimentStatus, string> = {
	live: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
	cached: "border-sky-400/40 bg-sky-500/10 text-sky-200",
	degraded: "border-amber-400/40 bg-amber-500/10 text-amber-200",
};

const roleClasses: Record<GeoMapExperimentRole, string> = {
	primary: "border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-100",
	secondary: "border-indigo-400/35 bg-indigo-500/10 text-indigo-100",
	contextual: "border-cyan-400/35 bg-cyan-500/10 text-cyan-100",
	timeline: "border-orange-400/35 bg-orange-500/10 text-orange-100",
	operations: "border-emerald-400/35 bg-emerald-500/10 text-emerald-100",
	control: "border-slate-400/35 bg-slate-400/10 text-slate-100",
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

function PanelIcon({ role }: { role: GeoMapExperimentRole }) {
	switch (role) {
		case "timeline":
			return <Clock3 className="size-4" />;
		case "operations":
			return <ShieldAlert className="size-4" />;
		case "control":
			return <Layers3 className="size-4" />;
		case "primary":
			return <Activity className="size-4" />;
		case "secondary":
			return <Radio className="size-4" />;
		case "contextual":
			return <Waypoints className="size-4" />;
		default:
			return <Activity className="size-4" />;
	}
}

function Chip({ className, children }: { className: string; children: ReactNode }) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
				className,
			)}
		>
			{children}
		</span>
	);
}

export function GeoMapExperimentPanelFrame({
	panel,
	className,
}: {
	panel: GeoMapExperimentPanelSpec;
	className?: string;
}) {
	return (
		<section
			className={cn(
				"relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(19,29,48,0.96),rgba(8,13,24,0.98))] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)]",
				className,
			)}
		>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.09),transparent_35%)]" />
			<div className="relative flex h-full flex-col gap-4">
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-white">
							<div className="rounded-full border border-white/10 bg-white/5 p-2">
								<PanelIcon role={panel.role} />
							</div>
							<div>
								<h3 className="text-sm font-semibold tracking-[0.08em] uppercase">{panel.title}</h3>
								<p className="text-xs text-slate-300">{panel.subtitle}</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2">
							<Chip className={roleClasses[panel.role]}>{panel.role}</Chip>
							<Chip className={surfaceClasses[panel.appliesTo]}>{panel.appliesTo}</Chip>
							<Chip className={statusClasses[panel.status]}>{panel.status}</Chip>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-2">
					{panel.stats.map((stat) => (
						<div
							key={stat}
							className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-slate-200"
						>
							{stat}
						</div>
					))}
				</div>

				<div className="grid gap-2">
					{panel.items.map((item) => (
						<div
							key={item}
							className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-xs text-slate-200"
						>
							{item}
						</div>
					))}
				</div>

				{panel.notes?.length ? (
					<div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-3 text-xs text-slate-300">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
							Notes
						</p>
						<div className="space-y-1">
							{panel.notes.map((note) => (
								<p key={note}>{note}</p>
							))}
						</div>
					</div>
				) : null}

				<div className="mt-auto flex flex-wrap gap-2 pt-1">
					{panel.references.map((reference) => (
						<Chip
							key={reference}
							className="border-white/10 bg-white/6 text-[9px] tracking-[0.18em] text-slate-200"
						>
							{referenceLabels[reference]}
						</Chip>
					))}
				</div>
			</div>
		</section>
	);
}
