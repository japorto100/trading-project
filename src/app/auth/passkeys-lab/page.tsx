import { Suspense } from "react";
import { PasskeyScaffoldLab } from "@/features/auth/PasskeyScaffoldLab";

export default function PasskeysLabPage() {
	return (
		<div className="mx-auto max-w-4xl p-6">
			<h1 className="text-3xl font-black uppercase tracking-tighter mb-8">WebAuthn Hardware Lab</h1>
			<Suspense
				fallback={
					<div className="p-12 text-center text-xs animate-pulse">
						Initializing WebAuthn Scaffolding...
					</div>
				}
			>
				<PasskeyScaffoldLab />
			</Suspense>
		</div>
	);
}
