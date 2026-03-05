import { Suspense } from "react";
import { ConsentSettingsPanel } from "@/features/auth/ConsentSettingsPanel";
import { auth } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/auth/runtime-flags";

async function PrivacyContent() {
	if (isAuthEnabled()) {
		await auth();
	}
	return <ConsentSettingsPanel />;
}

export default function PrivacyPage() {
	return (
		<div className="mx-auto max-w-2xl space-y-8 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-black uppercase tracking-tighter">Privacy & Consent</h1>
				<p className="text-muted-foreground text-sm">
					Manage data retention policies and OpenObserve telemetry preferences.
				</p>
			</div>
			<Suspense
				fallback={
					<div className="p-8 border border-white/5 bg-zinc-950/50 rounded-xl animate-pulse text-xs text-center">
						Loading SOTA Privacy Preferences...
					</div>
				}
			>
				<PrivacyContent />
			</Suspense>
		</div>
	);
}
