"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Check,
	Database,
	ExternalLink,
	Globe,
	Key,
	Loader2,
	Settings,
	ShieldCheck,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ProviderStatus {
	name: string;
	displayName: string;
	available: boolean;
	configured?: boolean;
	requiresAuth: boolean;
	supportedAssets: string[];
	rateLimit: { requests: number; period: string };
	freePlan: boolean;
	documentation: string;
}

type ProviderCredentialKey = "banxico" | "bok" | "finnhub" | "fred";
type ApiKeyConfig = Record<ProviderCredentialKey, string>;

interface SaveStatus {
	tone: "error" | "success";
	message: string;
}

const PROVIDER_PRIORITY_STORAGE_KEY = "tradeview_provider_priority";
const DEFAULT_API_KEYS: ApiKeyConfig = {
	banxico: "",
	bok: "",
	finnhub: "",
	fred: "",
};
const DEFAULT_PROVIDER_PRIORITY = "finnhub,fred,banxico,bok,ecb,imf,demo";
const PROVIDER_FIELDS: Array<{
	name: ProviderCredentialKey;
	label: string;
	placeholder: string;
	linkLabel: string;
	linkUrl: string;
}> = [
	{
		name: "finnhub",
		label: "Finnhub API Key",
		placeholder: "Enter your Finnhub API key",
		linkLabel: "Get Key",
		linkUrl: "https://finnhub.io/register",
	},
	{
		name: "fred",
		label: "FRED API Key",
		placeholder: "Enter your FRED API key",
		linkLabel: "API Docs",
		linkUrl: "https://fred.stlouisfed.org/docs/api/api_key.html",
	},
	{
		name: "banxico",
		label: "Banxico API Token",
		placeholder: "Enter your Banxico SIE API token",
		linkLabel: "API Docs",
		linkUrl: "https://www.banxico.org.mx/SieAPIRest/service/v1/",
	},
	{
		name: "bok",
		label: "BoK ECOS API Key",
		placeholder: "Enter your BoK ECOS API key",
		linkLabel: "API Docs",
		linkUrl: "https://ecos.bok.or.kr/api/",
	},
];

function providerConfiguredMap(providers: ProviderStatus[]): Set<string> {
	return new Set(
		providers
			.filter((provider) => provider.requiresAuth && provider.configured)
			.map((provider) => provider.name),
	);
}

