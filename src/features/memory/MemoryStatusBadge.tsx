"use client";

import { useEffect, useState } from "react";

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
	const [health, setHealth] = useState<MemoryHealthData | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let cancelled = false;
		const fetchHealth = async () => {
			setLoading(true);
			try {
				const res = await fetch("/api/memory/health", { cache: "no-store" });
				if (res.ok && !cancelled) {
					const data = (await res.json()) as MemoryHealthData;
					setHealth(data);
				}
			} catch {
				// memory service offline — silent fail
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		void fetchHealth();
		const interval = setInterval(() => void fetchHealth(), 30_000);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, []);

	if (loading && !health) return null;
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
