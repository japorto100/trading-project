import { ResearchEventDetailPage } from "@/features/research/components/ResearchEventDetailPage";

interface SharedEventPageProps {
	params: Promise<{
		eventId: string;
	}>;
}

export default async function SharedEventPage({ params }: SharedEventPageProps) {
	const { eventId } = await params;
	return <ResearchEventDetailPage eventId={eventId} />;
}
