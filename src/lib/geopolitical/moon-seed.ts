export interface MoonSeedSite {
	id: string;
	label: string;
	program: string;
	type: "landing_site" | "target_zone" | "planned_base";
	status: "historic" | "recent" | "planned";
	lat: number;
	lng: number;
	approximate?: boolean;
}

// Approximate selenographic coordinates for an initial Phase 4 seed layer.
export const MOON_SEED_SITES: MoonSeedSite[] = [
	{
		id: "apollo-11",
		label: "Apollo 11 (Tranquility Base)",
		program: "NASA Apollo",
		type: "landing_site",
		status: "historic",
		lat: 0.6741,
		lng: 23.4729,
	},
	{
		id: "apollo-17",
		label: "Apollo 17 (Taurus-Littrow)",
		program: "NASA Apollo",
		type: "landing_site",
		status: "historic",
		lat: 20.1908,
		lng: 30.7717,
	},
	{
		id: "luna-9",
		label: "Luna 9",
		program: "USSR Luna",
		type: "landing_site",
		status: "historic",
		lat: 7.08,
		lng: -64.37,
		approximate: true,
	},
	{
		id: "change-3",
		label: "Chang'e 3",
		program: "CNSA Chang'e",
		type: "landing_site",
		status: "historic",
		lat: 44.12,
		lng: -19.51,
		approximate: true,
	},
	{
		id: "change-4",
		label: "Chang'e 4",
		program: "CNSA Chang'e",
		type: "landing_site",
		status: "historic",
		lat: -45.457,
		lng: 177.588,
		approximate: true,
	},
	{
		id: "change-5",
		label: "Chang'e 5",
		program: "CNSA Chang'e",
		type: "landing_site",
		status: "recent",
		lat: 43.06,
		lng: -51.92,
		approximate: true,
	},
	{
		id: "slim",
		label: "SLIM",
		program: "JAXA",
		type: "landing_site",
		status: "recent",
		lat: -13.3,
		lng: 25.2,
		approximate: true,
	},
	{
		id: "im-1-odysseus",
		label: "IM-1 Odysseus",
		program: "Intuitive Machines / CLPS",
		type: "landing_site",
		status: "recent",
		lat: -80.0,
		lng: 1.4,
		approximate: true,
	},
	{
		id: "artemis-iii-south-pole",
		label: "Artemis III Candidate Zone",
		program: "NASA Artemis",
		type: "target_zone",
		status: "planned",
		lat: -85.0,
		lng: 0,
		approximate: true,
	},
	{
		id: "south-pole-base-concept",
		label: "South Pole Base Concept",
		program: "International / Artemis-era",
		type: "planned_base",
		status: "planned",
		lat: -88,
		lng: 45,
		approximate: true,
	},
];
