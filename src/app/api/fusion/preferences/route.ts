import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fromDbLayoutMode, toDbLayoutMode } from "@/lib/server/persistence-mappers";
import { getPrismaClient } from "@/lib/server/prisma";
import { getErrorMessage } from "@/lib/utils";

interface PreferencesPayload {
	profileKey: string;
	favorites?: string[];
	layout?: "single" | "2h" | "2v" | "4";
	sidebarOpen?: boolean;
	showDrawingTool?: boolean;
	darkMode?: boolean;
}

const preferencesSchema = z.object({
	profileKey: z.string().min(1),
	favorites: z.array(z.string().min(1)).optional(),
	layout: z.enum(["single", "2h", "2v", "4"]).optional(),
	sidebarOpen: z.boolean().optional(),
	showDrawingTool: z.boolean().optional(),
	darkMode: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
	const profileKey = request.nextUrl.searchParams.get("profileKey");
	if (!profileKey) {
		return NextResponse.json({ error: "profileKey is required" }, { status: 400 });
	}

	const prisma = getPrismaClient();
	if (!prisma) {
		return NextResponse.json(
			{ error: "Persistence backend not configured (DATABASE_URL missing)" },
			{ status: 503 },
		);
	}

	try {
		const profile = await prisma.userProfile.upsert({
			where: { profileKey },
			update: {},
			create: { profileKey },
		});

		const layoutPreference = await prisma.layoutPreference.findUnique({
			where: { profileId: profile.id },
		});

		const defaultWatchlist = await prisma.watchlist.findFirst({
			where: { profileId: profile.id, isDefault: true },
			include: {
				items: {
					orderBy: { position: "asc" },
				},
			},
		});
		const dbLayoutMode =
			layoutPreference?.layoutMode === "single" ||
			layoutPreference?.layoutMode === "two_horizontal" ||
			layoutPreference?.layoutMode === "two_vertical" ||
			layoutPreference?.layoutMode === "four"
				? layoutPreference.layoutMode
				: undefined;

		return NextResponse.json({
			success: true,
			preferences: {
				profileKey,
				favorites: defaultWatchlist?.items?.map((item: { symbol: string }) => item.symbol) || [],
				layout: fromDbLayoutMode(dbLayoutMode),
				sidebarOpen: layoutPreference?.sidebarOpen ?? true,
				showDrawingTool: layoutPreference?.showDrawingTool ?? false,
				darkMode: layoutPreference?.darkMode ?? true,
			},
		});
	} catch (error: unknown) {
		return NextResponse.json(
			{
				error: "Failed to load preferences",
				details: getErrorMessage(error),
				hint: "Ensure prisma client is generated against current schema.",
			},
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = preferencesSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "invalid preferences payload",
				details: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	const body = parsed.data as PreferencesPayload;
	if (!body.profileKey) {
		return NextResponse.json({ error: "profileKey is required" }, { status: 400 });
	}

	const prisma = getPrismaClient();
	if (!prisma) {
		return NextResponse.json(
			{ error: "Persistence backend not configured (DATABASE_URL missing)" },
			{ status: 503 },
		);
	}

	try {
		const profile = await prisma.userProfile.upsert({
			where: { profileKey: body.profileKey },
			update: {},
			create: { profileKey: body.profileKey },
		});

		await prisma.layoutPreference.upsert({
			where: { profileId: profile.id },
			update: {
				layoutMode: toDbLayoutMode(body.layout ?? "single"),
				sidebarOpen: body.sidebarOpen ?? true,
				showDrawingTool: body.showDrawingTool ?? false,
				darkMode: body.darkMode ?? true,
			},
			create: {
				profileId: profile.id,
				layoutMode: toDbLayoutMode(body.layout ?? "single"),
				sidebarOpen: body.sidebarOpen ?? true,
				showDrawingTool: body.showDrawingTool ?? false,
				darkMode: body.darkMode ?? true,
			},
		});

		const symbols = Array.from(
			new Set((body.favorites || []).map((s) => s.trim()).filter(Boolean)),
		);

		let defaultWatchlist = await prisma.watchlist.findFirst({
			where: { profileId: profile.id, isDefault: true },
		});

		if (!defaultWatchlist) {
			defaultWatchlist = await prisma.watchlist.create({
				data: {
					profileId: profile.id,
					name: "Favorites",
					isDefault: true,
				},
			});
		}

		await prisma.watchlistItem.deleteMany({
			where: { watchlistId: defaultWatchlist.id },
		});

		if (symbols.length > 0) {
			await prisma.watchlistItem.createMany({
				data: symbols.map((symbol, index) => ({
					watchlistId: defaultWatchlist.id,
					symbol,
					position: index,
				})),
			});
		}

		return NextResponse.json({
			success: true,
			preferences: {
				profileKey: body.profileKey,
				favorites: symbols,
				layout: body.layout ?? "single",
				sidebarOpen: body.sidebarOpen ?? true,
				showDrawingTool: body.showDrawingTool ?? false,
				darkMode: body.darkMode ?? true,
			},
		});
	} catch (error: unknown) {
		return NextResponse.json(
			{
				error: "Failed to save preferences",
				details: getErrorMessage(error),
				hint: "Ensure prisma client is generated and schema is applied.",
			},
			{ status: 500 },
		);
	}
}
