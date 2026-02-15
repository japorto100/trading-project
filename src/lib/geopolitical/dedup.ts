import { createHash } from "node:crypto";
import type { GeoCandidate, GeoEvent } from "@/lib/geopolitical/types";

function normalizeText(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[^\w\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function safeUrl(value: string): string {
	try {
		const url = new URL(value);
		url.hash = "";
		return url.toString();
	} catch {
		return value.trim();
	}
}

function hash(value: string): string {
	return createHash("sha1").update(value).digest("hex");
}

export function titleFingerprint(title: string): string {
	return hash(normalizeText(title));
}

export function sourceUrlFingerprints(urls: string[]): string[] {
	return urls
		.map((url) => safeUrl(url))
		.filter(Boolean)
		.map(hash);
}

function intersects<T>(left: T[], right: T[]): boolean {
	const set = new Set(left);
	return right.some((entry) => set.has(entry));
}

export function findDuplicateCandidate(
	incoming: Pick<GeoCandidate, "headline" | "sourceRefs" | "generatedAt">,
	existing: GeoCandidate[],
	windowHours = 72,
): GeoCandidate | null {
	const incomingTitle = titleFingerprint(incoming.headline);
	const incomingUrls = sourceUrlFingerprints(
		incoming.sourceRefs.map((source) => source.url).filter(Boolean),
	);
	const incomingMs = new Date(incoming.generatedAt).getTime();
	const windowMs = windowHours * 3_600_000;

	for (const candidate of existing) {
		const candidateMs = new Date(candidate.generatedAt).getTime();
		if (Number.isFinite(incomingMs) && Number.isFinite(candidateMs)) {
			if (Math.abs(incomingMs - candidateMs) > windowMs) continue;
		}

		const candidateTitle = titleFingerprint(candidate.headline);
		if (candidateTitle === incomingTitle) return candidate;

		const candidateUrls = sourceUrlFingerprints(
			candidate.sourceRefs.map((source) => source.url).filter(Boolean),
		);
		if (
			incomingUrls.length > 0 &&
			candidateUrls.length > 0 &&
			intersects(incomingUrls, candidateUrls)
		) {
			return candidate;
		}
	}

	return null;
}

export function findDuplicateEvent(
	incoming: Pick<GeoEvent, "title" | "sources" | "createdAt">,
	existing: GeoEvent[],
	windowHours = 96,
): GeoEvent | null {
	const incomingTitle = titleFingerprint(incoming.title);
	const incomingUrls = sourceUrlFingerprints(
		incoming.sources.map((source) => source.url).filter(Boolean),
	);
	const incomingMs = new Date(incoming.createdAt).getTime();
	const windowMs = windowHours * 3_600_000;

	for (const event of existing) {
		const eventMs = new Date(event.createdAt).getTime();
		if (Number.isFinite(incomingMs) && Number.isFinite(eventMs)) {
			if (Math.abs(incomingMs - eventMs) > windowMs) continue;
		}

		const eventTitle = titleFingerprint(event.title);
		if (eventTitle === incomingTitle) return event;

		const eventUrls = sourceUrlFingerprints(
			event.sources.map((source) => source.url).filter(Boolean),
		);
		if (incomingUrls.length > 0 && eventUrls.length > 0 && intersects(incomingUrls, eventUrls)) {
			return event;
		}
	}

	return null;
}
