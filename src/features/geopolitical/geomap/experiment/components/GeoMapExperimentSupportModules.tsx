"use client";

import { Command, Layers3, RadioTower, Waypoints } from "lucide-react";

import { cn } from "@/lib/utils";

import type {
	GeoMapExperimentModuleSpec,
	GeoMapExperimentStatus,
	GeoMapExperimentSurface,
} from "../types";

const statusClasses: Record<GeoMapExperimentStatus, string> = {
	live: "border-emerald-400/35 bg-emerald-500/10 text-emerald-100",
	cached: "border-sky-400/35 bg-sky-500/10 text-sky-100",
	degraded: "border-amber-400/35 bg-amber-500/10 text-amber-100",
};

const surfaceClasses: Record<GeoMapExperimentSurface, string> = {
	globe: "border-teal-400/35 bg-teal-500/10 text-teal-100",
	flat: "border-blue-400/35 bg-blue-500/10 text-blue-100",
	both: "border-violet-400/35 bg-violet-500/10 text-violet-100",
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
			return <Layers3 className="size-4" />;
	}
}

function PlacementLabel({ placement }: { placement: GeoMapExperimentModuleSpec["placement"] }) {
	const label =
		placement === "topbar"
			? "Search / Workflow"
			: placement === "runtime"
				? "Runtime / Replay"
				: placement === "overlay"
					? "Overlay lane"
					: "Support logic";

	return (
		<p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
	);
}

function ModuleCard({
	module,
	compact = false,
}: {
	module: GeoMapExperimentModuleSpec;
	compact?: boolean;
}) {
	return (
		<section
			className={cn(
				"relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,34,0.95),rgba(7,11,20,0.98))] p-4",
				compact ? "min-h-[10rem]" : "min-h-[13rem]",
			)}
		>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.06),transparent_28%)]" />
			<div className="relative flex h-full flex-col gap-3">
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-white">
							<div className="rounded-full border border-white/10 bg-white/5 p-2">
								<ModuleIcon placement={module.placement} />
							</div>
							<div>
								<h3 className="text-sm font-semibold uppercase tracking-[0.1em]">{module.title}</h3>
								<p className="text-xs text-slate-300">{module.summary}</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					<span
						className={cn(
							"rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
							statusClasses[module.status],
						)}
					>
						{module.status}
					</span>
					<span
						className={cn(
							"rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
							surfaceClasses[module.appliesTo],
						)}
					>
						{module.appliesTo}
					</span>
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
			</div>
		</section>
	);
}

export function GeoMapExperimentTopbarModules({
	modules,
}: {
	modules: GeoMapExperimentModuleSpec[];
}) {
	if (modules.length === 0) return null;

	return (
		<div className="space-y-3">
			<PlacementLabel placement="topbar" />
			<div className="grid gap-3 xl:grid-cols-2">
				{modules.map((module) => (
					<ModuleCard key={module.id} module={module} compact />
				))}
			</div>
		</div>
	);
}

export function GeoMapExperimentRuntimeModules({
	modules,
}: {
	modules: GeoMapExperimentModuleSpec[];
}) {
	if (modules.length === 0) return null;

	return (
		<div className="space-y-3">
			<PlacementLabel placement="runtime" />
			<div className="grid gap-3 xl:grid-cols-2">
				{modules.map((module) => (
					<ModuleCard key={module.id} module={module} compact />
				))}
			</div>
		</div>
	);
}

export function GeoMapExperimentSupportGrid({
	modules,
}: {
	modules: GeoMapExperimentModuleSpec[];
}) {
	if (modules.length === 0) return null;

	return (
		<div className="space-y-3">
			<PlacementLabel placement="support" />
			<div className="grid gap-3 xl:grid-cols-2">
				{modules.map((module) => (
					<ModuleCard key={module.id} module={module} />
				))}
			</div>
		</div>
	);
}

export function GeoMapExperimentOverlayDock({
	modules,
}: {
	modules: GeoMapExperimentModuleSpec[];
}) {
	if (modules.length === 0) return null;

	return (
		<div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 grid gap-3 xl:grid-cols-2">
			{modules.map((module) => (
				<div
					key={module.id}
					className="rounded-[1.5rem] border border-white/12 bg-black/35 p-4 backdrop-blur-md"
				>
					<div className="mb-3 flex items-center gap-2 text-white">
						<div className="rounded-full border border-white/10 bg-white/5 p-2">
							<ModuleIcon placement={module.placement} />
						</div>
						<div>
							<h3 className="text-xs font-semibold uppercase tracking-[0.16em]">{module.title}</h3>
							<p className="text-[11px] text-slate-300">{module.summary}</p>
						</div>
					</div>
					<div className="grid gap-2">
						{module.items.map((item) => (
							<div
								key={item}
								className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-[11px] text-slate-100"
							>
								{item}
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
