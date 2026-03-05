import { randomUUID } from "node:crypto";
import path from "node:path";
import { canonicalizeFusionSymbol } from "@/lib/fusion-symbols";
import type { CreatePaperOrderInput, OrderStatus, PaperOrder } from "@/lib/orders/types";
import { createLocalStoreAdapter } from "@/lib/server/local-store-adapter";
import { assertPersistenceFallbackAllowed } from "@/lib/server/persistence-policy";
import { getPrismaClient } from "@/lib/server/prisma";

interface OrdersStoreFile {
	orders: PaperOrder[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "paper-orders.json");

const localStore = createLocalStoreAdapter<OrdersStoreFile>({
	storeName: "orders-store",
	filePath: STORE_PATH,
	defaultValue: { orders: [] },
	isValid: (value: unknown): value is OrdersStoreFile =>
		typeof value === "object" && value !== null && Array.isArray((value as OrdersStoreFile).orders),
});

type DbClient = NonNullable<ReturnType<typeof getPrismaClient>>;

interface DbOrderRecord {
	id: string;
	symbol: string;
	side: string;
	type: string;
	quantity: number;
	entryPrice: number;
	stopLoss: number | null;
	takeProfit: number | null;
	status: string;
	filledPrice: number | null;
	executedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	profile?: {
		profileKey: string;
	} | null;
	profileKey?: string;
}

function getDbClient(): DbClient | null {
	return getPrismaClient();
}

async function readStore(): Promise<OrdersStoreFile> {
	return localStore.read();
}

async function writeStore(data: OrdersStoreFile): Promise<void> {
	await localStore.write(data);
}

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
	return localStore.withWriteLock(task);
}

