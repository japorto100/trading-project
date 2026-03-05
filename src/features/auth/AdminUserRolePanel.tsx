"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AppRole = "viewer" | "analyst" | "trader" | "admin";

interface UserItem {
	id: string;
	email: string | null;
	name: string | null;
	role: AppRole;
	createdAt: string;
	updatedAt: string;
}

interface UsersResponse {
	actor: {
		id: string;
		email: string | null;
		role: AppRole;
	};
	total: number;
	items: UserItem[];
}

type State =
	| { kind: "loading" }
	| { kind: "error"; message: string }
	| { kind: "ready"; data: UsersResponse };

const ROLES: AppRole[] = ["viewer", "analyst", "trader", "admin"];

async function fetchUsers(query: string): Promise<UsersResponse> {
	const url = new URL("/api/admin/users", window.location.origin);
	if (query.trim()) {
		url.searchParams.set("q", query.trim());
	}
	const response = await fetch(url, {
		method: "GET",
		credentials: "include",
		cache: "no-store",
	});
	const json = (await response.json()) as UsersResponse & { error?: string };
	if (!response.ok) {
		throw new Error(json.error ?? `request failed (${response.status})`);
	}
	return json;
}

function formatDate(value: string): string {
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
}

export function AdminUserRolePanel() {
	const [state, setState] = useState<State>({ kind: "loading" });
	const [query, setQuery] = useState("");
	const [busyUserId, setBusyUserId] = useState<string | null>(null);

	const load = useCallback(async (q: string) => {
		setState({ kind: "loading" });
		try {
			const data = await fetchUsers(q);
			setState({ kind: "ready", data });
		} catch (error: unknown) {
			setState({
				kind: "error",
				message: error instanceof Error ? error.message : "unknown load error",
			});
		}
	}, []);

	useEffect(() => {
		void load("");
	}, [load]);

	const updateRole = async (user: UserItem, role: AppRole) => {
		if (role === user.role) return;
		setBusyUserId(user.id);
		try {
			const response = await fetch("/api/admin/users", {
				method: "PATCH",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId: user.id, role }),
			});
			const json = (await response.json()) as { error?: string };
			if (!response.ok) {
				throw new Error(json.error ?? `update failed (${response.status})`);
			}
			await load(query);
		} catch (error: unknown) {
			setState({
				kind: "error",
				message: error instanceof Error ? error.message : "unknown update error",
			});
		} finally {
			setBusyUserId(null);
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Admin Role Management</CardTitle>
					<CardDescription>
						Assign RBAC roles (`viewer`, `analyst`, `trader`, `admin`) for local users.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap items-end gap-3">
						<div className="min-w-[260px] flex-1 space-y-2">
							<Label htmlFor="user-search">Search user</Label>
							<Input
								id="user-search"
								name="admin_user_search"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="email or name"
							/>
						</div>
						<Button type="button" onClick={() => void load(query)}>
							Refresh
						</Button>
					</div>

					{state.kind === "loading" ? (
						<div className="rounded-md border p-4 text-sm text-muted-foreground">
							Loading users...
						</div>
					) : null}
					{state.kind === "error" ? (
						<div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
							{state.message}
						</div>
					) : null}
					{state.kind === "ready" ? (
						<div className="space-y-3">
							<div className="text-xs text-muted-foreground">
								Actor: {state.data.actor.email ?? state.data.actor.id} ({state.data.actor.role}) ·
								Users: {state.data.total}
							</div>
							<div className="space-y-3">
								{state.data.items.map((user) => (
									<div
										key={user.id}
										className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_220px]"
									>
										<div className="space-y-1 text-sm">
											<div className="font-medium">{user.email ?? user.name ?? user.id}</div>
											<div className="text-muted-foreground">Name: {user.name ?? "—"}</div>
											<div className="text-muted-foreground">
												Created: {formatDate(user.createdAt)}
											</div>
											<div className="text-muted-foreground">
												Updated: {formatDate(user.updatedAt)}
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor={`role-${user.id}`}>Role</Label>
											<select
												id={`role-${user.id}`}
												name={`role_${user.id}`}
												className="h-9 w-full rounded-md border bg-background px-3 text-sm"
												value={user.role}
												disabled={busyUserId !== null}
												onChange={(event) => {
													void updateRole(user, event.target.value as AppRole);
												}}
											>
												{ROLES.map((role) => (
													<option key={role} value={role}>
														{role}
													</option>
												))}
											</select>
											{busyUserId === user.id ? (
												<div className="text-xs text-muted-foreground">Updating role...</div>
											) : null}
										</div>
									</div>
								))}
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
