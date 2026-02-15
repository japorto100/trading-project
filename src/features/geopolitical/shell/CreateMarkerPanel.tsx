import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { GeoConfidence, GeoSeverity } from "@/lib/geopolitical/types";

interface CreateMarkerPanelProps {
	pendingPoint: { lat: number; lng: number } | null;
	draftTitle: string;
	draftSummary: string;
	draftNote: string;
	draftSeverity: GeoSeverity;
	draftConfidence: GeoConfidence;
	drawingMode: "marker" | "line" | "polygon" | "text";
	busy: boolean;
	onDraftTitleChange: (value: string) => void;
	onDraftSummaryChange: (value: string) => void;
	onDraftNoteChange: (value: string) => void;
	onDraftSeverityChange: (value: GeoSeverity) => void;
	onDraftConfidenceChange: (value: GeoConfidence) => void;
	onSetPoint: (coords: { lat: number; lng: number }) => void;
	onCreate: () => void;
	onClear: () => void;
}

export function CreateMarkerPanel({
	pendingPoint,
	draftTitle,
	draftSummary,
	draftNote,
	draftSeverity,
	draftConfidence,
	drawingMode,
	busy,
	onDraftTitleChange,
	onDraftSummaryChange,
	onDraftNoteChange,
	onDraftSeverityChange,
	onDraftConfidenceChange,
	onSetPoint,
	onCreate,
	onClear,
}: CreateMarkerPanelProps) {
	const [manualLat, setManualLat] = useState("");
	const [manualLng, setManualLng] = useState("");

	useEffect(() => {
		if (!pendingPoint) return;
		setManualLat(String(pendingPoint.lat));
		setManualLng(String(pendingPoint.lng));
	}, [pendingPoint]);

	const handleSetManualPoint = () => {
		const lat = Number(manualLat);
		const lng = Number(manualLng);
		if (!Number.isFinite(lat) || lat < -90 || lat > 90) return;
		if (!Number.isFinite(lng) || lng < -180 || lng > 180) return;
		onSetPoint({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
	};

	return (
		<section className="mb-4 rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">Create Marker</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				Mode must be marker. Select symbol, click map, or enter coordinates manually.
			</p>

			<div className="mt-3 space-y-2">
				<label className="block text-xs font-medium text-muted-foreground">Coordinates</label>
				<div className="rounded-md border border-border bg-background px-2 py-1 text-xs">
					{pendingPoint
						? `${pendingPoint.lat.toFixed(4)}, ${pendingPoint.lng.toFixed(4)}`
						: "No point selected yet"}
				</div>
				<div className="grid grid-cols-2 gap-2">
					<Input
						value={manualLat}
						onChange={(event) => setManualLat(event.target.value)}
						placeholder="Latitude (-90..90)"
						aria-label="Manual latitude for marker point"
					/>
					<Input
						value={manualLng}
						onChange={(event) => setManualLng(event.target.value)}
						placeholder="Longitude (-180..180)"
						aria-label="Manual longitude for marker point"
					/>
				</div>
				<Button size="sm" variant="outline" onClick={handleSetManualPoint} disabled={busy}>
					Set coordinates manually
				</Button>

				<label className="block text-xs font-medium text-muted-foreground">Title</label>
				<Input
					value={draftTitle}
					onChange={(event) => onDraftTitleChange(event.target.value)}
					placeholder="Marker title"
					aria-label="Marker title"
				/>

				<div className="grid grid-cols-2 gap-2">
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">Severity</label>
						<select
							className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
							value={draftSeverity}
							onChange={(event) => onDraftSeverityChange(Number(event.target.value) as GeoSeverity)}
							aria-label="Marker severity"
						>
							{[1, 2, 3, 4, 5].map((value) => (
								<option key={value} value={value}>
									S{value}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="mb-1 block text-xs font-medium text-muted-foreground">
							Confidence
						</label>
						<select
							className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
							value={draftConfidence}
							onChange={(event) =>
								onDraftConfidenceChange(Number(event.target.value) as GeoConfidence)
							}
							aria-label="Marker confidence"
						>
							{[0, 1, 2, 3, 4].map((value) => (
								<option key={value} value={value}>
									C{value}
								</option>
							))}
						</select>
					</div>
				</div>

				<label className="block text-xs font-medium text-muted-foreground">Summary</label>
				<Textarea
					value={draftSummary}
					onChange={(event) => onDraftSummaryChange(event.target.value)}
					rows={3}
					placeholder="Short context for this event"
					aria-label="Marker summary"
				/>

				<label className="block text-xs font-medium text-muted-foreground">Analyst note</label>
				<Textarea
					value={draftNote}
					onChange={(event) => onDraftNoteChange(event.target.value)}
					rows={3}
					placeholder="Optional analyst note"
					aria-label="Marker analyst note"
				/>

				<div className="flex gap-2">
					<Button
						size="sm"
						onClick={onCreate}
						disabled={busy || !pendingPoint || drawingMode !== "marker"}
						aria-label="Create marker"
					>
						<Plus className="mr-2 h-4 w-4" />
						Create
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={onClear}
						disabled={busy}
						aria-label="Clear marker draft"
					>
						Clear
					</Button>
				</div>
			</div>
		</section>
	);
}
