"use client";

import type { ReactNode } from "react";
import {
	type GeoPanelRuntimeStatus,
	GeoPanelStatusBadge,
} from "@/features/geopolitical/shell/panels/GeoPanelStatusBadge";
import { cn } from "@/lib/utils";

interface GeoPanelFrameProps {
	title: string;
	description?: string;
	status?: GeoPanelRuntimeStatus;
	statusLabel?: string;
	meta?: ReactNode;
	badge?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	bodyClassName?: string;
	headerClassName?: string;
}

export function GeoPanelFrame({
	title,
	description,
	status,
	statusLabel,
	meta,
	badge,
	actions,
	children,
	className,
	bodyClassName,
	headerClassName,
}: GeoPanelFrameProps) {
	return (
		<section className={cn("rounded-md border border-border bg-card p-3", className)}>
			<div className={cn("flex items-start justify-between gap-3", headerClassName)}>
				<div className="min-w-0">
					<h2 className="text-sm font-semibold">{title}</h2>
					{description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
					{meta}
				</div>
				<div className="flex shrink-0 items-center gap-2">
					{actions}
					{status ? <GeoPanelStatusBadge status={status} label={statusLabel} /> : null}
					{badge}
				</div>
			</div>
			<div className={cn("mt-3", bodyClassName)}>{children}</div>
		</section>
	);
}
