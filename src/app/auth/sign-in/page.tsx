import { AuthSignInPanel } from "@/features/auth/AuthSignInPanel";

export const dynamic = "force-dynamic";

function sanitizeNextPath(value: string | string[] | undefined): string | undefined {
	const candidate = Array.isArray(value) ? value[0] : value;
	if (typeof candidate !== "string") return undefined;
	if (!candidate.startsWith("/") || candidate.startsWith("//")) return undefined;
	return candidate;
}

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const resolvedSearchParams = await searchParams;
	return <AuthSignInPanel nextPath={sanitizeNextPath(resolvedSearchParams?.next)} />;
}
