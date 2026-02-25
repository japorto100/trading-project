import { type NextRequest, NextResponse } from "next/server";
import { listGeoCandidates } from "@/lib/server/geopolitical-candidates-store";
import { listGeoContradictions } from "@/lib/server/geopolitical-contradictions-store";
import { listGeoEvents } from "@/lib/server/geopolitical-events-store";
import { listGeoTimeline } from "@/lib/server/geopolitical-timeline-store";

type ExportFormat = "json" | "csv";

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as {
			format?: ExportFormat;
			regionLabel?: string;
			includeItems?: boolean;
		};
		const format: ExportFormat = body.format === "csv" ? "csv" : "json";
		const includeItems = body.includeItems !== false;

		const [events, candidates, contradictions, timeline] = await Promise.all([
			listGeoEvents(),
			listGeoCandidates(),
			listGeoContradictions(),
			listGeoTimeline(undefined, 500),
		]);

		if (format === "csv") {
			const lines = [
				"metric,value",
				`region,"${String(body.regionLabel ?? "All regions").replaceAll('"', '""')}"`,
				`events,${events.length}`,
				`candidates,${candidates.length}`,
				`contradictions,${contradictions.length}`,
				`timeline,${timeline.length}`,
				`open_candidates,${candidates.filter((item) => item.state === "open").length}`,
				`open_contradictions,${contradictions.filter((item) => item.state === "open").length}`,
			];
			return NextResponse.json({
				success: true,
				filename: `geomap-summary-${Date.now()}.csv`,
				mimeType: "text/csv;charset=utf-8",
				content: lines.join("\n"),
			});
		}

		return NextResponse.json({
			success: true,
			filename: `geomap-export-${Date.now()}.json`,
			mimeType: "application/json",
			content: JSON.stringify(
				{
					generatedAt: new Date().toISOString(),
					region: body.regionLabel ?? "All regions",
					counts: {
						events: events.length,
						candidates: candidates.length,
						contradictions: contradictions.length,
						timeline: timeline.length,
					},
					items: includeItems
						? {
								events: events.slice(0, 200),
								candidates: candidates.slice(0, 200),
								contradictions: contradictions.slice(0, 100),
								timeline: timeline.slice(0, 200),
							}
						: undefined,
				},
				null,
				2,
			),
		});
	} catch (error: unknown) {
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : "export failed" },
			{ status: 400 },
		);
	}
}
