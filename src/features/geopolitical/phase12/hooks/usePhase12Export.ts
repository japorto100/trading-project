"use client";

import { useState } from "react";
import type { ExportFormat } from "@/features/geopolitical/phase12/types";

function downloadText(filename: string, content: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

export function usePhase12Export() {
	const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormat>("json");
	const [exportBusy, setExportBusy] = useState(false);
	const [exportMessage, setExportMessage] = useState<string | null>(null);

	const runExport = (activeRegionLabel: string) => {
		setExportBusy(true);
		setExportMessage(null);
		void fetch("/api/geopolitical/export", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				format: selectedExportFormat,
				regionLabel: activeRegionLabel,
				includeItems: selectedExportFormat === "json",
			}),
		})
			.then(async (response) => {
				const payload = (await response.json()) as {
					success?: boolean;
					error?: string;
					filename?: string;
					mimeType?: string;
					content?: string;
				};
				if (!response.ok || !payload.success) {
					throw new Error(payload.error ?? `export failed (${response.status})`);
				}
				if (!payload.filename || !payload.mimeType || typeof payload.content !== "string") {
					throw new Error("export response incomplete");
				}
				downloadText(payload.filename, payload.content, payload.mimeType);
				setExportMessage(`Exported ${selectedExportFormat.toUpperCase()} snapshot`);
			})
			.catch((error: unknown) => {
				setExportMessage(error instanceof Error ? error.message : "export failed");
			})
			.finally(() => setExportBusy(false));
	};

	return {
		selectedExportFormat,
		setSelectedExportFormat,
		exportBusy,
		exportMessage,
		runExport,
	};
}
