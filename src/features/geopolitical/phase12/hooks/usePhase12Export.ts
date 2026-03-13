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

function downloadBlob(filename: string, blob: Blob): void {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

function buildSnapshotFilename(regionLabel: string, format: "png" | "pdf"): string {
	const normalizedRegion =
		regionLabel
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") || "all-regions";
	return `geomap-${normalizedRegion}-${Date.now()}.${format}`;
}

function getGeoMapExportNode(): HTMLElement {
	const node = document.querySelector<HTMLElement>('[data-geomap-export-root="true"]');
	if (!node) {
		throw new Error("GeoMap export target not found");
	}
	return node;
}

async function runClientSnapshotExport(
	format: "png" | "pdf",
	activeRegionLabel: string,
): Promise<string> {
	const node = getGeoMapExportNode();
	const { toBlob, toPng } = await import("html-to-image");
	if (format === "png") {
		const blob = await toBlob(node, {
			backgroundColor: "#050816",
			cacheBust: true,
			pixelRatio: 2,
		});
		if (!blob) {
			throw new Error("GeoMap PNG export failed");
		}
		downloadBlob(buildSnapshotFilename(activeRegionLabel, "png"), blob);
		return "Exported PNG snapshot";
	}

	const dataUrl = await toPng(node, {
		backgroundColor: "#050816",
		cacheBust: true,
		pixelRatio: 2,
	});
	const { jsPDF } = await import("jspdf");
	const bounds = node.getBoundingClientRect();
	const pdf = new jsPDF({
		format: [Math.max(1, Math.round(bounds.width)), Math.max(1, Math.round(bounds.height))],
		orientation: bounds.width >= bounds.height ? "landscape" : "portrait",
		unit: "px",
	});
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();
	pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
	pdf.save(buildSnapshotFilename(activeRegionLabel, "pdf"));
	return "Exported PDF snapshot";
}

export function usePhase12Export() {
	const [selectedExportFormat, setSelectedExportFormat] = useState<ExportFormat>("json");
	const [exportBusy, setExportBusy] = useState(false);
	const [exportMessage, setExportMessage] = useState<string | null>(null);

	const runExport = async (activeRegionLabel: string) => {
		setExportBusy(true);
		setExportMessage(null);
		try {
			if (selectedExportFormat === "png" || selectedExportFormat === "pdf") {
				const message = await runClientSnapshotExport(selectedExportFormat, activeRegionLabel);
				setExportMessage(message);
				return;
			}
			const response = await fetch("/api/geopolitical/export", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					format: selectedExportFormat,
					regionLabel: activeRegionLabel,
					includeItems: selectedExportFormat === "json",
				}),
			});
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
		} catch (error: unknown) {
			setExportMessage(error instanceof Error ? error.message : "export failed");
		} finally {
			setExportBusy(false);
		}
	};

	return {
		selectedExportFormat,
		setSelectedExportFormat,
		exportBusy,
		exportMessage,
		runExport,
	};
}
