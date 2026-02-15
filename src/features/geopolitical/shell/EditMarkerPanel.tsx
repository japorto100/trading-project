import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type EditFormState, formatPoint } from "@/features/geopolitical/shell/types";
import type {
	GeoConfidence,
	GeoEvent,
	GeoEventStatus,
	GeoSeverity,
} from "@/lib/geopolitical/types";

interface EditMarkerPanelProps {
	selectedEvent: GeoEvent | null;
	editForm: EditFormState;
	busy: boolean;
	onEditFormChange: (next: EditFormState) => void;
	onSave: () => void;
	onDelete: () => void;
}

export function EditMarkerPanel({
	selectedEvent,
	editForm,
	busy,
	onEditFormChange,
	onSave,
	onDelete,
}: EditMarkerPanelProps) {
	return (
		<section className="mb-4 rounded-md border border-border bg-card p-3">
			<h2 className="text-sm font-semibold">Edit Marker</h2>
			{selectedEvent ? (
				<div className="mt-3 space-y-2">
					<div className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
						{selectedEvent.symbol} | {formatPoint(selectedEvent)}
					</div>
					<Input
						value={editForm.title}
						onChange={(event) => onEditFormChange({ ...editForm, title: event.target.value })}
						placeholder="Marker title"
						aria-label="Edit marker title"
					/>

					<div className="grid grid-cols-3 gap-2">
						<div>
							<label className="mb-1 block text-xs font-medium text-muted-foreground">
								Severity
							</label>
							<select
								className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
								value={editForm.severity}
								onChange={(event) =>
									onEditFormChange({
										...editForm,
										severity: Number(event.target.value) as GeoSeverity,
									})
								}
								aria-label="Edit marker severity"
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
								value={editForm.confidence}
								onChange={(event) =>
									onEditFormChange({
										...editForm,
										confidence: Number(event.target.value) as GeoConfidence,
									})
								}
								aria-label="Edit marker confidence"
							>
								{[0, 1, 2, 3, 4].map((value) => (
									<option key={value} value={value}>
										C{value}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
							<select
								className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
								value={editForm.status}
								onChange={(event) =>
									onEditFormChange({
										...editForm,
										status: event.target.value as GeoEventStatus,
									})
								}
								aria-label="Edit marker status"
							>
								<option value="candidate">candidate</option>
								<option value="confirmed">confirmed</option>
								<option value="persistent">persistent</option>
								<option value="archived">archived</option>
							</select>
						</div>
					</div>

					<label className="block text-xs font-medium text-muted-foreground">Summary</label>
					<Textarea
						value={editForm.summary}
						onChange={(event) => onEditFormChange({ ...editForm, summary: event.target.value })}
						rows={3}
						placeholder="Summary"
						aria-label="Edit marker summary"
					/>

					<label className="block text-xs font-medium text-muted-foreground">Analyst note</label>
					<Textarea
						value={editForm.analystNote}
						onChange={(event) => onEditFormChange({ ...editForm, analystNote: event.target.value })}
						rows={3}
						placeholder="Analyst note"
						aria-label="Edit marker analyst note"
					/>

					<div className="flex gap-2">
						<Button size="sm" onClick={onSave} disabled={busy} aria-label="Save marker changes">
							<Save className="mr-2 h-4 w-4" />
							Save
						</Button>
						<Button
							size="sm"
							variant="destructive"
							onClick={onDelete}
							disabled={busy}
							aria-label="Delete selected marker"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</Button>
					</div>
				</div>
			) : (
				<p className="mt-2 text-xs text-muted-foreground">
					Select a marker on the map or from the list below.
				</p>
			)}
		</section>
	);
}
