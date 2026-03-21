"use client";

import { Crosshair, Globe2, Layers3, Radar, ScanSearch } from "lucide-react";

import { cn } from "@/lib/utils";

import type { GeoMapExperimentModuleSpec } from "../types";
import { GeoMapExperimentOverlayDock } from "./GeoMapExperimentSupportModules";

function ViewportChip({ label }: { label: string }) {
	return (
		<span className="rounded-full border border-white/12 bg-white/7 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200">
			{label}
		</span>
	);
}

export function GeoMapExperimentViewportMock({
	title,
	subtitle,
	chips,
	signals,
	theme,
	overlayModules,
}: {
	title: string;
	subtitle: string;
	chips: string[];
	signals: string[];
	theme: "mission" | "fusion" | "delta";
	overlayModules: GeoMapExperimentModuleSpec[];
}) {
	return (
		<section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#08111d] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.4)]">
			<div
				className={cn(
					"absolute inset-0",
					theme === "mission" &&
						"bg-[radial-gradient(circle_at_25%_20%,rgba(14,165,233,0.22),transparent_32%),radial-gradient(circle_at_70%_25%,rgba(168,85,247,0.16),transparent_28%),linear-gradient(180deg,#0b1526,#060c16)]",
					theme === "fusion" &&
						"bg-[radial-gradient(circle_at_20%_18%,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(16,185,129,0.18),transparent_26%),radial-gradient(circle_at_55%_80%,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,#0b1526,#050913)]",
					theme === "delta" &&
						"bg-[radial-gradient(circle_at_20%_18%,rgba(244,63,94,0.18),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(251,146,60,0.18),transparent_24%),radial-gradient(circle_at_55%_85%,rgba(45,212,191,0.12),transparent_26%),linear-gradient(180deg,#120d16,#050913)]",
				)}
			/>
			<div className="pointer-events-none absolute inset-x-8 top-8 h-[62%] rounded-full border border-white/8 opacity-80" />
			<div className="pointer-events-none absolute inset-x-16 top-16 h-[46%] rounded-full border border-white/6 opacity-70" />
			<div className="pointer-events-none absolute left-1/2 top-[18%] h-[54%] w-[1px] -translate-x-1/2 bg-white/10" />
			<div className="pointer-events-none absolute inset-y-8 left-1/2 w-[46%] -translate-x-1/2 rounded-[50%] border border-cyan-400/15" />

			<div className="relative flex min-h-[28rem] flex-col gap-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<div className="mb-2 flex items-center gap-2 text-cyan-100">
							<div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 p-2">
								<Globe2 className="size-4" />
							</div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
								GeoMap Experiment Stage
							</p>
						</div>
						<h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
						<p className="mt-2 max-w-2xl text-sm text-slate-300">{subtitle}</p>
					</div>
					<div className="grid gap-2 rounded-3xl border border-white/10 bg-black/20 p-3 text-xs text-slate-200">
						<div className="flex items-center gap-2">
							<Radar className="size-4 text-cyan-300" />
							<span>Layer fusion active</span>
						</div>
						<div className="flex items-center gap-2">
							<Crosshair className="size-4 text-fuchsia-300" />
							<span>Selection linked</span>
						</div>
						<div className="flex items-center gap-2">
							<ScanSearch className="size-4 text-emerald-300" />
							<span>Timeline-focused markers</span>
						</div>
						<div className="flex items-center gap-2">
							<Layers3 className="size-4 text-amber-300" />
							<span>Dock persistence visible</span>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{chips.map((chip) => (
						<ViewportChip key={chip} label={chip} />
					))}
				</div>

				<div className="mt-auto grid gap-3 md:grid-cols-4">
					{signals.map((signal) => (
						<div
							key={signal}
							className="rounded-3xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-100 backdrop-blur"
						>
							{signal}
						</div>
					))}
				</div>
			</div>
			<GeoMapExperimentOverlayDock modules={overlayModules} />
		</section>
	);
}
