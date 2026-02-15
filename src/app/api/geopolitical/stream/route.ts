import type { NextRequest } from "next/server";
import { listGeoCandidates } from "@/lib/server/geopolitical-candidates-store";
import { listGeoEvents } from "@/lib/server/geopolitical-events-store";
import { listGeoTimeline } from "@/lib/server/geopolitical-timeline-store";

export const runtime = "nodejs";

function toSseMessage(type: string, payload: unknown): string {
	return `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export async function GET(request: NextRequest) {
	const encoder = new TextEncoder();
	let heartbeatTimer: NodeJS.Timeout | null = null;

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let lastSnapshot = "";

			const publishSnapshot = async () => {
				try {
					const [events, candidates, timeline] = await Promise.all([
						listGeoEvents(),
						listGeoCandidates({ state: "open" }),
						listGeoTimeline(undefined, 40),
					]);

					const snapshotPayload = {
						eventCount: events.length,
						openCandidateCount: candidates.length,
						latestTimelineId: timeline[0]?.id ?? null,
						latestEventId: events[0]?.id ?? null,
						latestCandidateId: candidates[0]?.id ?? null,
					};
					const snapshot = JSON.stringify(snapshotPayload);

					if (!lastSnapshot) {
						controller.enqueue(encoder.encode(toSseMessage("ready", snapshotPayload)));
						lastSnapshot = snapshot;
						return;
					}

					if (snapshot !== lastSnapshot) {
						const parsed = snapshotPayload as {
							eventCount: number;
							openCandidateCount: number;
							latestTimelineId: string | null;
							latestEventId: string | null;
							latestCandidateId: string | null;
						};
						const previous = JSON.parse(lastSnapshot) as {
							eventCount: number;
							openCandidateCount: number;
							latestTimelineId: string | null;
							latestEventId: string | null;
							latestCandidateId: string | null;
						};
						if (parsed.latestCandidateId !== previous.latestCandidateId) {
							const candidateEventType =
								parsed.openCandidateCount > previous.openCandidateCount
									? "candidate.new"
									: "candidate.updated";
							controller.enqueue(encoder.encode(toSseMessage(candidateEventType, parsed)));
						}
						if (parsed.latestEventId !== previous.latestEventId) {
							controller.enqueue(encoder.encode(toSseMessage("event.updated", parsed)));
						}
						if (parsed.latestTimelineId !== previous.latestTimelineId) {
							controller.enqueue(encoder.encode(toSseMessage("timeline.appended", parsed)));
						}
						lastSnapshot = snapshot;
					}
				} catch {
					controller.enqueue(
						encoder.encode(
							toSseMessage("error", {
								message: "snapshot_failed",
								at: new Date().toISOString(),
							}),
						),
					);
				}
			};

			void publishSnapshot();
			heartbeatTimer = setInterval(() => {
				void publishSnapshot();
			}, 5000);

			request.signal.addEventListener("abort", () => {
				if (heartbeatTimer) {
					clearInterval(heartbeatTimer);
				}
				controller.close();
			});
		},
		cancel() {
			if (heartbeatTimer) {
				clearInterval(heartbeatTimer);
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache, no-transform",
			Connection: "keep-alive",
		},
	});
}
