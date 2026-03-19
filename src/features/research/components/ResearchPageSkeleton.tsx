export function ResearchPageSkeleton() {
	return (
		<div className="min-h-full overflow-y-auto bg-background">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
				<div className="h-52 animate-pulse rounded-3xl border border-border/70 bg-card/60" />
				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
					<div className="space-y-6">
						<div className="grid gap-4 lg:grid-cols-3">
							<div className="h-44 animate-pulse rounded-2xl border border-border/70 bg-card/50" />
							<div className="h-44 animate-pulse rounded-2xl border border-border/70 bg-card/50" />
							<div className="h-44 animate-pulse rounded-2xl border border-border/70 bg-card/50" />
						</div>
						<div className="grid gap-6 lg:grid-cols-2">
							<div className="h-60 animate-pulse rounded-2xl border border-border/70 bg-card/50" />
							<div className="h-60 animate-pulse rounded-2xl border border-border/70 bg-card/50" />
						</div>
					</div>
					<div className="h-80 animate-pulse rounded-3xl border border-border/70 bg-card/50" />
				</div>
			</div>
		</div>
	);
}
