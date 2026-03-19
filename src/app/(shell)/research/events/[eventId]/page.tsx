import { redirect } from "next/navigation";
import { buildEventDetailHref } from "@/lib/event-detail";

interface ResearchEventPageProps {
	params: Promise<{
		eventId: string;
	}>;
	searchParams?: Promise<{
		returnTo?: string;
	}>;
}

export default async function ResearchEventPage({ params, searchParams }: ResearchEventPageProps) {
	const { eventId } = await params;
	const resolvedSearchParams = searchParams ? await searchParams : {};
	redirect(buildEventDetailHref(eventId, resolvedSearchParams.returnTo || "/research"));
}
