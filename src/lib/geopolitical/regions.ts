import type { GeoRegion } from "@/lib/geopolitical/types";

export const DEFAULT_GEO_REGIONS: GeoRegion[] = [
	{ id: "north-america", label: "North America", countryCodes: ["US", "CA", "MX"] },
	{
		id: "south-america",
		label: "South America",
		countryCodes: ["BR", "AR", "CL", "CO", "PE", "UY", "PY", "BO", "EC", "VE", "GY", "SR"],
	},
	{
		id: "europe",
		label: "Europe",
		countryCodes: [
			"GB",
			"IE",
			"FR",
			"DE",
			"ES",
			"IT",
			"NL",
			"BE",
			"PL",
			"SE",
			"NO",
			"FI",
			"DK",
			"CH",
			"AT",
			"PT",
			"CZ",
			"HU",
			"RO",
			"UA",
			"GR",
			"BG",
			"RS",
		],
	},
	{
		id: "mena",
		label: "MENA",
		countryCodes: [
			"SA",
			"AE",
			"QA",
			"KW",
			"OM",
			"BH",
			"IR",
			"IQ",
			"IL",
			"JO",
			"LB",
			"EG",
			"MA",
			"DZ",
			"TN",
		],
	},
	{
		id: "sub-saharan-africa",
		label: "Sub-Saharan Africa",
		countryCodes: ["ZA", "NG", "KE", "ET", "GH", "TZ", "UG", "SN", "CI", "ZW", "ZM", "BW"],
	},
	{ id: "central-asia", label: "Central Asia", countryCodes: ["KZ", "UZ", "TM", "KG", "TJ"] },
	{ id: "south-asia", label: "South Asia", countryCodes: ["IN", "PK", "BD", "LK", "NP"] },
	{ id: "east-asia", label: "East Asia", countryCodes: ["CN", "JP", "KR", "KP", "MN", "TW", "HK"] },
	{
		id: "southeast-asia",
		label: "Southeast Asia",
		countryCodes: ["SG", "MY", "TH", "ID", "PH", "VN", "KH", "LA", "MM", "BN"],
	},
	{ id: "oceania", label: "Oceania", countryCodes: ["AU", "NZ", "PG", "FJ"] },
	{ id: "arctic-polar", label: "Arctic/Polar", countryCodes: [] },
];

const REGION_SET = new Set(DEFAULT_GEO_REGIONS.map((region) => region.id));

export function isValidRegionId(regionId: string): boolean {
	return REGION_SET.has(regionId);
}
