"use client";

/**
 * SOTA 2026 Forgot Password Panel (Hybrid Recovery)
 * Option 1: Recovery Code (Hardware-less)
 * Option 3: Magic Link via Dev-Logs
 */

import { ArrowLeft, Loader2, ShieldQuestion, Terminal } from "lucide-react";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
	type ChangePasswordResult,
	recoverWithCode,
	requestPasswordReset,
} from "@/lib/actions/auth-actions";

const initialState: ChangePasswordResult = { success: false, error: "" };

export function ForgotPasswordPanel() {
	const { toast } = useToast();
	const router = useRouter();
	const [mode, setMode] = useState<"email" | "code">("email");

	const [emailState, emailAction, emailPending] = useActionState(
		requestPasswordReset,
		initialState,
	);
	const [codeState, codeAction, codePending] = useActionState(recoverWithCode, initialState);

	useEffect(() => {
		if (emailState.success) {
			toast({
				title: "Magic Link Dispatched",
				description: "Access the reset link via OpenObserve logs.",
			});
		} else if (!emailState.success && emailState.error) {
			toast({ title: "Error", description: emailState.error, variant: "destructive" });
		}
	}, [emailState, toast]);

	useEffect(() => {
		if (codeState.success) {
			toast({
				title: "Account Restored",
				description: "Password has been updated using your recovery code.",
			});
			router.push("/auth/sign-in");
		} else if (!codeState.success && codeState.error) {
			toast({ title: "Recovery Failed", description: codeState.error, variant: "destructive" });
		}
	}, [codeState, toast, router]);

	if (emailState.success && mode === "email") {
		return (
			<Card className="w-full max-w-md bg-zinc-950/50 backdrop-blur-xl border-white/5 shadow-2xl">
				<CardContent className="pt-10 pb-10 text-center flex flex-col items-center">
					<div className="p-4 bg-emerald-500/10 rounded-full mb-6">
						<Terminal className="h-10 w-10 text-emerald-400" />
					</div>
					<h3 className="text-xl font-bold mb-2">Check OTel Logs</h3>
					<p className="text-zinc-400 text-sm leading-relaxed mb-6">
						Dev-Flow active: The Magic Link was sent to **OpenObserve**. Check the
						`SECURITY_RECOVERY_TOKEN_GENERATED` event.
					</p>
					<Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl">
						<ArrowLeft className="mr-2 h-4 w-4" /> Back
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md bg-zinc-950/50 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
			<CardHeader>
				<CardTitle className="text-xl flex items-center gap-2">
					<ShieldQuestion className="h-5 w-5 text-blue-400" />
					Identity Recovery
				</CardTitle>
				<CardDescription>Choose your SOTA 2026 recovery method.</CardDescription>
			</CardHeader>

			<CardContent>
				<Tabs defaultValue="email" onValueChange={(v) => setMode(v as "email" | "code")}>
					<TabsList className="grid w-full grid-cols-2 mb-6 bg-black/40">
						<TabsTrigger value="email">Magic Link</TabsTrigger>
						<TabsTrigger value="code">Recovery Code</TabsTrigger>
					</TabsList>

					<TabsContent value="email">
						<form action={emailAction} className="space-y-5">
							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="name@example.com"
									required
									className="bg-black/40 border-white/10 h-11"
								/>
							</div>
							<Button
								type="submit"
								disabled={emailPending}
								className="w-full h-12 font-bold rounded-xl bg-blue-600 hover:bg-blue-500"
							>
								{emailPending ? <Loader2 className="animate-spin" /> : "Request Magic Link"}
							</Button>
						</form>
					</TabsContent>

					<TabsContent value="code">
						<form action={codeAction} className="space-y-5">
							<div className="space-y-2">
								<Label htmlFor="code-email">Account Email</Label>
								<Input
									id="code-email"
									name="email"
									type="email"
									placeholder="name@example.com"
									required
									className="bg-black/40 border-white/10 h-11"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="recoveryCode">One-Time Recovery Code</Label>
								<Input
									id="recoveryCode"
									name="recoveryCode"
									placeholder="XXXX-XXXX"
									required
									className="bg-black/40 border-white/10 h-11 font-mono uppercase"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="newPassword">New Password</Label>
								<Input
									id="newPassword"
									name="newPassword"
									type="password"
									required
									className="bg-black/40 border-white/10 h-11"
								/>
							</div>
							<Button
								type="submit"
								disabled={codePending}
								className="w-full h-12 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500"
							>
								{codePending ? <Loader2 className="animate-spin" /> : "Reset with Code"}
							</Button>
						</form>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
