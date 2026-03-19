export function CalendarPageSkeleton() {
	return (
		<div className="min-h-full overflow-y-auto bg-background">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
				<div className="h-48 animate-pulse rounded-3xl border border-border/70 bg-card/50" />
				<div className="h-16 animate-pulse rounded-2xl border border-border/70 bg-card/50" />
				<div className="space-y-4">
					<div className="h-44 animate-pulse rounded-2xl border border-border/70 bg-card/50" />
					<div className="h-44 animate-pulse rounded-2xl border border-border/70 bg-card/50" />
					<div className="h-44 animate-pulse rounded-2xl border border-border/70 bg-card/50" />
				</div>
			</div>
		</div>
	);
}
