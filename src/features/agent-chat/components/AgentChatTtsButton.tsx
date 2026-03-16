"use client";

// AC49: TTS-Button per assistant message — Browser SpeechSynthesis
// Play/Stop toggle; emoji-strip before reading; no backend required.

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Strip emoji characters before TTS (avoids robotic emoji-names)
const EMOJI_RE =
	/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]/gu;

function stripEmoji(text: string): string {
	return text.replace(EMOJI_RE, "").trim();
}

interface AgentChatTtsButtonProps {
	text: string;
	/** Called when this button starts speaking so siblings can stop */
	onSpeakStart?: () => void;
	/** External stop signal — when true, stop playback */
	shouldStop?: boolean;
}

export function AgentChatTtsButton({ text, onSpeakStart, shouldStop }: AgentChatTtsButtonProps) {
	const [speaking, setSpeaking] = useState(false);
	const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

	const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

	const stop = useCallback(() => {
		window.speechSynthesis?.cancel();
		uttRef.current = null;
		setSpeaking(false);
	}, []);

	const toggleTts = useCallback(() => {
		if (speaking) {
			stop();
			return;
		}
		const clean = stripEmoji(text);
		if (!clean) return;

		const utt = new SpeechSynthesisUtterance(clean);
		utt.lang = navigator.language || "en-US";
		utt.onend = () => setSpeaking(false);
		utt.onerror = () => setSpeaking(false);

		uttRef.current = utt;
		onSpeakStart?.();
		window.speechSynthesis.cancel(); // stop any other ongoing speech
		window.speechSynthesis.speak(utt);
		setSpeaking(true);
	}, [speaking, text, stop, onSpeakStart]);

	// External stop signal (e.g. another message started speaking)
	useEffect(() => {
		if (shouldStop && speaking) stop();
	}, [shouldStop, speaking, stop]);

	// Cleanup on unmount
	useEffect(
		() => () => {
			uttRef.current && window.speechSynthesis?.cancel();
		},
		[],
	);

	if (!isSupported) return null;

	return (
		<button
			type="button"
			onClick={toggleTts}
			className={`flex items-center gap-1 text-[10px] transition-colors ${
				speaking ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"
			}`}
			title={speaking ? "Stop reading" : "Read aloud"}
		>
			{speaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
		</button>
	);
}
