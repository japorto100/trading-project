import { Suspense } from "react";
import { AuthRegisterPanel } from "@/features/auth/AuthRegisterPanel";

function sanitizeNextPath(value: string | string[] | undefined): string | undefined {
	const candidate = Array.isArray(value) ? value[0] : value;
	if (typeof candidate !== "string") return undefined;
	if (!candidate.startsWith("/") || candidate.startsWith("//")) return undefined;
	return candidate;
}

async function RegisterContent({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const resolvedSearchParams = await searchParams;
	return <AuthRegisterPanel nextPath={sanitizeNextPath(resolvedSearchParams?.next)} />;
}

export default function RegisterPage(props: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen w-full items-center justify-center text-xs uppercase tracking-widest animate-pulse">
					Initializing Hardware Registration...
				</div>
			}
		>
			<RegisterContent searchParams={props.searchParams} />
		</Suspense>
	);
}
