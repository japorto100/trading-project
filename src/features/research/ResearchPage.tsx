"use client";

import { FileText, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGlobalChat } from "@/features/agent-chat/context/GlobalChatContext";
import { buildResearchContext } from "@/lib/chat-context-builders";
import { EventLaneCard } from "./components/EventLaneCard";
import { MatterCard } from "./components/MatterCard";
import { NarrativeCard } from "./components/NarrativeCard";
import { ResearchActionRail } from "./components/ResearchActionRail";
import { ResearchHero } from "./components/ResearchHero";
import { ResearchPageSkeleton } from "./components/ResearchPageSkeleton";
import { ResearchStatusBanner } from "./components/ResearchStatusBanner";
import { useResearchHome } from "./hooks/useResearchHome";

export function ResearchPage() {
	const query = useResearchHome();
	// FC4: chat context injection
	const { open: chatOpen, setChatContext } = useGlobalChat();
	const prevChatOpenRef = useRef(false);

	// FC4: inject Research context when chat opens (hooks before early returns)
	useEffect(() => {
		if (chatOpen && !prevChatOpenRef.current && query.data) {
			const { payload, degraded } = query.data;
			setChatContext(
				buildResearchContext(
					payload.marketSummary.regime,
					payload.marketSummary.confidence,
					degraded,
				),
			);
		}
		prevChatOpenRef.current = chatOpen;
	}, [chatOpen, query.data, setChatContext]);

	if (query.isLoading) {
		return <ResearchPageSkeleton />;
	}

	if (query.isError || !query.data) {
		return (
			<div className="min-h-full overflow-y-auto bg-background">
				<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-6">
					<Alert variant="destructive">
						<AlertTitle>Research surface unavailable</AlertTitle>
						<AlertDescription>
							{query.error instanceof Error ? query.error.message : "Research home failed to load."}
						</AlertDescription>
					</Alert>
				</div>
			</div>
		);
	}

	const { payload, degraded, degradedReasons, moduleStates, source } = query.data;

	return (
		<div className="min-h-full overflow-y-auto bg-background">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
				<ResearchStatusBanner
					degraded={degraded}
					degradedReasons={degradedReasons}
					moduleStates={moduleStates}
					source={source}
				/>
				<ResearchHero
					regime={payload.marketSummary.regime}
					confidence={payload.marketSummary.confidence}
					freshnessLabel={payload.marketSummary.freshnessLabel}
				/>

				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
					<div className="space-y-6">
						<section className="space-y-3">
							<div className="flex items-center gap-2">
								<Sparkles className="h-4 w-4 text-emerald-400" />
								<h2 className="text-lg font-semibold text-foreground">What Matters Now</h2>
							</div>
							<div className="grid gap-4 lg:grid-cols-3">
								{payload.mattersNow.map((item) => (
									<MatterCard key={item.id} item={item} />
								))}
							</div>
						</section>

						<section className="grid gap-6 lg:grid-cols-2">
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<FileText className="h-4 w-4 text-sky-400" />
									<h2 className="text-lg font-semibold text-foreground">Event Intelligence Lane</h2>
								</div>
								<div className="space-y-4">
									{payload.eventLane.map((item) => (
										<EventLaneCard key={item.id} item={item} />
									))}
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<ShieldAlert className="h-4 w-4 text-amber-300" />
									<h2 className="text-lg font-semibold text-foreground">
										Narrative And Volatility Lane
									</h2>
								</div>
								<div className="space-y-4">
									{payload.narrativeLane.map((item) => (
										<NarrativeCard key={item.id} item={item} />
									))}
								</div>
							</div>
						</section>
					</div>

					<ResearchActionRail items={payload.actionRail} />
				</div>
			</div>
		</div>
	);
}
