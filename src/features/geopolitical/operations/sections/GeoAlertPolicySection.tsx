"use client";

import type { GeoAlertSeverityThreshold } from "@/features/geopolitical/operations/types";
import type { GeoEvent } from "@/lib/geopolitical/types";

interface GeoAlertPolicySectionProps {
	policyLoading: boolean;
	alertSeverityThreshold: GeoAlertSeverityThreshold;
	setAlertSeverityThreshold: (value: GeoAlertSeverityThreshold) => void;
	alertConfidenceThreshold: number;
	setAlertConfidenceThreshold: (value: number) => void;
	alertCooldownMinutes: number;
	setAlertCooldownMinutes: (value: number) => void;
	muteProfileEnabled: boolean;
	setMuteProfileEnabled: (value: boolean) => void;
	playbackAlertTieIn: boolean;
	setPlaybackAlertTieIn: (value: boolean) => void;
	alertsLoading: boolean;
	alertsError: string | null;
	previewEvents: GeoEvent[];
	previewEligibleAlerts?: number;
	previewTotalEvents?: number;
	previewThresholdMatchedEvents?: number;
	previewSuppressedAlerts?: number;
	policySaveBusy: boolean;
	policyMessage: string | null;
	onSavePolicy: () => void;
}

export function GeoAlertPolicySection(props: GeoAlertPolicySectionProps) {
	return (
		<section className="rounded border border-border bg-background p-2">
			<div className="mb-2 flex items-center justify-between">
				<h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Alert Policy
				</h3>
				<span className="text-[10px] text-muted-foreground">
					{props.policyLoading ? "Loading policy…" : "Policy + preview"}
				</span>
			</div>
			<div className="grid gap-2 sm:grid-cols-2">
				<label className="text-xs">
					<div className="mb-1 text-muted-foreground">Min severity</div>
					<select
						id="geo-alert-min-severity"
						name="geo_alert_min_severity"
						className="w-full rounded border border-border bg-background px-2 py-1"
						value={props.alertSeverityThreshold}
						onChange={(event) =>
							props.setAlertSeverityThreshold(event.target.value as GeoAlertSeverityThreshold)
						}
					>
						<option value="low">low</option>
						<option value="medium">medium</option>
						<option value="high">high</option>
						<option value="critical">critical</option>
					</select>
				</label>
				<label className="text-xs">
					<div className="mb-1 text-muted-foreground">
						Min confidence ({Math.round(props.alertConfidenceThreshold * 100)}%)
					</div>
					<input
						id="geo-alert-min-confidence"
						name="geo_alert_min_confidence"
						type="range"
						min={0.4}
						max={0.99}
						step={0.01}
						value={props.alertConfidenceThreshold}
						onChange={(event) => props.setAlertConfidenceThreshold(Number(event.target.value))}
						className="w-full"
					/>
				</label>
				<label className="text-xs">
					<div className="mb-1 text-muted-foreground">
						Cooldown per region/category ({props.alertCooldownMinutes}m)
					</div>
					<input
						id="geo-alert-cooldown-minutes"
						name="geo_alert_cooldown_minutes"
						type="range"
						min={5}
						max={240}
						step={5}
						value={props.alertCooldownMinutes}
						onChange={(event) => props.setAlertCooldownMinutes(Number(event.target.value))}
						className="w-full"
					/>
				</label>
				<div className="space-y-1 text-xs">
					<label className="flex items-center gap-2">
						<input
							id="geo-alert-mute-profile"
							name="geo_alert_mute_profile"
							type="checkbox"
							checked={props.muteProfileEnabled}
							onChange={(event) => props.setMuteProfileEnabled(event.target.checked)}
						/>
						<span>Mute profile preview</span>
					</label>
					<label className="flex items-center gap-2">
						<input
							id="geo-alert-playback-tie-in"
							name="geo_alert_playback_tie_in"
							type="checkbox"
							checked={props.playbackAlertTieIn}
							onChange={(event) => props.setPlaybackAlertTieIn(event.target.checked)}
						/>
						<span>Use playback window for alert preview</span>
					</label>
				</div>
			</div>
			<div className="mt-2 rounded border border-dashed border-border px-2 py-2 text-xs">
				<div className="mb-1 font-medium">
					Preview matches ({props.previewEligibleAlerts ?? props.previewEvents.length}/
					{props.previewTotalEvents ?? 0})
				</div>
				<div className="mb-2 text-[11px] text-muted-foreground">
					threshold matched: {props.previewThresholdMatchedEvents ?? "n/a"} · suppressed:{" "}
					{props.previewSuppressedAlerts ?? "n/a"}
				</div>
				{props.alertsLoading ? (
					<p className="text-muted-foreground">Loading alert preview…</p>
				) : props.alertsError ? (
					<p className="text-red-400">{props.alertsError}</p>
				) : props.previewEvents.length === 0 ? (
					<p className="text-muted-foreground">No events match the current preview policy.</p>
				) : (
					<ul className="space-y-1 text-muted-foreground">
						{props.previewEvents.map((event) => (
							<li key={event.id} className="truncate">
								S{event.severity} · {(event.confidence * 100).toFixed(0)}% · {event.title}
							</li>
						))}
					</ul>
				)}
			</div>
			<div className="mt-2 flex items-center gap-2">
				<button
					type="button"
					className="rounded border border-border px-2 py-1 text-xs hover:bg-muted/50 disabled:opacity-50"
					disabled={props.policySaveBusy}
					onClick={props.onSavePolicy}
				>
					{props.policySaveBusy ? "Saving…" : "Save alert policy"}
				</button>
				{props.policyMessage ? (
					<span className="text-[11px] text-muted-foreground">{props.policyMessage}</span>
				) : null}
			</div>
		</section>
	);
}
