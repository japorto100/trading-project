import { redirect } from "next/navigation";
import { PasskeyDevicesPanel } from "@/features/auth/PasskeyDevicesPanel";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PasskeysPage() {
	const session = await auth();
	if (!session?.user) {
		redirect("/auth/sign-in?next=%2Fauth%2Fpasskeys");
	}
	return <PasskeyDevicesPanel />;
}
