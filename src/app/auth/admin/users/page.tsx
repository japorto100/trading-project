import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminUserRolePanel } from "@/features/auth/AdminUserRolePanel";
import { auth } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/auth/runtime-flags";

async function AdminUsersContent() {
	if (isAuthEnabled()) {
		const session = await auth();
		if (!session?.user) {
			redirect("/auth/sign-in?next=%2Fauth%2Fadmin%2Fusers");
		}
		if ((session.user.role ?? "viewer") !== "admin") {
			redirect("/auth/security");
		}
	}

	return <AdminUserRolePanel />;
}

export default function AuthAdminUsersPage() {
	return (
		<Suspense
			fallback={
				<div className="p-8 text-center text-xs animate-pulse">
					Initializing SOTA Administrative Interface...
				</div>
			}
		>
			<AdminUsersContent />
		</Suspense>
	);
}
