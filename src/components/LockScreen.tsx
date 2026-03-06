"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useCallback, useState } from "react";

const MAX_ATTEMPTS = 5;

interface LockScreenProps {
	onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
	const { data: session } = useSession();
	const [password, setPassword] = useState("");
	const [attempts, setAttempts] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (loading) return;

			setLoading(true);
			setError(null);

			const result = await signIn("credentials", {
				username: session?.user?.name ?? session?.user?.email ?? "",
				password,
				redirect: false,
			});

			setLoading(false);
			setPassword("");

			if (result?.ok) {
				onUnlock();
			} else {
				const next = attempts + 1;
				setAttempts(next);
				if (next >= MAX_ATTEMPTS) {
					await signOut({ callbackUrl: "/auth/sign-in" });
				} else {
					setError(
						`Falsches Passwort. Noch ${MAX_ATTEMPTS - next} Versuch${MAX_ATTEMPTS - next === 1 ? "" : "e"}.`,
					);
				}
			}
		},
		[loading, password, attempts, session, onUnlock],
	);

	const handleSignOut = useCallback(async () => {
		await signOut({ callbackUrl: "/auth/sign-in" });
	}, []);

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-xl bg-background/80"
			aria-modal="true"
			role="dialog"
			aria-label="Session gesperrt"
		>
			<div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-muted-foreground"
							aria-hidden="true"
						>
							<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
					</div>
					<h2 className="text-lg font-semibold text-foreground">Session gesperrt</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						{session?.user?.name
							? `Angemeldet als ${session.user.name}`
							: "Bitte erneut authentifizieren"}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="lock-password"
							className="block text-sm font-medium text-foreground mb-1"
						>
							Passwort
						</label>
						<input
							id="lock-password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Passwort eingeben"
							autoFocus
							autoComplete="current-password"
							disabled={loading}
							className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
						/>
					</div>

					{error && (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={loading || !password}
						className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? "Wird geprüft…" : "Entsperren"}
					</button>
				</form>

				<div className="mt-4 text-center">
					<button
						type="button"
						onClick={handleSignOut}
						className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
					>
						Abmelden
					</button>
				</div>
			</div>
		</div>
	);
}
