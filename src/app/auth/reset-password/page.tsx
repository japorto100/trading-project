import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ResetPasswordPanel } from "@/features/auth/ResetPasswordPanel";

interface PageProps {
	searchParams: Promise<{ email?: string; token?: string }>;
}

async function ResetPasswordContent({ searchParams }: PageProps) {
	const { email, token } = await searchParams;

	if (!email || !token) {
		redirect("/auth/forgot-password");
	}

	return <ResetPasswordPanel email={email} token={token} />;
}

export default function ResetPasswordPage(props: PageProps) {
	return (
		<div className="flex min-h-[80vh] items-center justify-center p-6">
			<Suspense
				fallback={
					<div className="animate-pulse text-xs uppercase tracking-widest">
						Validating Reset Token...
					</div>
				}
			>
				<ResetPasswordContent searchParams={props.searchParams} />
			</Suspense>
		</div>
	);
}
