"use client";

import { signOut, useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import { LockScreen } from "./LockScreen";

const IDLE_SOFT_MS = 10 * 60 * 1000; // 10 min → soft lock
const IDLE_HARD_MS = 8 * 60 * 60 * 1000; // 8h  → hard logout
const TVP_LOCK_KEY = "TVP_LOCK_STATE";

interface InactivityMonitorProps {
	children: ReactNode;
}

export function InactivityMonitor({ children }: InactivityMonitorProps) {
	const { status } = useSession();
	const [locked, setLocked] = useState(false);
	const resetRef = useRef<(() => void) | null>(null);

	// Restore lock state from sessionStorage on mount
	useEffect(() => {
		if (sessionStorage.getItem(TVP_LOCK_KEY) === "locked") {
			setLocked(true);
		}
	}, []);

	const onSoftIdle = useCallback(() => {
		if (status === "authenticated") {
			sessionStorage.setItem(TVP_LOCK_KEY, "locked");
			setLocked(true);
		}
	}, [status]);

	const onHardIdle = useCallback(() => {
		if (status === "authenticated") {
			signOut({ callbackUrl: "/auth/sign-in" });
		}
	}, [status]);

	const { reset } = useIdleTimer({
		timeout: IDLE_SOFT_MS,
		onIdle: onSoftIdle,
		crossTab: true,
		syncTimers: 200,
		throttle: 500,
		disabled: status !== "authenticated",
	});

	useIdleTimer({
		timeout: IDLE_HARD_MS,
		onIdle: onHardIdle,
		crossTab: true,
		syncTimers: 200,
		throttle: 500,
		disabled: status !== "authenticated",
	});

	// Keep reset accessible to onUnlock without circular dependency
	useEffect(() => {
		resetRef.current = reset;
	}, [reset]);

	const onUnlock = useCallback(() => {
		sessionStorage.removeItem(TVP_LOCK_KEY);
		setLocked(false);
		resetRef.current?.();
	}, []);

	return (
		<>
			{children}
			{locked && <LockScreen onUnlock={onUnlock} />}
		</>
	);
}
