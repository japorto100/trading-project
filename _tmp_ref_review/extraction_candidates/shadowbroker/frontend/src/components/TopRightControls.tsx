"use client";

import { useState } from "react";
import { Github, MessageSquare, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import packageJson from "../../package.json";

export default function TopRightControls() {
    const [updateStatus, setUpdateStatus] = useState<"idle" | "checking" | "available" | "uptodate" | "error">("idle");
    const [latestVersion, setLatestVersion] = useState<string>("");

    const currentVersion = packageJson.version;

    const checkForUpdates = async () => {
        setUpdateStatus("checking");
        try {
            const res = await fetch("https://api.github.com/repos/BigBodyCobain/Shadowbroker/releases/latest");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            
            // Remove 'v' prefix if it exists to compare semver cleanly
            const latest = data.tag_name?.replace('v', '') || data.name?.replace('v', '');
            const current = currentVersion.replace('v', '');
            
            if (latest && latest !== current) {
                setLatestVersion(latest);
                setUpdateStatus("available");
            } else {
                setUpdateStatus("uptodate");
                setTimeout(() => setUpdateStatus("idle"), 3000);
            }
        } catch (err) {
            console.error("Update check failed:", err);
            setUpdateStatus("error");
            setTimeout(() => setUpdateStatus("idle"), 3000);
        }
    };

    return (
        <div className="flex items-center gap-2 mb-1 justify-end">
            <a
                href="https://github.com/BigBodyCobain/Shadowbroker/discussions"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-primary)]/50 backdrop-blur-md border border-[var(--border-primary)] rounded-lg hover:border-cyan-500/50 hover:bg-[var(--hover-accent)] transition-all text-[10px] text-[var(--text-secondary)] font-mono cursor-pointer"
            >
                <MessageSquare size={12} className="text-cyan-400 w-3 h-3" />
                <span className="tracking-widest">DISCUSSIONS</span>
            </a>

            {updateStatus === "available" ? (
                <a
                    href="https://github.com/BigBodyCobain/Shadowbroker/releases/latest"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-500/10 backdrop-blur-md border border-green-500/50 rounded-lg hover:bg-green-500/20 transition-all text-[10px] text-green-400 font-mono cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                    <Download size={12} className="w-3 h-3" />
                    <span className="tracking-widest animate-pulse">v{latestVersion} UPDATE!</span>
                </a>
            ) : (
                <button
                    onClick={checkForUpdates}
                    disabled={updateStatus === "checking"}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-primary)]/50 backdrop-blur-md border border-[var(--border-primary)] rounded-lg hover:border-cyan-500/50 hover:bg-[var(--hover-accent)] transition-all text-[10px] text-[var(--text-secondary)] font-mono cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {updateStatus === "checking" && <Github size={12} className="w-3 h-3 animate-spin text-cyan-400" />}
                    {updateStatus === "idle" && <Github size={12} className="w-3 h-3 text-cyan-400" />}
                    {updateStatus === "uptodate" && <CheckCircle2 size={12} className="w-3 h-3 text-green-400" />}
                    {updateStatus === "error" && <AlertCircle size={12} className="w-3 h-3 text-red-400" />}
                    
                    <span className="tracking-widest">
                        {updateStatus === "checking" ? "CHECKING..." : 
                         updateStatus === "uptodate" ? "UP TO DATE" : 
                         updateStatus === "error" ? "CHECK FAILED" : 
                         "CHECK UPDATES"}
                    </span>
                </button>
            )}
        </div>
    );
}
