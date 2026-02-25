import { redirect } from "next/navigation";
import { ConsentSettingsPanel } from "@/features/auth/ConsentSettingsPanel";
import { auth } from "@/lib/auth";
import { isAuthEnabled } from "@/lib/auth/runtime-flags";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
	if (isAuthEnabled()) {
		const session = await auth();
		if (!session?.user) {
			redirect("/auth/sign-in?next=%2Fauth%2Fprivacy");
		}
	}

	return <ConsentSettingsPanel />;
}
