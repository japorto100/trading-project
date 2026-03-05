import { Suspense } from "react";
import { KGEncryptionLabPanel } from "@/features/auth/KGEncryptionLabPanel";
import { auth } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/auth/runtime-flags";

async function KGEncryptionContent() {
	if (isAuthEnabled()) {
		await auth();
	}
	return <KGEncryptionLabPanel />;
}

export default function KGEncryptionLabPage() {
	return (
		<div className="mx-auto max-w-2xl space-y-8 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-black uppercase tracking-tighter">Encryption Lab</h1>
				<p className="text-muted-foreground text-sm">
					SOTA 2026: Direct Browser-to-Backend Hardware Encryption Testbed.
				</p>
			</div>
			<Suspense
				fallback={
					<div className="p-12 border border-white/5 bg-zinc-950/50 rounded-2xl animate-pulse text-xs text-center font-mono">
						Synchronizing Hardware Vault...
					</div>
				}
			>
				<KGEncryptionContent />
			</Suspense>
		</div>
	);
}
