import { type NextRequest, NextResponse } from "next/server";
import { deleteGeoDrawing } from "@/lib/server/geopolitical-drawings-store";

interface ParamsShape {
	params: Promise<{ drawingId: string }>;
}

export async function DELETE(_request: NextRequest, context: ParamsShape) {
	const { drawingId } = await context.params;
	if (!drawingId) {
		return NextResponse.json({ error: "drawingId is required" }, { status: 400 });
	}

	const removed = await deleteGeoDrawing(drawingId);
	if (!removed) {
		return NextResponse.json({ error: "drawing not found" }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}
