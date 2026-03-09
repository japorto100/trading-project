"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Database, ExternalLink, Globe, Key, Loader2, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
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

interface ApiKeyConfig {
	alphavantage: string;
	finnhub: string;
	twelvedata: string;
}

const STORAGE_KEY = "tradeview_api_keys";

export function SettingsPanel() {
	const [open, setOpen] = useState(false);
	const [apiKeys, setApiKeys] = useState<ApiKeyConfig>({
		alphavantage: "",
		finnhub: "",
		twelvedata: "",
	});
	const [providerPriority, setProviderPriority] = useState("twelvedata,alphavantage,finnhub,demo");

	const { data: providersData, isFetching: loading } = useQuery<ProviderStatus[]>({
		queryKey: ["market-providers"],
		queryFn: async () => {
			const response = await fetch("/api/market/providers");
			const data = (await response.json()) as { success: boolean; providers: ProviderStatus[] };
			if (!data.success) throw new Error("provider status unavailable");
			return data.providers;
		},
		enabled: open,
		staleTime: 30_000,
	});

	const providers = providersData ?? [];

	const syncApiKeysToGateway = async (keys: ApiKeyConfig) => {
		const response = await fetch("/api/market/provider-credentials", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(keys),
		});
		if (!response.ok) {
			throw new Error("provider credential sync failed");
		}
	};

	// Load saved API keys from localStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				try {
					const keys = JSON.parse(saved) as ApiKeyConfig;
					setApiKeys(keys);
					void syncApiKeysToGateway(keys).catch(() => {
						// Keep local-only settings if sync fails.
					});
				} catch {
					// Ignore parse errors
				}
			}

			const savedPriority = localStorage.getItem("tradeview_provider_priority");
			if (savedPriority) {
				setProviderPriority(savedPriority);
			}
		}
	}, []);

	const saveApiKeys = async () => {
		if (typeof window === "undefined") return;

		localStorage.setItem(STORAGE_KEY, JSON.stringify(apiKeys));
		localStorage.setItem("tradeview_provider_priority", providerPriority);

		try {
			await syncApiKeysToGateway(apiKeys);
			alert("API keys saved and synced to the gateway request flow.");
		} catch {
			alert("API keys saved locally, but gateway sync failed.");
		}
	};

	const updateApiKey = (provider: keyof ApiKeyConfig, value: string) => {
		setApiKeys((prev) => ({ ...prev, [provider]: value }));
	};

	const getProviderIcon = (name: string) => {
		switch (name) {
			case "alphavantage":
				return <Database className="h-4 w-4" />;
			case "finnhub":
				return <Globe className="h-4 w-4" />;
			case "twelvedata":
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
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5" />
						Settings
					</DialogTitle>
					<DialogDescription>Configure API keys and data providers</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{/* Provider Status */}
					<div>
						<h3 className="text-sm font-medium mb-3 flex items-center gap-2">
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
										className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50"
									>
										<div className="flex items-center gap-3">
											{getProviderIcon(provider.name)}
											<div>
												<div className="font-medium text-sm">{provider.displayName}</div>
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
												<Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50">
													<Check className="h-3 w-3 mr-1" />
													Connected
												</Badge>
											) : provider.requiresAuth && provider.configured ? (
												<Badge variant="outline" className="text-amber-500 border-amber-500/50">
													<Key className="h-3 w-3 mr-1" />
													Configured
												</Badge>
											) : (
												<Badge
													variant="destructive"
													className="bg-red-500/20 text-red-500 border-red-500/50"
												>
													<X className="h-3 w-3 mr-1" />
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

					{/* API Keys */}
					<div>
						<h3 className="text-sm font-medium mb-3 flex items-center gap-2">
							<Key className="h-4 w-4" />
							API Keys
						</h3>
						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-4">
								<div className="space-y-2">
									<Label htmlFor="twelvedata">Twelve Data API Key</Label>
									<div className="flex gap-2">
										<Input
											id="twelvedata"
											type="password"
											placeholder="Enter your Twelve Data API key"
											value={apiKeys.twelvedata}
											onChange={(e) => updateApiKey("twelvedata", e.target.value)}
										/>
										<a
											href="https://twelvedata.com/pricing"
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-blue-500 hover:underline self-end mb-2 whitespace-nowrap"
										>
											Get Free Key
										</a>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="alphavantage">Alpha Vantage API Key</Label>
									<div className="flex gap-2">
										<Input
											id="alphavantage"
											type="password"
											placeholder="Enter your Alpha Vantage API key"
											value={apiKeys.alphavantage}
											onChange={(e) => updateApiKey("alphavantage", e.target.value)}
										/>
										<a
											href="https://www.alphavantage.co/support/#api-key"
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-blue-500 hover:underline self-end mb-2 whitespace-nowrap"
										>
											Get Free Key
										</a>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="finnhub">Finnhub API Key</Label>
									<div className="flex gap-2">
										<Input
											id="finnhub"
											type="password"
											placeholder="Enter your Finnhub API key"
											value={apiKeys.finnhub}
											onChange={(e) => updateApiKey("finnhub", e.target.value)}
										/>
										<a
											href="https://finnhub.io/register"
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-blue-500 hover:underline self-end mb-2 whitespace-nowrap"
										>
											Get Free Key
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>

					<Separator />

					{/* Provider Priority */}
					<div>
						<h3 className="text-sm font-medium mb-3">Provider Priority</h3>
						<div className="space-y-2">
							<Label htmlFor="priority">Order (comma-separated)</Label>
							<Input
								id="priority"
								placeholder="twelvedata,alphavantage,finnhub,demo"
								value={providerPriority}
								onChange={(e) => setProviderPriority(e.target.value)}
							/>
							<p className="text-xs text-muted-foreground">
								Data providers will be tried in this order. "demo" provides simulated data.
							</p>
						</div>
					</div>

					<Separator />

					{/* Save Button */}
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button onClick={saveApiKeys}>Save Settings</Button>
					</div>

					{/* Help Text */}
					<div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
						<strong>Note:</strong> API keys are stored in your browser's localStorage. For
						production use, set them as environment variables:
						<code className="block mt-1 text-xs bg-background p-2 rounded">
							ALPHA_VANTAGE_API_KEY, FINNHUB_API_KEY, TWELVE_DATA_API_KEY
						</code>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default SettingsPanel;
