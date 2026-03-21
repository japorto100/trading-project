"use client";

import { MapIcon, Radar, Rows4, TrendingUp } from "lucide-react";

import type { GeoFlatExperimentOption } from "../types";

function FlatIcon({ id }: { id: string }) {
	switch (id) {
		case "operator-flat":
			return <Rows4 className="size-4" />;
		case "delta-macro-flat":
			return <TrendingUp className="size-4" />;
		default:
			return <MapIcon className="size-4" />;
	}
}

export function GeoMapFlatExperimentBoard({ options }: { options: GeoFlatExperimentOption[] }) {
	return (
		<div className="space-y-6">
			<div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,17,31,0.96),rgba(5,9,18,0.98))] p-5">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="max-w-4xl">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
							Flat workspace options
						</p>
						<h2 className="text-xl font-semibold text-white">Clone-derived Flat mode candidates</h2>
						<p className="mt-2 text-sm text-slate-300">
							These are dedicated Flat-mode experiment lanes so we do not judge the future
							operational map only through a mixed shell variant.
						</p>
					</div>
					<div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
						<div className="flex items-center gap-2">
							<Radar className="size-4 text-cyan-300" />
							<span>Compare shell rhythm, operator density, and market linkage directly</span>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				{options.map((option) => (
					<section
						key={option.id}
						className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,34,0.96),rgba(7,11,20,0.98))] p-5"
					>
						<div className="mb-4 flex items-start gap-3">
							<div className="rounded-full border border-white/10 bg-white/5 p-2 text-white">
								<FlatIcon id={option.id} />
							</div>
							<div>
								<h3 className="text-base font-semibold text-white">{option.name}</h3>
								<p className="mt-1 text-xs text-slate-400">
									Derived from: {option.derivedFrom.join(", ")}
								</p>
							</div>
						</div>

						<p className="mb-4 text-sm text-slate-300">{option.fit}</p>

						<div className="space-y-4">
							<div>
								<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
									Strengths
								</p>
								<div className="space-y-2">
									{option.strengths.map((item) => (
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
									Risks
								</p>
								<div className="space-y-2">
									{option.risks.map((item) => (
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
									Promote if
								</p>
								<div className="space-y-2">
									{option.promoteIf.map((item) => (
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
