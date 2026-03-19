import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ResearchModuleState } from "../types";

interface ResearchStatusBannerProps {
	degraded: boolean;
	degradedReasons: string[];
	moduleStates: ResearchModuleState[];
	source: "local" | "fallback";
}

export function ResearchStatusBanner({
	degraded,
	degradedReasons,
	moduleStates,
	source,
}: ResearchStatusBannerProps) {
	const degradedModules = moduleStates.filter((item) => item.status === "degraded");

	if (!degraded) {
		return (
			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>Research surface live</AlertTitle>
				<AlertDescription>
					Data is coming through the Research home boundary. Source: {source}.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Alert variant="destructive">
			<AlertTriangle className="h-4 w-4" />
			<AlertTitle>Research surface is degraded</AlertTitle>
			<AlertDescription>
				<div className="space-y-2">
					<p>Visible fallback is active. Reasons: {degradedReasons.join(", ")}</p>
					<p>
						Affected modules:{" "}
						{degradedModules.length > 0
							? degradedModules.map((item) => item.key).join(", ")
							: "unknown"}
					</p>
				</div>
			</AlertDescription>
		</Alert>
	);
}
