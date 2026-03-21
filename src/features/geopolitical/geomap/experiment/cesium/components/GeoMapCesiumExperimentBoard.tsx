"use client";

import { Mountain, Orbit, TimerReset } from "lucide-react";
import type { GeoCesiumExperimentOption } from "../types";
import { GeoMapCesiumScene } from "./GeoMapCesiumScene";

function CesiumIcon({ id }: { id: string }) {
	switch (id) {
		case "scene-sidecar":
			return <Orbit className="size-4" />;
		case "hybrid-tiles-track":
			return <Mountain className="size-4" />;
		default:
			return <TimerReset className="size-4" />;
	}
}

export function GeoMapCesiumExperimentBoard({ options }: { options: GeoCesiumExperimentOption[] }) {
	return (
		<div className="space-y-6">
			<div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,17,31,0.96),rgba(5,9,18,0.98))] p-5">
				<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
					Cesium sidecar track
				</p>
				<h2 className="text-xl font-semibold text-white">Scene runtime experiment</h2>
				<p className="mt-2 text-sm text-slate-300">
					These options help us decide whether `CesiumJS` belongs as a sidecar scene mode, a hybrid
					experiment, or a deliberate deferral while Globe/Flat mature further.
				</p>
			</div>

			<GeoMapCesiumScene />

			<div className="grid gap-4 xl:grid-cols-3">
				{options.map((option) => (
					<section
						key={option.id}
						className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,34,0.96),rgba(7,11,20,0.98))] p-5"
					>
						<div className="mb-4 flex items-start gap-3">
							<div className="rounded-full border border-white/10 bg-white/5 p-2 text-white">
								<CesiumIcon id={option.id} />
							</div>
							<div>
								<h3 className="text-base font-semibold text-white">{option.name}</h3>
								<p className="mt-1 text-sm text-slate-300">{option.fit}</p>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
									Capabilities
								</p>
								<div className="space-y-2">
									{option.capabilities.map((item) => (
										<div
											key={item}
											className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-slate-200"
										>
											{item}
										</div>
									))}
								</div>
							</div>
							<div>
								<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
									Costs
								</p>
								<div className="space-y-2">
									{option.costs.map((item) => (
										<div
											key={item}
											className="rounded-2xl border border-amber-400/20 bg-amber-500/8 px-3 py-2 text-xs text-amber-100"
										>
											{item}
										</div>
									))}
								</div>
							</div>
							<div>
								<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
									Decision rule
								</p>
								<div className="space-y-2">
									{option.decisionRule.map((item) => (
										<div
											key={item}
											className="rounded-2xl border border-emerald-400/20 bg-emerald-500/8 px-3 py-2 text-xs text-emerald-100"
										>
											{item}
										</div>
									))}
								</div>
							</div>
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
