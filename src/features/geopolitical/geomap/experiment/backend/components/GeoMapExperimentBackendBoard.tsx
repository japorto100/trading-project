"use client";

import { BrainCircuit, GitBranch, RefreshCw, ShieldCheck } from "lucide-react";

import type { GeoBackendOption, GeoBackendPrimaryRuntime } from "../types";

const runtimeChipClasses: Record<GeoBackendPrimaryRuntime, string> = {
	go: "border-sky-400/35 bg-sky-500/10 text-sky-100",
	python: "border-emerald-400/35 bg-emerald-500/10 text-emerald-100",
	rust: "border-orange-400/35 bg-orange-500/10 text-orange-100",
};

function RuntimeChip({ label, runtime }: { label: string; runtime: GeoBackendPrimaryRuntime }) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${runtimeChipClasses[runtime]}`}
		>
			{label}
		</span>
	);
}

function RoleBlock({
	title,
	items,
	runtime,
}: {
	title: string;
	items: string[];
	runtime: GeoBackendPrimaryRuntime;
}) {
	return (
		<div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
			<div className="mb-3 flex items-center justify-between gap-3">
				<p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
					{title}
				</p>
				<RuntimeChip label={runtime} runtime={runtime} />
			</div>
			<div className="space-y-2">
				{items.map((item) => (
					<div
						key={item}
						className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-slate-200"
					>
						{item}
					</div>
				))}
			</div>
		</div>
	);
}

export function GeoMapExperimentBackendBoard({ options }: { options: GeoBackendOption[] }) {
	return (
		<div className="space-y-6">
			<div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,31,0.96),rgba(6,10,18,0.98))] p-5">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="max-w-4xl">
						<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
							Backend runtime options
						</p>
						<h2 className="text-xl font-semibold text-white">
							Go / Python / Rust experiment runtime lanes
						</h2>
						<p className="mt-2 text-sm text-slate-300">
							These are not production commits. They are experiment-ready backend options so shell
							and panel decisions can be judged against plausible replay, polling, and
							relation-runtime models in our actual stack.
						</p>
					</div>
					<div className="grid gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
						<div className="flex items-center gap-2">
							<ShieldCheck className="size-4 text-sky-300" />
							<span>Go remains the public contract boundary</span>
						</div>
						<div className="flex items-center gap-2">
							<RefreshCw className="size-4 text-emerald-300" />
							<span>Replay and freshness are explicit runtime concerns</span>
						</div>
						<div className="flex items-center gap-2">
							<BrainCircuit className="size-4 text-orange-300" />
							<span>Rust only enters measured hot paths</span>
						</div>
						<div className="flex items-center gap-2">
							<GitBranch className="size-4 text-fuchsia-300" />
							<span>Graph runtime stays optional and analyst-gated</span>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-6">
				{options.map((option) => (
					<section
						key={option.id}
						className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,34,0.96),rgba(7,11,20,0.98))] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.3)]"
					>
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.09),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.06),transparent_30%)]" />
						<div className="relative space-y-5">
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div className="max-w-4xl">
									<h3 className="text-lg font-semibold text-white">{option.name}</h3>
									<p className="mt-2 text-sm text-slate-300">{option.summary}</p>
									<p className="mt-3 text-xs text-slate-400">Best fit: {option.fit}</p>
								</div>
								<div className="max-w-xl rounded-[1.35rem] border border-white/10 bg-black/20 p-4 text-xs text-slate-200">
									<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
										Guardrails
									</p>
									<div className="space-y-1.5">
										{option.guardrails.map((guardrail) => (
											<p key={guardrail}>{guardrail}</p>
										))}
									</div>
								</div>
							</div>

							<div className="grid gap-4 xl:grid-cols-3">
								<RoleBlock title="Go role" items={option.goRole} runtime="go" />
								<RoleBlock title="Python role" items={option.pythonRole} runtime="python" />
								<RoleBlock title="Rust role" items={option.rustRole} runtime="rust" />
							</div>

							<div className="grid gap-4 xl:grid-cols-3">
								{option.capabilities.map((capability) => (
									<div
										key={capability.id}
										className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4"
									>
										<div className="mb-3 flex items-center justify-between gap-3">
											<div>
												<h4 className="text-sm font-semibold text-white">{capability.title}</h4>
												<p className="mt-1 text-xs text-slate-400">{capability.summary}</p>
											</div>
											<RuntimeChip label={capability.owner} runtime={capability.owner} />
										</div>
										<div className="space-y-2">
											{capability.items.map((item) => (
												<div
													key={item}
													className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-slate-200"
												>
													{item}
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
