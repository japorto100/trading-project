"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ConsentResponse {
	user: {
		id: string;
		email: string | null;
		role: string;
	};
	consent: {
		llmProcessing: boolean;
		analyticsEnabled: boolean;
		marketingEnabled: boolean;
		privacyVersion: string;
		consentedAt: string | null;
		withdrawnAt: string | null;
	};
}

type State =
	| { kind: "loading" }
	| { kind: "loaded"; data: ConsentResponse; dirty: boolean; saving: boolean }
	| { kind: "error"; message: string; status?: number };

async function readJSONSafe<T>(response: Response): Promise<T | null> {
	try {
		return (await response.json()) as T;
	} catch {
		return null;
	}
}

function formatDate(value: string | null): string {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
		date,
	);
}

export function ConsentSettingsPanel() {
	const [state, setState] = useState<State>({ kind: "loading" });

	const load = useEffectEvent(async () => {
		setState({ kind: "loading" });
		const response = await fetch("/api/auth/consent", {
			method: "GET",
			credentials: "include",
			cache: "no-store",
			headers: { Accept: "application/json" },
		});
		const payload = await readJSONSafe<ConsentResponse & { error?: string }>(response);
		if (!response.ok || !payload || "error" in payload) {
			setState({
				kind: "error",
				status: response.status,
				message: payload?.error ?? `request failed (${response.status})`,
			});
			return;
		}
		setState({ kind: "loaded", data: payload, dirty: false, saving: false });
	});

	useEffect(() => {
		void load();
	}, []);

	const patchField = (
		field: "llmProcessing" | "analyticsEnabled" | "marketingEnabled",
		value: boolean,
	) => {
		setState((prev) => {
			if (prev.kind !== "loaded") return prev;
			return {
				...prev,
				dirty: true,
				data: {
					...prev.data,
					consent: {
						...prev.data.consent,
						[field]: value,
					},
				},
			};
		});
	};

	const save = async () => {
		if (state.kind !== "loaded") return;
		setState({ ...state, saving: true });
		const response = await fetch("/api/auth/consent", {
			method: "PATCH",
			credentials: "include",
			cache: "no-store",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(state.data.consent),
		});
		const payload = await readJSONSafe<ConsentResponse & { error?: string }>(response);
		if (!response.ok || !payload || "error" in payload) {
			setState({
				kind: "error",
				status: response.status,
				message: payload?.error ?? `save failed (${response.status})`,
			});
			return;
		}
		setState({ kind: "loaded", data: payload, dirty: false, saving: false });
	};

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Privacy & Consent</CardTitle>
					<CardDescription>
						Server-side consent controls for AI/LLM processing and analytics (Phase 1f scaffold).
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{state.kind === "loading" ? (
						<div className="rounded-md border p-4 text-sm text-muted-foreground">Loading...</div>
					) : state.kind === "error" ? (
						<div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
							{state.message}
							{state.status === 401 ? (
								<div className="mt-2 text-xs">Sign in first to manage consent.</div>
							) : null}
						</div>
					) : (
						<>
							<div className="rounded-md border p-4 text-sm">
								<div>
									User:{" "}
									<span className="font-medium">{state.data.user.email ?? state.data.user.id}</span>
								</div>
								<div className="text-muted-foreground">Role: {state.data.user.role}</div>
								<div className="text-muted-foreground">
									Privacy version: {state.data.consent.privacyVersion}
								</div>
								<div className="text-muted-foreground">
									Consented at: {formatDate(state.data.consent.consentedAt)}
								</div>
								<div className="text-muted-foreground">
									Withdrawn at: {formatDate(state.data.consent.withdrawnAt)}
								</div>
							</div>

							<div className="space-y-4 rounded-md border p-4">
								<div className="flex items-center justify-between gap-4">
									<div>
										<Label htmlFor="consent-llm">LLM Processing</Label>
										<p className="text-xs text-muted-foreground">
											Required for soft-signal ingest / AI-assisted processing routes.
										</p>
									</div>
									<Switch
										id="consent-llm"
										checked={state.data.consent.llmProcessing}
										onCheckedChange={(value) => patchField("llmProcessing", Boolean(value))}
									/>
								</div>
								<div className="flex items-center justify-between gap-4">
									<div>
										<Label htmlFor="consent-analytics">Analytics</Label>
										<p className="text-xs text-muted-foreground">
											Allow product analytics for UX improvement.
										</p>
									</div>
									<Switch
										id="consent-analytics"
										checked={state.data.consent.analyticsEnabled}
										onCheckedChange={(value) => patchField("analyticsEnabled", Boolean(value))}
									/>
								</div>
								<div className="flex items-center justify-between gap-4">
									<div>
										<Label htmlFor="consent-marketing">Marketing</Label>
										<p className="text-xs text-muted-foreground">
											Allow marketing communication preferences.
										</p>
									</div>
									<Switch
										id="consent-marketing"
										checked={state.data.consent.marketingEnabled}
										onCheckedChange={(value) => patchField("marketingEnabled", Boolean(value))}
									/>
								</div>
							</div>

							<div className="flex gap-2">
								<Button
									type="button"
									onClick={() => void save()}
									disabled={!state.dirty || state.saving}
								>
									{state.saving ? "Saving..." : "Save Consent"}
								</Button>
								<Button type="button" variant="outline" onClick={() => void load()}>
									Reload
								</Button>
								<Button asChild type="button" variant="secondary">
									<Link href="/auth/security">Security Hub</Link>
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
