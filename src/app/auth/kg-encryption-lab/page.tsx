import { redirect } from "next/navigation";
import { KGEncryptionLabPanel } from "@/features/auth/KGEncryptionLabPanel";
import { auth } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/auth/runtime-flags";

export const dynamic = "force-dynamic";

export default async function KGEncryptionLabPage() {
	if (isAuthEnabled()) {
		const session = await auth();
		if (!session?.user) {
			redirect("/auth/sign-in?next=%2Fauth%2Fkg-encryption-lab");
		}
	}

	return <KGEncryptionLabPanel />;
}
