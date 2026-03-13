"use client";

import type { ExportFormat } from "@/features/geopolitical/phase12/types";

interface Phase12ExportsSectionProps {
	selectedExportFormat: ExportFormat;
	setSelectedExportFormat: (value: ExportFormat) => void;
	exportBusy: boolean;
	exportMessage: string | null;
	onExport: () => void;
}

export function Phase12ExportsSection(props: Phase12ExportsSectionProps) {
	return (
		<section className="rounded border border-border bg-background p-2">
			<div className="mb-2 flex items-center justify-between">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					12d Exports
				</h3>
				<span className="text-[10px] text-muted-foreground">Server JSON/CSV + client PNG/PDF</span>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<label htmlFor="phase12-export-format" className="sr-only">
					Export format
				</label>
				<select
					id="phase12-export-format"
					name="phase12_export_format"
					className="rounded border border-border bg-background px-2 py-1 text-xs"
					value={props.selectedExportFormat}
					onChange={(event) => props.setSelectedExportFormat(event.target.value as ExportFormat)}
				>
					<option value="json">JSON snapshot</option>
					<option value="csv">CSV summary</option>
					<option value="png">PNG snapshot</option>
					<option value="pdf">PDF snapshot</option>
				</select>
				<button
					type="button"
					className="rounded border border-border px-2 py-1 text-xs hover:bg-muted/50 disabled:opacity-50"
					disabled={props.exportBusy}
					onClick={props.onExport}
				>
					{props.exportBusy ? "Exporting..." : `Export ${props.selectedExportFormat.toUpperCase()}`}
				</button>
				{props.exportMessage ? (
					<span className="text-[11px] text-muted-foreground">{props.exportMessage}</span>
				) : null}
			</div>
			<p className="mt-2 text-[11px] text-muted-foreground">
				JSON/CSV snapshots run through a transitional server export endpoint. PNG/PDF snapshots are
				captured from the active viewport in the browser; signed export jobs and storage-backed
				exports remain backend work.
			</p>
		</section>
	);
}
