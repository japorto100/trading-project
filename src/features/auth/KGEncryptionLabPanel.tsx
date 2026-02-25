"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	getDecryptedKGRecord,
	getEncryptedKGRecordRaw,
	putEncryptedKGRecord,
} from "@/lib/kg/encrypted-indexeddb";

const DEMO_ID = "kg-node:demo";

type LabState =
	| { kind: "idle" }
	| { kind: "loaded"; raw: unknown; decrypted: unknown }
	| { kind: "error"; message: string };

export function KGEncryptionLabPanel() {
	const [state, setState] = useState<LabState>({ kind: "idle" });
	const [working, setWorking] = useState<string | null>(null);

	const writeDemo = async () => {
		setWorking("write");
		try {
			const payload = {
				type: "GeoEventNode",
				id: DEMO_ID,
				region: "europe",
				label: "Energy sanctions scenario",
				timestamp: new Date().toISOString(),
			};
			const raw = await putEncryptedKGRecord(DEMO_ID, payload);
			const decrypted = await getDecryptedKGRecord(DEMO_ID);
			setState({ kind: "loaded", raw, decrypted });
		} catch (error: unknown) {
			setState({ kind: "error", message: error instanceof Error ? error.message : "write failed" });
		} finally {
			setWorking(null);
		}
	};

	const readDemo = async () => {
		setWorking("read");
		try {
			const raw = await getEncryptedKGRecordRaw(DEMO_ID);
			const decrypted = await getDecryptedKGRecord(DEMO_ID);
			setState({ kind: "loaded", raw, decrypted });
		} catch (error: unknown) {
			setState({ kind: "error", message: error instanceof Error ? error.message : "read failed" });
		} finally {
			setWorking(null);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>KG Encryption Lab</CardTitle>
					<CardDescription>
						Phase 1e scaffold: encrypted IndexedDB storage for KG-like records using AES-GCM key
						material from server fallback key endpoint.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap gap-2">
						<Button type="button" onClick={() => void writeDemo()} disabled={working !== null}>
							{working === "write" ? "Writing..." : "Write Encrypted Demo Node"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={() => void readDemo()}
							disabled={working !== null}
						>
							{working === "read" ? "Reading..." : "Read Demo Node"}
						</Button>
					</div>

					<div className="rounded-md border bg-muted/30 p-3 text-xs leading-5">
						<div className="font-medium">Expected behavior</div>
						<ul className="mt-2 list-disc pl-5">
							<li>The raw IndexedDB record shows ciphertext + IV, not plaintext JSON.</li>
							<li>Decrypted payload is reconstructed in memory using the fetched AES-GCM key.</li>
							<li>
								This is a transitional fallback-key scaffold (PRF support remains future work).
							</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Result</CardTitle>
					<CardDescription>Raw encrypted record and decrypted payload</CardDescription>
				</CardHeader>
				<CardContent>
					<pre className="max-h-[480px] overflow-auto rounded-md border bg-background p-4 text-xs">
						{JSON.stringify(state, null, 2)}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
