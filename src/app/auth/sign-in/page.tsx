import { Suspense } from "react";
import { AuthSignInPanel } from "@/features/auth/AuthSignInPanel";

function sanitizeNextPath(value: string | string[] | undefined): string | undefined {
	const candidate = Array.isArray(value) ? value[0] : value;
	if (typeof candidate !== "string") return undefined;
	if (!candidate.startsWith("/") || candidate.startsWith("//")) return undefined;
	return candidate;
}

async function SignInContent({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const resolvedSearchParams = await searchParams;
	return <AuthSignInPanel nextPath={sanitizeNextPath(resolvedSearchParams?.next)} />;
}

export default function SignInPage(props: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen w-full items-center justify-center text-xs uppercase tracking-widest animate-pulse">
					Establishing Secure Link...
				</div>
			}
		>
			<SignInContent searchParams={props.searchParams} />
		</Suspense>
	);
}
