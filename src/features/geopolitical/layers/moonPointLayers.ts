import type { BodyPointLayer } from "@/features/geopolitical/layers/bodyPointLayerTypes";
import { MOON_SEED_SITES } from "@/lib/geopolitical/moon-seed";

function moonSiteColorByStatus(status: "historic" | "recent" | "planned"): string {
	if (status === "planned") return "#f59e0b";
	if (status === "recent") return "#38bdf8";
	return "#94a3b8";
}

export function getMoonPointLayers(): BodyPointLayer[] {
	return [
		{
			id: "moon-mission-sites-seed",
			name: "Moon Missions / Sites (Seed)",
			body: "moon",
			group: "sites",
			defaultVisible: true,
			renderStage: "body-point-layers",
			rendererHint: "canvas",
			legend: {
				title: "Moon Seed Sites",
				items: [
					{
						id: "historic",
						label: "Historic",
						color: moonSiteColorByStatus("historic"),
						description: "Apollo/Luna and older landmark missions",
					},
					{
						id: "recent",
						label: "Recent",
						color: moonSiteColorByStatus("recent"),
						description: "Recent successful missions or active programs",
					},
					{
						id: "planned",
						label: "Planned",
						color: moonSiteColorByStatus("planned"),
						description: "Planned targets, candidate zones, station concepts",
					},
				],
				note: "Seed dataset for Phase 4 multi-body foundation; not yet a complete lunar mission catalog.",
			},
			points: MOON_SEED_SITES.map((site) => {
				const fill = moonSiteColorByStatus(site.status);
				return {
					id: site.id,
					lat: site.lat,
					lng: site.lng,
					label: site.label,
					title: `${site.label} • ${site.program}${site.approximate ? " • approx." : ""}`,
					ariaLabel: `${site.label} (${site.program})`,
					fill,
					stroke: "#e2e8f0",
					strokeWidth: 0.8,
					coreRadius: 3.5,
					haloRadius: 9,
					haloOpacity: 0.16,
				};
			}),
		},
	];
}
