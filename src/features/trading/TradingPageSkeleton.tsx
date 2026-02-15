"use client";

import { BarChart3 } from "lucide-react";

export function TradingPageSkeleton() {
	return (
		<div className="h-screen flex flex-col bg-slate-950 text-white">
			<div className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center px-4">
				<div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg px-3 py-1.5">
					<BarChart3 className="h-5 w-5 text-white" />
					<span className="font-bold text-white text-lg">TradeView Pro</span>
				</div>
			</div>
			<div className="flex-1 flex">
				<div className="w-64 border-r border-slate-800 bg-slate-900/30 p-4" />
				<div className="flex-1 p-4" />
			</div>
		</div>
	);
}

export default TradingPageSkeleton;