function sortNewestFirst(rows: PaperOrder[]): PaperOrder[] {
	return [...rows].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

function toPaperOrder(record: DbOrderRecord): PaperOrder {
	return {
		id: String(record.id),
		profileKey: String(record.profile?.profileKey ?? record.profileKey ?? ""),
		symbol: String(record.symbol),
		side: record.side as PaperOrder["side"],
		type: record.type as PaperOrder["type"],
		quantity: Number(record.quantity),
		entryPrice: Number(record.entryPrice),
		stopLoss: record.stopLoss === null ? undefined : Number(record.stopLoss),
		takeProfit: record.takeProfit === null ? undefined : Number(record.takeProfit),
		status: record.status as PaperOrder["status"],
		filledPrice: record.filledPrice === null ? undefined : Number(record.filledPrice),
		executedAt: record.executedAt ? new Date(record.executedAt).toISOString() : undefined,
		createdAt: new Date(record.createdAt).toISOString(),
		updatedAt: new Date(record.updatedAt).toISOString(),
	};
}

async function ensureDbProfile(db: DbClient, profileKey: string): Promise<{ id: string }> {
	const profile = await db.userProfile.upsert({
		where: { profileKey },
		update: {},
		create: { profileKey },
	});
	return { id: String(profile.id) };
}

async function listPaperOrdersDb(
	db: DbClient,
	profileKey: string,
	symbol?: string,
): Promise<PaperOrder[]> {
	const profile = await ensureDbProfile(db, profileKey);
	const rows = await db.paperOrderRecord.findMany({
		where: {
			profileId: profile.id,
			...(symbol ? { symbol: canonicalizeFusionSymbol(symbol) } : {}),
		},
		include: {
			profile: {
				select: { profileKey: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});
	return rows.map(toPaperOrder);
}

async function createPaperOrderDb(db: DbClient, input: CreatePaperOrderInput): Promise<PaperOrder> {
	const profile = await ensureDbProfile(db, input.profileKey);
	const created = await db.paperOrderRecord.create({
		data: {
			profileId: profile.id,
			symbol: canonicalizeFusionSymbol(input.symbol),
			side: input.side,
			type: input.type,
			quantity: input.quantity,
			entryPrice: input.entryPrice,
			stopLoss: input.stopLoss ?? null,
			takeProfit: input.takeProfit ?? null,
			status: "open",
		},
		include: {
			profile: { select: { profileKey: true } },
		},
	});
	return toPaperOrder(created);
}

async function updatePaperOrderStatusDb(
	db: DbClient,
	profileKey: string,
	orderId: string,
	status: OrderStatus,
): Promise<PaperOrder | null> {
	const existing = await db.paperOrderRecord.findFirst({
		where: {
			id: orderId,
			profile: { profileKey },
		},
		include: {
			profile: { select: { profileKey: true } },
		},
	});

	if (!existing) return null;

	const updated = await db.paperOrderRecord.update({
		where: { id: orderId },
		data: { status },
		include: {
			profile: { select: { profileKey: true } },
		},
	});

	return toPaperOrder(updated);
}

function shouldAutoFill(order: PaperOrder, marketPrice: number): boolean {
	if (order.status !== "open") return false;
	if (!Number.isFinite(marketPrice) || marketPrice <= 0) return false;

	const hasStop = typeof order.stopLoss === "number" && order.stopLoss > 0;
	const hasTake = typeof order.takeProfit === "number" && order.takeProfit > 0;
	if (!hasStop && !hasTake) return false;

	if (order.side === "buy") {
		if (hasStop && marketPrice <= (order.stopLoss as number)) return true;
		if (hasTake && marketPrice >= (order.takeProfit as number)) return true;
		return false;
	}

	if (hasStop && marketPrice >= (order.stopLoss as number)) return true;
	if (hasTake && marketPrice <= (order.takeProfit as number)) return true;
	return false;
}

async function evaluateTriggeredOrdersForSymbolDb(
	db: DbClient,
	symbol: string,
	marketPrice: number,
): Promise<PaperOrder[]> {
	const canonicalSymbol = canonicalizeFusionSymbol(symbol);
	const openRows = await db.paperOrderRecord.findMany({
		where: {
			symbol: canonicalSymbol,
			status: "open",
			OR: [{ stopLoss: { not: null } }, { takeProfit: { not: null } }],
		},
		include: {
			profile: { select: { profileKey: true } },
		},
	});

	const matched = openRows
		.map(toPaperOrder)
		.filter((order: PaperOrder) => shouldAutoFill(order, marketPrice));

	if (matched.length === 0) {
		return [];
	}

	const now = new Date();
	const updated: PaperOrder[] = [];
	for (const order of matched) {
		const row = await db.paperOrderRecord.update({
			where: { id: order.id },
			data: {
				status: "filled",
				filledPrice: marketPrice,
				executedAt: now,
			},
			include: {
				profile: { select: { profileKey: true } },
			},
		});
		updated.push(toPaperOrder(row));
	}
	return updated;
}

async function evaluateTriggeredOrdersForSymbolsDb(
	db: DbClient,
	symbolPrices: Record<string, number>,
): Promise<Record<string, PaperOrder[]>> {
	const canonicalEntries = Object.entries(symbolPrices)
		.map(([symbol, price]) => [canonicalizeFusionSymbol(symbol), Number(price)] as const)
		.filter(([, price]) => Number.isFinite(price) && price > 0);

	if (canonicalEntries.length === 0) return {};

	const uniqueSymbols = Array.from(new Set(canonicalEntries.map(([symbol]) => symbol)));
	const priceBySymbol = new Map<string, number>(canonicalEntries);

	const openRows = await db.paperOrderRecord.findMany({
		where: {
			symbol: { in: uniqueSymbols },
			status: "open",
			OR: [{ stopLoss: { not: null } }, { takeProfit: { not: null } }],
		},
		include: {
			profile: { select: { profileKey: true } },
		},
	});

	const matchedBySymbol = new Map<string, PaperOrder[]>();
	for (const order of openRows.map(toPaperOrder)) {
		const marketPrice = priceBySymbol.get(order.symbol);
		if (marketPrice === undefined) continue;
		if (!shouldAutoFill(order, marketPrice)) continue;
		const bucket = matchedBySymbol.get(order.symbol) ?? [];
		bucket.push(order);
		matchedBySymbol.set(order.symbol, bucket);
	}

	if (matchedBySymbol.size === 0) return {};

	const now = new Date();
	const updatedBySymbol: Record<string, PaperOrder[]> = {};
	for (const [symbol, orders] of matchedBySymbol.entries()) {
		const marketPrice = priceBySymbol.get(symbol);
		if (marketPrice === undefined) continue;
		for (const order of orders) {
			const row = await db.paperOrderRecord.update({
				where: { id: order.id },
				data: {
					status: "filled",
					filledPrice: marketPrice,
					executedAt: now,
				},
				include: {
					profile: { select: { profileKey: true } },
				},
			});
			if (!updatedBySymbol[symbol]) {
				updatedBySymbol[symbol] = [];
			}
			updatedBySymbol[symbol].push(toPaperOrder(row));
		}
	}
	return updatedBySymbol;
}

async function listPaperOrdersFile(profileKey: string, symbol?: string): Promise<PaperOrder[]> {
	const store = await readStore();
	const rows = store.orders.filter(
		(order) =>
			order.profileKey === profileKey &&
			(!symbol || canonicalizeFusionSymbol(order.symbol) === canonicalizeFusionSymbol(symbol)),
	);
	return sortNewestFirst(rows);
}

async function createPaperOrderFile(input: CreatePaperOrderInput): Promise<PaperOrder> {
	return withWriteLock(async () => {
		const store = await readStore();
		const nowIso = new Date().toISOString();
		const order: PaperOrder = {
			id: `po_${randomUUID()}`,
			profileKey: input.profileKey,
			symbol: canonicalizeFusionSymbol(input.symbol),
			side: input.side,
			type: input.type,
			quantity: input.quantity,
			entryPrice: input.entryPrice,
			stopLoss: input.stopLoss,
			takeProfit: input.takeProfit,
			status: "open",
			createdAt: nowIso,
			updatedAt: nowIso,
		};

		store.orders.unshift(order);
		await writeStore(store);
		return order;
	});
}

async function updatePaperOrderStatusFile(
	profileKey: string,
	orderId: string,
	status: OrderStatus,
): Promise<PaperOrder | null> {
	return withWriteLock(async () => {
		const store = await readStore();
		const index = store.orders.findIndex(
			(order) => order.id === orderId && order.profileKey === profileKey,
		);

		if (index < 0) {
			return null;
		}

		const current = store.orders[index];
		const next: PaperOrder = {
			...current,
			status,
			updatedAt: new Date().toISOString(),
		};
		store.orders[index] = next;
		await writeStore(store);
		return next;
	});
}

async function evaluateTriggeredOrdersForSymbolFile(
	symbol: string,
	marketPrice: number,
): Promise<PaperOrder[]> {
	return withWriteLock(async () => {
		const store = await readStore();
		const canonicalSymbol = canonicalizeFusionSymbol(symbol);
		const nowIso = new Date().toISOString();
		const updated: PaperOrder[] = [];

		store.orders = store.orders.map((order) => {
			if (canonicalizeFusionSymbol(order.symbol) !== canonicalSymbol) {
				return order;
			}

			if (!shouldAutoFill(order, marketPrice)) {
				return order;
			}

			const next: PaperOrder = {
				...order,
				status: "filled",
				filledPrice: marketPrice,
				executedAt: nowIso,
				updatedAt: nowIso,
			};
			updated.push(next);
			return next;
		});

		if (updated.length > 0) {
			await writeStore(store);
		}

		return updated;
	});
}

async function evaluateTriggeredOrdersForSymbolsFile(
	symbolPrices: Record<string, number>,
): Promise<Record<string, PaperOrder[]>> {
	return withWriteLock(async () => {
		const store = await readStore();
		const canonicalPrices = new Map<string, number>();
		for (const [symbol, price] of Object.entries(symbolPrices)) {
			const parsed = Number(price);
			if (!Number.isFinite(parsed) || parsed <= 0) continue;
			canonicalPrices.set(canonicalizeFusionSymbol(symbol), parsed);
		}

		if (canonicalPrices.size === 0) return {};

		const nowIso = new Date().toISOString();
		const updatedBySymbol: Record<string, PaperOrder[]> = {};

		store.orders = store.orders.map((order) => {
			const canonicalSymbol = canonicalizeFusionSymbol(order.symbol);
			const marketPrice = canonicalPrices.get(canonicalSymbol);
			if (marketPrice === undefined) return order;
			if (!shouldAutoFill(order, marketPrice)) return order;

			const next: PaperOrder = {
				...order,
				status: "filled",
				filledPrice: marketPrice,
				executedAt: nowIso,
				updatedAt: nowIso,
			};
			if (!updatedBySymbol[canonicalSymbol]) {
				updatedBySymbol[canonicalSymbol] = [];
			}
			updatedBySymbol[canonicalSymbol].push(next);
			return next;
		});

		if (Object.keys(updatedBySymbol).length > 0) {
			await writeStore(store);
		}

		return updatedBySymbol;
	});
}

export async function listPaperOrders(profileKey: string, symbol?: string): Promise<PaperOrder[]> {
	const db = getDbClient();
	if (db) {
		try {
			return await listPaperOrdersDb(db, profileKey, symbol);
		} catch (error) {
			assertPersistenceFallbackAllowed("Orders DB read failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Orders DB client unavailable");
	}

	return listPaperOrdersFile(profileKey, symbol);
}

export async function createPaperOrder(input: CreatePaperOrderInput): Promise<PaperOrder> {
	const db = getDbClient();
	if (db) {
		try {
			return await createPaperOrderDb(db, input);
		} catch (error) {
			assertPersistenceFallbackAllowed("Orders DB write failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Orders DB client unavailable");
	}

	return createPaperOrderFile(input);
}

export async function updatePaperOrderStatus(
	profileKey: string,
	orderId: string,
	status: OrderStatus,
): Promise<PaperOrder | null> {
	const db = getDbClient();
	if (db) {
		try {
			return await updatePaperOrderStatusDb(db, profileKey, orderId, status);
		} catch (error) {
			assertPersistenceFallbackAllowed("Orders DB status update failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Orders DB client unavailable");
	}

	return updatePaperOrderStatusFile(profileKey, orderId, status);
}

export async function evaluateTriggeredOrdersForSymbol(
	symbol: string,
	marketPrice: number,
): Promise<PaperOrder[]> {
	const db = getDbClient();
	if (db) {
		try {
			return await evaluateTriggeredOrdersForSymbolDb(db, symbol, marketPrice);
		} catch (error) {
			assertPersistenceFallbackAllowed("Orders DB trigger evaluation failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Orders DB client unavailable");
	}

	return evaluateTriggeredOrdersForSymbolFile(symbol, marketPrice);
}

export async function evaluateTriggeredOrdersForSymbols(
	symbolPrices: Record<string, number>,
): Promise<Record<string, PaperOrder[]>> {
	const db = getDbClient();
	if (db) {
		try {
			return await evaluateTriggeredOrdersForSymbolsDb(db, symbolPrices);
		} catch (error) {
			assertPersistenceFallbackAllowed("Orders DB multi-symbol trigger evaluation failed");
			void error;
		}
	} else {
		assertPersistenceFallbackAllowed("Orders DB client unavailable");
	}

	return evaluateTriggeredOrdersForSymbolsFile(symbolPrices);
}
