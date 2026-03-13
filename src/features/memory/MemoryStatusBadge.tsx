"use client";

import { useQuery } from "@tanstack/react-query";

interface MemoryHealthData {
	ok: boolean;
	kg: string;
	vector: string;
	cache: string;
	episodic: string;
}

function statusColor(status: string): string {
	if (status === "ready") return "text-emerald-400";
	if (status === "degraded") return "text-yellow-400";
	return "text-zinc-500";
}

export function MemoryStatusBadge() {
	const { data: health } = useQuery<MemoryHealthData>({
		queryKey: ["memory", "health"],
		queryFn: async () => {
			const res = await fetch("/api/memory/health", { cache: "no-store" });
			if (!res.ok) throw new Error("memory health unavailable");
			return res.json() as Promise<MemoryHealthData>;
		},
		refetchInterval: 30_000,
		staleTime: 25_000,
		// silent: don't throw to error boundary — memory service may be offline
		throwOnError: false,
	});

	if (!health) return null;

	const kgLabel = health.kg === "ready" ? `KG ${health.cache?.toUpperCase() ?? "LRU"}` : "KG —";
	const vecLabel = health.vector === "ready" ? "V+" : "V—";

	return (
		<span
			className="flex items-center gap-1 text-[10px] font-mono opacity-70 hover:opacity-100 transition-opacity"
			title={`Memory: KG=${health.kg} Vector=${health.vector} Cache=${health.cache} Episodic=${health.episodic}`}
		>
			<span className={statusColor(health.kg)}>{kgLabel}</span>
			<span className="text-zinc-600">|</span>
			<span className={statusColor(health.vector)}>{vecLabel}</span>
		</span>
	);
}
