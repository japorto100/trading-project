"use client";

/**
 * SOTA 2026 MFA Setup Panel
 *
 * Target: Multi-Factor Authentication (TOTP)
 * Features:
 * - Server-action driven secret generation
 * - Recovery code generation (Encrypted-at-rest potential)
 */

import { AlertTriangle, Copy, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { enableTOTP, setupTOTP } from "@/lib/actions/auth-actions";

export function MFASetupPanel() {
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();
	const [step, setStep] = useState<"idle" | "verify" | "completed">("idle");
	const [secretData, setSecretData] = useState<{ secret: string; otpauth: string } | null>(null);
	const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

	const handleInitialize = () => {
		startTransition(async () => {
			const res = await setupTOTP();
			if (res.success && res.data?.secret && res.data?.otpauth) {
				setSecretData({ secret: res.data.secret, otpauth: res.data.otpauth });
				setStep("verify");
			} else {
				toast({
					title: "MFA Error",
					description: !res.success ? res.error : "Invalid setup data",
					variant: "destructive",
				});
			}
		});
	};

	const handleVerify = async (formData: FormData) => {
		startTransition(async () => {
			const res = await enableTOTP(formData);
			if (res.success && res.data?.recoveryCodes) {
				setRecoveryCodes(res.data.recoveryCodes);
				setStep("completed");
				toast({ title: "Security Hardened", description: "MFA is now active on your account." });
			} else {
				toast({
					title: "Verification Failed",
					description: !res.success ? res.error : "MFA activation failed",
					variant: "destructive",
				});
			}
		});
	};

	if (step === "completed") {
		return (
			<Card className="w-full max-w-md bg-zinc-950/50 backdrop-blur-xl border-emerald-500/20 shadow-2xl">
				<CardHeader className="text-center">
					<div className="mx-auto p-4 bg-emerald-500/10 rounded-full w-fit mb-4">
						<ShieldCheck className="h-10 w-10 text-emerald-400" />
					</div>
					<CardTitle>MFA Active</CardTitle>
					<CardDescription>Two-factor authentication is protecting your vault.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-xs text-amber-200/80 leading-relaxed">
						<AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
						<div>
							<p className="font-bold mb-1">Store your recovery codes!</p>
							If you lose your device, these are the ONLY way to regain access.
						</div>
					</div>
					<div className="grid grid-cols-2 gap-2">
						{recoveryCodes.map((code) => (
							<code
								key={code}
								className="bg-black/40 p-2 rounded border border-white/5 text-[10px] font-mono text-center select-all"
							>
								{code}
							</code>
						))}
					</div>
					<Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
						Close Security Vault
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (step === "verify" && secretData) {
		return (
			<Card className="w-full max-w-md bg-zinc-950/50 backdrop-blur-xl border-white/5 shadow-2xl">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Lock className="h-5 w-5 text-blue-400" />
						Verify Authenticator
					</CardTitle>
					<CardDescription>Scan the code or enter the secret below into your app.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div className="bg-white p-4 rounded-xl mx-auto w-fit mb-4 shadow-inner border border-white/10">
							<QRCodeSVG
								value={secretData.otpauth}
								size={180}
								level="H"
								includeMargin={false}
								bgColor="#ffffff"
								fgColor="#000000"
							/>
						</div>

						<div className="p-3 bg-black/40 rounded-lg border border-white/5 flex items-center justify-between">
							<div className="flex flex-col">
								<span className="text-[9px] uppercase text-zinc-500 font-bold">Manual Secret</span>
								<code className="text-xs font-mono text-blue-400">{secretData.secret}</code>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => navigator.clipboard.writeText(secretData.secret)}
							>
								<Copy className="h-3 w-3" />
							</Button>
						</div>

						<form action={handleVerify} className="space-y-4">
							<input type="hidden" name="secret" value={secretData.secret} />
							<div className="space-y-2">
								<Label htmlFor="code">Authentication Code</Label>
								<Input
									id="code"
									name="code"
									placeholder="000 000"
									required
									className="h-12 text-center text-xl tracking-[0.5em] font-mono"
								/>
							</div>
							<Button
								type="submit"
								disabled={isPending}
								className="w-full h-12 bg-blue-600 hover:bg-blue-500 font-bold"
							>
								{isPending ? "Validating..." : "Enable Two-Factor"}
							</Button>
						</form>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md bg-zinc-950/50 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
			<CardHeader>
				<div className="flex items-center gap-3 mb-2">
					<div className="p-2 bg-blue-500/10 rounded-lg">
						<Smartphone className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
					</div>
					<CardTitle className="text-xl">Multi-Factor Security</CardTitle>
				</div>
				<CardDescription>
					Add an extra layer of protection using a TOTP authenticator app like Google Authenticator
					or 1Password.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button
					onClick={handleInitialize}
					disabled={isPending}
					className="w-full h-12 font-bold rounded-xl transition-all active:scale-95"
				>
					Initialize MFA Setup
				</Button>
			</CardContent>
		</Card>
	);
}
