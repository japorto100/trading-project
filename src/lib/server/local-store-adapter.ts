import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface LocalStoreTelemetryEvent {
	storeName: string;
	event: "schema_guard_failed" | "read_ok" | "write_ok";
	durationMs: number;
}

interface LocalStoreAdapterOptions<T> {
	storeName: string;
	filePath: string;
	defaultValue: T;
	isValid: (value: unknown) => value is T;
	onTelemetry?: (event: LocalStoreTelemetryEvent) => void;
}

export interface LocalStoreAdapter<T> {
	read: () => Promise<T>;
	write: (value: T) => Promise<void>;
	withWriteLock: <R>(task: () => Promise<R>) => Promise<R>;
}

export function createLocalStoreAdapter<T>(
	options: LocalStoreAdapterOptions<T>,
): LocalStoreAdapter<T> {
	let writeChain: Promise<void> = Promise.resolve();

	const emit = (event: LocalStoreTelemetryEvent["event"], startedAt: number) => {
		options.onTelemetry?.({
			storeName: options.storeName,
			event,
			durationMs: Math.max(0, Date.now() - startedAt),
		});
	};

	const read = async (): Promise<T> => {
		const startedAt = Date.now();
		try {
			const raw = await fs.readFile(options.filePath, "utf-8");
			const parsed = JSON.parse(raw) as unknown;
			if (!options.isValid(parsed)) {
				emit("schema_guard_failed", startedAt);
				return options.defaultValue;
			}
			emit("read_ok", startedAt);
			return parsed;
		} catch (error: unknown) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				(error as { code?: unknown }).code === "ENOENT"
			) {
				emit("read_ok", startedAt);
				return options.defaultValue;
			}
			throw error;
		}
	};

	const write = async (value: T): Promise<void> => {
		const startedAt = Date.now();
		await fs.mkdir(path.dirname(options.filePath), { recursive: true });
		const tmpPath = `${options.filePath}.${randomUUID()}.tmp`;
		await fs.writeFile(tmpPath, JSON.stringify(value, null, 2), "utf-8");
		await fs.rename(tmpPath, options.filePath);
		emit("write_ok", startedAt);
	};

	const withWriteLock = <R>(task: () => Promise<R>): Promise<R> => {
		const chained = writeChain.then(task, task);
		writeChain = chained.then(
			() => undefined,
			() => undefined,
		);
		return chained;
	};

	return {
		read,
		write,
		withWriteLock,
	};
}
