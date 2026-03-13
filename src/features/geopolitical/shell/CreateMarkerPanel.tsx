import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parseLatitudeInput, parseLongitudeInput } from "@/features/geopolitical/drawing-workflow";
import type { GeoConfidence, GeoSeverity } from "@/lib/geopolitical/types";

interface CreateMarkerPanelProps {
	pendingPoint: { lat: number; lng: number } | null;
	draftTitle: string;
	draftSummary: string;
	draftNote: string;
	draftSeverity: GeoSeverity;
	draftConfidence: GeoConfidence;
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
	const latitudeInput = parseLatitudeInput(manualLat);
	const longitudeInput = parseLongitudeInput(manualLng);
	const manualCoordinateError = latitudeInput.error ?? longitudeInput.error;

	useEffect(() => {
		if (!pendingPoint) return;
		setManualLat(String(pendingPoint.lat));
		setManualLng(String(pendingPoint.lng));
	}, [pendingPoint]);

	const handleSetManualPoint = () => {
		if (latitudeInput.value === null || longitudeInput.value === null) return;
		onSetPoint({ lat: latitudeInput.value, lng: longitudeInput.value });
	};

	return (
		<section className="mb-4 rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">Create Marker</h2>
			<p className="mt-1 text-xs text-muted-foreground">
				Select symbol, click map, or enter coordinates manually.
			</p>

			<div className="mt-3 space-y-2">
				<div className="rounded-md border border-border bg-background/70 px-2 py-2 text-[11px] text-muted-foreground">
					{pendingPoint
						? "Point locked. Review the fields and create the marker, or replace the point manually."
						: "Step 1: click the globe or enter coordinates. Step 2: fill title and severity. Step 3: create the marker."}
				</div>
				<label
					className="block text-xs font-medium text-muted-foreground"
					htmlFor="marker-coordinates-display"
				>
					Coordinates
				</label>
				<div
					id="marker-coordinates-display"
					className="rounded-md border border-border bg-background px-2 py-1 text-xs"
				>
					{pendingPoint
						? `${pendingPoint.lat.toFixed(4)}, ${pendingPoint.lng.toFixed(4)}`
						: "No point selected yet"}
				</div>
				<div className="grid grid-cols-2 gap-2">
					<Input
						id="marker-manual-latitude"
						name="markerManualLatitude"
						value={manualLat}
						onChange={(event) => setManualLat(event.target.value)}
						placeholder="Latitude (-90..90)"
						aria-label="Manual latitude for marker point"
					/>
					<Input
						id="marker-manual-longitude"
						name="markerManualLongitude"
						value={manualLng}
						onChange={(event) => setManualLng(event.target.value)}
						placeholder="Longitude (-180..180)"
						aria-label="Manual longitude for marker point"
					/>
				</div>
				<Button size="sm" variant="outline" onClick={handleSetManualPoint} disabled={busy}>
					Set coordinates manually
				</Button>
				{manualCoordinateError ? (
					<p className="text-[11px] text-red-400">{manualCoordinateError}</p>
				) : null}

				<label className="block text-xs font-medium text-muted-foreground" htmlFor="marker-title">
					Title
				</label>
				<Input
					id="marker-title"
					name="markerTitle"
					value={draftTitle}
					onChange={(event) => onDraftTitleChange(event.target.value)}
					placeholder="Marker title"
					aria-label="Marker title"
				/>

				<div className="grid grid-cols-2 gap-2">
					<div>
						<label
							className="mb-1 block text-xs font-medium text-muted-foreground"
							htmlFor="marker-severity"
						>
							Severity
						</label>
						<select
							id="marker-severity"
							name="markerSeverity"
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
						<label
							className="mb-1 block text-xs font-medium text-muted-foreground"
							htmlFor="marker-confidence"
						>
							Confidence
						</label>
						<select
							id="marker-confidence"
							name="markerConfidence"
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

				<label className="block text-xs font-medium text-muted-foreground" htmlFor="marker-summary">
					Summary
				</label>
				<Textarea
					id="marker-summary"
					name="markerSummary"
					value={draftSummary}
					onChange={(event) => onDraftSummaryChange(event.target.value)}
					rows={3}
					placeholder="Short context for this event"
					aria-label="Marker summary"
				/>

				<label
					className="block text-xs font-medium text-muted-foreground"
					htmlFor="marker-analyst-note"
				>
					Analyst note
				</label>
				<Textarea
					id="marker-analyst-note"
					name="markerAnalystNote"
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
						disabled={busy || !pendingPoint}
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
