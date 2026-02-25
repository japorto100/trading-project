import { AuthRegisterPanel } from "@/features/auth/AuthRegisterPanel";

export const dynamic = "force-dynamic";

function sanitizeNextPath(value: string | string[] | undefined): string | undefined {
	const candidate = Array.isArray(value) ? value[0] : value;
	if (typeof candidate !== "string") return undefined;
	if (!candidate.startsWith("/") || candidate.startsWith("//")) return undefined;
	return candidate;
}

export default function RegisterPage({
	searchParams,
}: {
	searchParams?: Record<string, string | string[] | undefined>;
}) {
	return <AuthRegisterPanel nextPath={sanitizeNextPath(searchParams?.next)} />;
}