export function SettingsPanel() {
	const [open, setOpen] = useState(false);
	const [apiKeys, setApiKeys] = useState<ApiKeyConfig>(DEFAULT_API_KEYS);
	const [dirtyProviders, setDirtyProviders] = useState<Record<ProviderCredentialKey, boolean>>({
		banxico: false,
		bok: false,
		finnhub: false,
		fred: false,
	});
	const [removeProviders, setRemoveProviders] = useState<ProviderCredentialKey[]>([]);
	const [providerPriority, setProviderPriority] = useState(DEFAULT_PROVIDER_PRIORITY);
	const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
	const [saving, setSaving] = useState(false);

	const {
		data: providersData,
		isFetching: loading,
		refetch,
	} = useQuery<ProviderStatus[]>({
		queryKey: ["market", "providers"],
		queryFn: async () => {
			const response = await fetch("/api/market/providers", { cache: "no-store" });
			const data = (await response.json()) as { success: boolean; providers: ProviderStatus[] };
			if (!data.success) throw new Error("provider status unavailable");
			return data.providers;
		},
		enabled: open,
		staleTime: 30_000,
	});

	const providers = providersData ?? [];
	const configuredProviders = useMemo(() => providerConfiguredMap(providers), [providers]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const savedPriority = window.localStorage.getItem(PROVIDER_PRIORITY_STORAGE_KEY);
		if (savedPriority) {
			setProviderPriority(savedPriority);
		}
	}, []);

	const syncApiKeysToGateway = async (params: {
		credentials: Partial<ApiKeyConfig>;
		removeProviders: ProviderCredentialKey[];
	}) => {
		const response = await fetch("/api/market/provider-credentials", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		});
		if (!response.ok) {
			const payload = (await response.json().catch(() => null)) as { error?: string } | null;
			throw new Error(payload?.error || "provider credential sync failed");
		}
		return (await response.json()) as {
			success: boolean;
			removedProviders: string[];
			storedProviders: string[];
		};
	};

	const updateApiKey = (provider: ProviderCredentialKey, value: string) => {
		setApiKeys((prev) => ({ ...prev, [provider]: value }));
		setDirtyProviders((prev) => ({ ...prev, [provider]: true }));
		setRemoveProviders((prev) => prev.filter((entry) => entry !== provider));
		setSaveStatus(null);
	};

	const markProviderForRemoval = (provider: ProviderCredentialKey) => {
		setApiKeys((prev) => ({ ...prev, [provider]: "" }));
		setDirtyProviders((prev) => ({ ...prev, [provider]: false }));
		setRemoveProviders((prev) => [...new Set([...prev, provider])]);
		setSaveStatus(null);
	};

	const resetCredentialDrafts = () => {
		setApiKeys(DEFAULT_API_KEYS);
		setDirtyProviders({
			banxico: false,
			bok: false,
			finnhub: false,
			fred: false,
		});
		setRemoveProviders([]);
	};

	const saveApiKeys = async () => {
		if (typeof window === "undefined") return;

		window.localStorage.setItem(PROVIDER_PRIORITY_STORAGE_KEY, providerPriority);

		const credentials = Object.fromEntries(
			PROVIDER_FIELDS.filter(
				(field) => dirtyProviders[field.name] && apiKeys[field.name].trim().length > 0,
			).map((field) => [field.name, apiKeys[field.name].trim()]),
		) as Partial<ApiKeyConfig>;

		const hasCredentialChanges = Object.keys(credentials).length > 0 || removeProviders.length > 0;
		if (!hasCredentialChanges) {
			setSaveStatus({
				tone: "success",
				message: "Provider priority saved. Stored credentials were left unchanged.",
			});
			return;
		}

		setSaving(true);
		try {
			await syncApiKeysToGateway({ credentials, removeProviders });
			resetCredentialDrafts();
			await refetch();
			setSaveStatus({
				tone: "success",
				message:
					"Credentials saved to the secure same-origin cookie path. Secrets are no longer persisted in localStorage.",
			});
		} catch (error: unknown) {
			setSaveStatus({
				tone: "error",
				message: error instanceof Error ? error.message : "Provider credential sync failed",
			});
		} finally {
			setSaving(false);
		}
	};

	const getProviderIcon = (name: string) => {
		switch (name) {
			case "finnhub":
				return <Globe className="h-4 w-4" />;
			case "fred":
			case "banxico":
			case "bok":
				return <Database className="h-4 w-4" />;
			default:
				return <Key className="h-4 w-4" />;
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="h-9 w-9">
					<Settings className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Settings
					</DialogTitle>
					<DialogDescription>
						Configure Go-backed providers and store credentials through the secure same-origin
						request path.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-6">
					<div>
						<h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
							<Database className="h-4 w-4" />
							Data Providers
						</h3>
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : (
							<div className="space-y-2">
								{providers.map((provider) => (
									<div
										key={provider.name}
										className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-3"
									>
										<div className="flex items-center gap-3">
											{getProviderIcon(provider.name)}
											<div>
												<div className="text-sm font-medium">{provider.displayName}</div>
												<div className="text-xs text-muted-foreground">
													{provider.supportedAssets.join(", ")} • {provider.rateLimit.requests}/
													{provider.rateLimit.period}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{provider.freePlan && (
												<Badge variant="outline" className="text-xs">
													Free
												</Badge>
											)}
											{provider.available ? (
												<Badge className="border-emerald-500/50 bg-emerald-500/20 text-emerald-500">
													<Check className="mr-1 h-3 w-3" />
													Connected
												</Badge>
											) : provider.requiresAuth && provider.configured ? (
												<Badge variant="outline" className="border-amber-500/50 text-amber-500">
													<Key className="mr-1 h-3 w-3" />
													Configured
												</Badge>
											) : (
												<Badge
													variant="destructive"
													className="border-red-500/50 bg-red-500/20 text-red-500"
												>
													<X className="mr-1 h-3 w-3" />
													{provider.requiresAuth ? "No API Key" : "Unavailable"}
												</Badge>
											)}
											<a
												href={provider.documentation}
												target="_blank"
												rel="noopener noreferrer"
												className="text-muted-foreground hover:text-foreground"
											>
												<ExternalLink className="h-4 w-4" />
											</a>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<Separator />

					<div>
						<h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
							<ShieldCheck className="h-4 w-4" />
							Secure Provider Credentials
						</h3>
						<div className="space-y-4">
							{PROVIDER_FIELDS.map((field) => {
								const configured = configuredProviders.has(field.name);
								const markedForRemoval = removeProviders.includes(field.name);
								return (
									<div key={field.name} className="space-y-2">
										<div className="flex items-center justify-between gap-3">
											<Label htmlFor={field.name}>{field.label}</Label>
											<div className="flex items-center gap-2">
												{configured && !markedForRemoval ? (
													<Badge
														variant="outline"
														className="border-emerald-500/50 text-emerald-600"
													>
														Stored securely
													</Badge>
												) : null}
												{markedForRemoval ? (
													<Badge variant="outline" className="border-amber-500/50 text-amber-600">
														Will be removed
													</Badge>
												) : null}
											</div>
										</div>
										<div className="flex gap-2">
											<Input
												id={field.name}
												type="password"
												autoComplete="off"
												placeholder={field.placeholder}
												value={apiKeys[field.name]}
												onChange={(event) => updateApiKey(field.name, event.target.value)}
											/>
											<Button
												type="button"
												variant="outline"
												onClick={() => markProviderForRemoval(field.name)}
												disabled={!configured && apiKeys[field.name].trim().length === 0}
											>
												Clear
											</Button>
											<a
												href={field.linkUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="self-end whitespace-nowrap pb-2 text-xs text-blue-500 hover:underline"
											>
												{field.linkLabel}
											</a>
										</div>
										<p className="text-xs text-muted-foreground">
											Values are posted once to the Next BFF and stored as an encrypted, `HttpOnly`,
											same-origin cookie for the Go gateway transport path.
										</p>
									</div>
								);
							})}
						</div>
					</div>

					<Separator />

					<div>
						<h3 className="mb-3 text-sm font-medium">Provider Priority</h3>
						<div className="space-y-2">
							<Label htmlFor="priority">Order (comma-separated)</Label>
							<Input
								id="priority"
								placeholder={DEFAULT_PROVIDER_PRIORITY}
								value={providerPriority}
								onChange={(event) => setProviderPriority(event.target.value)}
							/>
							<p className="text-xs text-muted-foreground">
								Priority remains a local preference. Only provider secrets use the secure cookie
								path.
							</p>
						</div>
					</div>

					<Separator />

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
							Cancel
						</Button>
						<Button onClick={saveApiKeys} disabled={saving}>
							{saving ? "Saving..." : "Save Securely"}
						</Button>
					</div>

					{saveStatus ? (
						<div
							className={
								saveStatus.tone === "success"
									? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700"
									: "rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700"
							}
						>
							{saveStatus.message}
						</div>
					) : null}

					<div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
						<strong>Security note:</strong> Browser-side API keys are no longer persisted in
						`localStorage`. Runtime transport now relies on the same-origin Next BFF plus secure
						cookie storage. Long-lived production keys should still live in `go-backend/.env.*`.
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
