import { Suspense } from "react";
import { PasskeyDevicesPanel } from "@/features/auth/PasskeyDevicesPanel";
import { auth } from "@/lib/auth";

async function PasskeysContent() {
	const session = await auth();
	return (
		<div className="mx-auto max-w-2xl space-y-8 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-black uppercase tracking-tighter">Hardware Keys</h1>
				<p className="text-muted-foreground text-sm">
					Authentication methods bound to your physical device. Active Identity:{" "}
					{session?.user?.email || "Anonymous"}
				</p>
			</div>
			<PasskeyDevicesPanel />
		</div>
	);
}

export default function PasskeysPage() {
	return (
		<Suspense
			fallback={
				<div className="p-12 text-center text-xs animate-pulse font-mono">
					Querying TPM Secure Enclave...
				</div>
			}
		>
			<PasskeysContent />
		</Suspense>
	);
}
