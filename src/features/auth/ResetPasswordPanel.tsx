"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type ChangePasswordResult, resetPassword } from "@/lib/actions/auth-actions";

const initialState: ChangePasswordResult = { success: false, error: "" };

interface ResetPasswordPanelProps {
	email: string;
	token: string;
}

export function ResetPasswordPanel({ email, token }: ResetPasswordPanelProps) {
	const { toast } = useToast();
	const router = useRouter();
	const [state, action, isPending] = useActionState(resetPassword, initialState);

	useEffect(() => {
		if (state.success) {
			toast({
				title: "Credentials Restored",
				description: "Your password has been updated. You can now sign in.",
			});
			router.push("/auth/sign-in");
		} else if (!state.success && state.error) {
			toast({
				title: "Reset Failed",
				description: state.error,
				variant: "destructive",
			});
		}
	}, [state, toast, router]);

	return (
		<Card className="w-full max-w-md bg-zinc-950/50 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
			<CardHeader>
				<CardTitle className="text-xl flex items-center gap-2">
					<ShieldCheck className="h-5 w-5 text-emerald-400" />
					Finalize Reset
				</CardTitle>
				<CardDescription>Create a new high-entropy password for **{email}**.</CardDescription>
			</CardHeader>

			<CardContent>
				<form action={action} className="space-y-5">
					<input type="hidden" name="email" value={email} />
					<input type="hidden" name="token" value={token} />

					<div className="space-y-2">
						<Label htmlFor="newPassword">New Password</Label>
						<Input
							id="newPassword"
							name="newPassword"
							type="password"
							required
							autoComplete="new-password"
							className="bg-black/40 border-white/10 h-11"
						/>
						<p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
							Min 12 Characters
						</p>
					</div>

					<Button
						type="submit"
						disabled={isPending}
						className="w-full h-12 font-bold rounded-xl transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white"
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Restoring Access...
							</>
						) : (
							"Update Password"
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
