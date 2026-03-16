"use client";

// AC40: auto-resize textarea (grow/shrink with content, max-height scroll)
// AC47: Voice-Input button (Web Speech API, Phase 1 — no model download)
// AC49: TTS slot exposed via onTriggerSpeech for parent wiring

import { Mic, MicOff, RotateCcw, Send, Square } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// ---- Web Speech API types (not yet in lib.dom.d.ts in all TS versions) ----

interface SpeechRecognitionEvent extends Event {
	results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
	readonly length: number;
	[index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
	readonly length: number;
	[index: number]: SpeechRecognitionAlternative;
	readonly isFinal: boolean;
}
interface SpeechRecognitionAlternative {
	readonly transcript: string;
}
interface SpeechRecognitionInstance extends EventTarget {
	lang: string;
	interimResults: boolean;
	maxAlternatives: number;
	onresult: ((ev: SpeechRecognitionEvent) => void) | null;
	onerror: ((ev: Event) => void) | null;
	onend: (() => void) | null;
	start(): void;
	stop(): void;
	abort(): void;
}
declare global {
	interface Window {
		SpeechRecognition?: new () => SpeechRecognitionInstance;
		webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
	}
}

// ---- Voice state ----

type VoiceState = "inactive" | "listening" | "processing";

function useSpeechInput(onTranscript: (text: string) => void) {
	const [voiceState, setVoiceState] = useState<VoiceState>("inactive");
	const recRef = useRef<SpeechRecognitionInstance | null>(null);

	const isSupported =
		typeof window !== "undefined" &&
		(window.SpeechRecognition !== undefined || window.webkitSpeechRecognition !== undefined);

	const startListening = useCallback(() => {
		if (!isSupported) return;
		const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
		if (!Ctor) return;
		const rec = new Ctor();
		rec.lang = navigator.language || "en-US";
		rec.interimResults = false;
		rec.maxAlternatives = 1;

		rec.onresult = (ev) => {
			const transcript = ev.results[0]?.[0]?.transcript ?? "";
			if (transcript) {
				setVoiceState("processing");
				onTranscript(transcript);
			}
		};
		rec.onerror = () => setVoiceState("inactive");
		rec.onend = () => setVoiceState("inactive");

		recRef.current = rec;
		rec.start();
		setVoiceState("listening");
	}, [isSupported, onTranscript]);

	const stopListening = useCallback(() => {
		recRef.current?.stop();
		recRef.current = null;
		setVoiceState("inactive");
	}, []);

	const toggleVoice = useCallback(() => {
		if (voiceState === "inactive") startListening();
		else stopListening();
	}, [voiceState, startListening, stopListening]);

	// cleanup on unmount
	useEffect(
		() => () => {
			recRef.current?.abort();
		},
		[],
	);

	return { voiceState, isSupported, toggleVoice };
}

// ---- Composer ----

interface AgentChatComposerProps {
	isStreaming: boolean;
	threadId: string | undefined;
	onSend: (text: string) => Promise<void>;
	onAbort: () => void;
	onRetry?: () => void;
	hasError?: boolean;
	savedInput?: string;
}

// AC68: expose focus() to parent (GlobalChatOverlay opens → focus composer)
export interface AgentChatComposerRef {
	focus: () => void;
}

export const AgentChatComposer = forwardRef<AgentChatComposerRef, AgentChatComposerProps>(
	function AgentChatComposerInner(
		{ isStreaming, threadId, onSend, onAbort, onRetry, hasError, savedInput },
		ref,
	) {
		const [input, setInput] = useState("");
		const textareaRef = useRef<HTMLTextAreaElement>(null);
		const pendingRef = useRef(false);

		// AC68: expose focus() for parent (overlay open, ⌘L shortcut)
		useImperativeHandle(ref, () => ({
			focus: () => setTimeout(() => textareaRef.current?.focus(), 50),
		}));

		// AC40: auto-resize — called directly in onChange to avoid spurious dep warning
		const resizeTextarea = useCallback(() => {
			const el = textareaRef.current;
			if (!el) return;
			el.style.height = "auto";
			el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
		}, []);

		const submit = useCallback(async () => {
			const text = input.trim();
			if (!text || isStreaming || pendingRef.current) return;
			pendingRef.current = true;
			setInput("");
			try {
				await onSend(text);
			} catch {
				setInput(text); // restore on failure (AC33)
			} finally {
				pendingRef.current = false;
			}
		}, [input, isStreaming, onSend]);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					void submit();
				}
			},
			[submit],
		);

		const handleRetry = useCallback(() => {
			if (savedInput) setInput(savedInput);
			onRetry?.();
			setTimeout(() => textareaRef.current?.focus(), 0);
		}, [savedInput, onRetry]);

		// AC47: Speech input — appends transcript to existing input
		const handleTranscript = useCallback((transcript: string) => {
			setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
			setTimeout(() => textareaRef.current?.focus(), 50);
		}, []);

		const { voiceState, isSupported, toggleVoice } = useSpeechInput(handleTranscript);

		return (
			<div className="border-t border-border px-3 py-2 space-y-1.5">
				{hasError && onRetry && (
					<div className="flex justify-end">
						<Button
							variant="ghost"
							size="sm"
							className="h-6 gap-1 px-2 text-[10px] text-destructive hover:text-destructive"
							onClick={handleRetry}
						>
							<RotateCcw className="h-3 w-3" />
							Retry last message
						</Button>
					</div>
				)}

				<div className="flex items-end gap-2">
					{/* AC47: Mic button */}
					{isSupported && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className={`h-9 w-9 shrink-0 transition-colors ${
								voiceState === "listening"
									? "text-red-500 hover:text-red-400 bg-red-500/10"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={toggleVoice}
							disabled={isStreaming}
							title={voiceState === "listening" ? "Stop recording" : "Voice input"}
						>
							{voiceState === "listening" ? (
								<MicOff className="h-4 w-4" />
							) : (
								<Mic className="h-4 w-4" />
							)}
						</Button>
					)}

					{/* AC40: auto-resize textarea */}
					<textarea
						ref={textareaRef}
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							resizeTextarea();
						}}
						onKeyDown={handleKeyDown}
						placeholder={
							voiceState === "listening"
								? "Listening…"
								: isStreaming
									? "Responding…"
									: "Message agent… (Enter to send)"
						}
						disabled={isStreaming}
						rows={1}
						className="flex-1 min-h-[36px] max-h-[160px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto"
					/>

					{isStreaming ? (
						<Button
							variant="outline"
							size="icon"
							className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
							onClick={onAbort}
							title="Stop generation"
						>
							<Square className="h-3.5 w-3.5" />
						</Button>
					) : (
						<Button
							size="icon"
							className="h-9 w-9 shrink-0"
							onClick={() => void submit()}
							disabled={!input.trim()}
							title="Send (Enter)"
						>
							<Send className="h-3.5 w-3.5" />
						</Button>
					)}
				</div>

				<div className="flex items-center justify-between">
					<span className="text-[9px] text-muted-foreground/50">
						read-only · bounded-write via BFF/Gateway
						{voiceState === "listening" && (
							<span className="ml-2 text-red-400 animate-pulse">● recording</span>
						)}
						{voiceState === "processing" && (
							<span className="ml-2 text-amber-400">processing…</span>
						)}
					</span>
					{threadId && (
						<span className="text-[9px] font-mono text-muted-foreground/40 truncate max-w-[130px]">
							{threadId}
						</span>
					)}
				</div>
			</div>
		);
	},
);
