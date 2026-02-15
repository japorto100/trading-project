import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteTradeJournalEntry, updateTradeJournalEntry } from "@/lib/server/trade-journal-store";
import { getErrorMessage } from "@/lib/utils";

interface ParamsShape {
	params: Promise<{
		entryId: string;
	}>;
}

const updateJournalSchema = z.object({
	profileKey: z.string().min(1),
	note: z.string().min(1).optional(),
	tags: z.array(z.string().min(1)).max(20).optional(),
	context: z.record(z.string(), z.unknown()).optional(),
	screenshotUrl: z.string().url().optional(),
});

const deleteJournalSchema = z.object({
	profileKey: z.string().min(1),
});

export async function PATCH(request: NextRequest, context: ParamsShape) {
	const { entryId } = await context.params;

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = updateJournalSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "invalid journal update payload",
				details: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	try {
		const updated = await updateTradeJournalEntry(parsed.data.profileKey, entryId, {
			note: parsed.data.note,
			tags: parsed.data.tags,
			context: parsed.data.context,
			screenshotUrl: parsed.data.screenshotUrl,
		});
		if (!updated) {
			return NextResponse.json({ error: "entry not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, entry: updated });
	} catch (error: unknown) {
		return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, context: ParamsShape) {
	const { entryId } = await context.params;

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
	}

	const parsed = deleteJournalSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				error: "invalid delete payload",
				details: parsed.error.flatten(),
			},
			{ status: 400 },
		);
	}

	try {
		const deleted = await deleteTradeJournalEntry(parsed.data.profileKey, entryId);
		if (!deleted) {
			return NextResponse.json({ error: "entry not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
	}
}
