"use client";

interface GeoStrategicOverlaysSectionProps {
	overlayLoading: boolean;
	cbLayerEnabled: boolean;
	setCbLayerEnabled: (value: boolean) => void;
	cbdcLayerEnabled: boolean;
	setCbdcLayerEnabled: (value: boolean) => void;
	dedollarizationLayerEnabled: boolean;
	setDedollarizationLayerEnabled: (value: boolean) => void;
	financialOpennessLayerEnabled: boolean;
	setFinancialOpennessLayerEnabled: (value: boolean) => void;
	overlaySaveBusy: boolean;
	overlayMessage: string | null;
	onSaveOverlay: () => void;
	centralBankSources: number;
	sanctionsSources: number;
	usesEndpointSummary: boolean;
}

export function GeoStrategicOverlaysSection(props: GeoStrategicOverlaysSectionProps) {
	return (
		<section className="rounded border border-border bg-background p-2">
			<div className="mb-2 flex items-center justify-between">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Strategic Overlays
				</h3>
				<span className="text-[10px] text-muted-foreground">
					{props.overlayLoading ? "Loading…" : "Config + source summary"}
				</span>
			</div>
			<div className="grid gap-2 sm:grid-cols-2">
				<label className="flex items-center gap-2 text-xs">
					<input
						id="geo-overlay-rate-decisions"
						name="geo_overlay_rate_decisions"
						type="checkbox"
						checked={props.cbLayerEnabled}
						onChange={(event) => props.setCbLayerEnabled(event.target.checked)}
					/>
					<span>Rate decisions layer</span>
				</label>
				<label className="flex items-center gap-2 text-xs">
					<input
						id="geo-overlay-cbdc-choropleth"
						name="geo_overlay_cbdc_choropleth"
						type="checkbox"
						checked={props.cbdcLayerEnabled}
						onChange={(event) => props.setCbdcLayerEnabled(event.target.checked)}
					/>
					<span>CBDC status choropleth</span>
				</label>
				<label className="flex items-center gap-2 text-xs">
					<input
						id="geo-overlay-dedollarization"
						name="geo_overlay_dedollarization"
						type="checkbox"
						checked={props.dedollarizationLayerEnabled}
						onChange={(event) => props.setDedollarizationLayerEnabled(event.target.checked)}
					/>
					<span>De-dollarization trend arrows</span>
				</label>
				<label className="flex items-center gap-2 text-xs">
					<input
						id="geo-overlay-financial-openness"
						name="geo_overlay_financial_openness"
						type="checkbox"
						checked={props.financialOpennessLayerEnabled}
						onChange={(event) => props.setFinancialOpennessLayerEnabled(event.target.checked)}
					/>
					<span>Financial openness overlay</span>
				</label>
			</div>
			<div className="mt-2 flex items-center gap-2">
				<button
					type="button"
					className="rounded border border-border px-2 py-1 text-xs hover:bg-muted/50 disabled:opacity-50"
					disabled={props.overlaySaveBusy}
					onClick={props.onSaveOverlay}
				>
					{props.overlaySaveBusy ? "Saving…" : "Save overlay config"}
				</button>
				{props.overlayMessage ? (
					<span className="text-[11px] text-muted-foreground">{props.overlayMessage}</span>
				) : null}
			</div>
			<div className="mt-2 grid gap-2 sm:grid-cols-2">
				<div className="rounded border border-border px-2 py-2 text-xs">
					<div className="text-muted-foreground">Central-bank sources (health)</div>
					<div className="mt-1 text-sm font-semibold">{props.centralBankSources}</div>
					<p className="mt-1 text-[11px] text-muted-foreground">
						{props.usesEndpointSummary
							? "Returned by overlay config endpoint (source-health backed)"
							: "Derived from current source-health feed names (heuristic)"}
					</p>
				</div>
				<div className="rounded border border-border px-2 py-2 text-xs">
					<div className="text-muted-foreground">Sanctions/official legal sources</div>
					<div className="mt-1 text-sm font-semibold">{props.sanctionsSources}</div>
					<p className="mt-1 text-[11px] text-muted-foreground">
						Phase 14 connectors should back these overlays with typed metadata
					</p>
				</div>
			</div>
		</section>
	);
}
