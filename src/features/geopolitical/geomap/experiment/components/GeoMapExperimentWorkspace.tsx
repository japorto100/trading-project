"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import type { GeoMapExperimentVariant } from "../types";
import { GeoMapExperimentPanelFrame } from "./GeoMapExperimentPanelFrame";
import {
	GeoMapExperimentRuntimeModules,
	GeoMapExperimentSupportGrid,
	GeoMapExperimentTopbarModules,
} from "./GeoMapExperimentSupportModules";
import { GeoMapExperimentViewportMock } from "./GeoMapExperimentViewportMock";

function PanelStack({
	title,
	panels,
}: {
	title: string;
	panels: GeoMapExperimentVariant["leftRail"];
}) {
	return (
		<div className="flex h-full flex-col gap-3">
			<p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
				{title}
			</p>
			<div className="grid gap-3">
				{panels.map((panel) => (
					<GeoMapExperimentPanelFrame key={panel.id} panel={panel} />
				))}
			</div>
		</div>
	);
}

export function GeoMapExperimentWorkspace({
	variant,
	viewportTheme,
}: {
	variant: GeoMapExperimentVariant;
	viewportTheme: "mission" | "fusion" | "delta";
}) {
	const topbarModules = variant.supportModules.filter((module) => module.placement === "topbar");
	const runtimeModules = variant.supportModules.filter((module) => module.placement === "runtime");
	const supportModules = variant.supportModules.filter((module) => module.placement === "support");
	const overlayModules = variant.supportModules.filter((module) => module.placement === "overlay");

	return (
		<div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#060d17] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
			<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
				<div>
					<h2 className="text-xl font-semibold text-white">{variant.name}</h2>
					<p className="mt-2 max-w-4xl text-sm text-slate-300">{variant.summary}</p>
				</div>
				<div className="max-w-xl rounded-3xl border border-white/10 bg-white/4 p-4 text-xs text-slate-200">
					<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
						Guardrails
					</p>
					<div className="space-y-1.5">
						{variant.guardrails.map((guardrail) => (
							<p key={guardrail}>{guardrail}</p>
						))}
					</div>
				</div>
			</div>

			<div className="space-y-6">
				<GeoMapExperimentTopbarModules modules={topbarModules} />
				<GeoMapExperimentRuntimeModules modules={runtimeModules} />

				<ResizablePanelGroup direction="horizontal" className="min-h-[68rem] gap-0">
					<ResizablePanel defaultSize={20} minSize={16}>
						<PanelStack title="Left Control Rail" panels={variant.leftRail} />
					</ResizablePanel>
					<ResizableHandle withHandle className="mx-2 bg-white/10" />
					<ResizablePanel defaultSize={46} minSize={34}>
						<ResizablePanelGroup direction="vertical">
							<ResizablePanel defaultSize={68} minSize={44}>
								<GeoMapExperimentViewportMock
									title={variant.name}
									subtitle={variant.rationale.join(" ")}
									chips={variant.viewportChips}
									signals={variant.viewportSignals}
									theme={viewportTheme}
									overlayModules={overlayModules}
								/>
							</ResizablePanel>
							<ResizableHandle withHandle className="my-2 bg-white/10" />
							<ResizablePanel defaultSize={32} minSize={24}>
								<PanelStack title="Bottom Workspace Strip" panels={variant.bottomRail} />
							</ResizablePanel>
						</ResizablePanelGroup>
					</ResizablePanel>
					<ResizableHandle withHandle className="mx-2 bg-white/10" />
					<ResizablePanel defaultSize={34} minSize={24}>
						<ResizablePanelGroup direction="vertical">
							<ResizablePanel defaultSize={62} minSize={40}>
								<PanelStack title="Right Primary Workspace" panels={variant.rightPrimary} />
							</ResizablePanel>
							<ResizableHandle withHandle className="my-2 bg-white/10" />
							<ResizablePanel defaultSize={38} minSize={24}>
								<PanelStack title="Right Secondary Workspace" panels={variant.rightSecondary} />
							</ResizablePanel>
						</ResizablePanelGroup>
					</ResizablePanel>
				</ResizablePanelGroup>

				<GeoMapExperimentSupportGrid modules={supportModules} />
			</div>
		</div>
	);
}
