"use client";

// Session-isolated SSE chat hook — Phase 22a
// Manages in-flight state, stream assembly, abort, and thread lifecycle.
// Security: all tool actions flow via BFF → Gateway (no browser-direct paths).

import { useCallback, useReducer, useRef } from "react";
import type {
	ChatBlock,
	ChatMessage,
	SseChunkEvent,
	SseDoneEvent,
	SseErrorEvent,
	SseToolEvent,
} from "../types";

// ---- helpers ----

let idCounter = 0;
function localId(prefix = "msg"): string {
	return `${prefix}-${Date.now()}-${(idCounter++).toString(36)}`;
}

function buildUserMessage(content: string): ChatMessage {
	return {
		id: localId("u"),
		role: "user",
		blocks: [{ id: localId("b"), type: "text", content }],
		content,
		createdAt: Date.now(),
	};
}

function buildAssistantPlaceholder(): ChatMessage {
	return {
		id: localId("ph"),
		role: "assistant",
		blocks: [{ id: localId("b"), type: "text", content: "" }],
		content: "",
		createdAt: Date.now(),
		isStreaming: true,
	};
}

// ---- reducer ----

type Action =
	| { type: "append_user"; message: ChatMessage }
	| { type: "start_assistant"; message: ChatMessage }
	| { type: "append_chunk"; delta: string }
	| { type: "add_tool_block"; block: ChatBlock }
	| { type: "seal_assistant"; messageId: string }
	| { type: "error_assistant"; text: string }
	| { type: "toggle_block_collapse"; blockId: string }
	| { type: "clear_error" };

interface ReducerState {
	messages: ChatMessage[];
	inFlightId: string | null;
	error: string | null;
}

function chatReducer(state: ReducerState, action: Action): ReducerState {
	switch (action.type) {
		case "append_user":
			return { ...state, messages: [...state.messages, action.message], error: null };

		case "start_assistant":
			return {
				...state,
				messages: [...state.messages, action.message],
				inFlightId: action.message.id,
			};

		case "append_chunk": {
			if (!state.inFlightId) return state;
			const msgs = state.messages.map((m) => {
				if (m.id !== state.inFlightId) return m;
				const blocks = m.blocks.map((b, i) =>
					i === 0 && b.type === "text" ? { ...b, content: b.content + action.delta } : b,
				);
				const content = blocks.find((b) => b.type === "text")?.content ?? "";
				return { ...m, blocks, content };
			});
			return { ...state, messages: msgs };
		}

		case "add_tool_block": {
			if (!state.inFlightId) return state;
			const msgs = state.messages.map((m) =>
				m.id === state.inFlightId ? { ...m, blocks: [...m.blocks, action.block] } : m,
			);
			return { ...state, messages: msgs };
		}

		case "seal_assistant": {
			const msgs = state.messages.map((m) =>
				m.id === state.inFlightId ? { ...m, id: action.messageId, isStreaming: false } : m,
			);
			return { ...state, messages: msgs, inFlightId: null };
		}

		case "error_assistant": {
			const msgs = state.messages.map((m) =>
				m.id === state.inFlightId ? { ...m, isStreaming: false, errorText: action.text } : m,
			);
			return { ...state, messages: msgs, inFlightId: null, error: action.text };
		}

		case "toggle_block_collapse": {
			const msgs = state.messages.map((m) => ({
				...m,
				blocks: m.blocks.map((b) =>
					b.id === action.blockId ? { ...b, isCollapsed: !b.isCollapsed } : b,
				),
			}));
			return { ...state, messages: msgs };
		}

		case "clear_error":
			return { ...state, error: null };

		default:
			return state;
	}
}

// ---- SSE frame parser ----

function parseSSEFrame(rawFrame: string): { event: string; data: string } | null {
	const frame = rawFrame.replace(/\r/g, "").trim();
	if (!frame) return null;
	let event = "message";
	const dataLines: string[] = [];
	for (const line of frame.split("\n")) {
		if (!line || line.startsWith(":")) continue;
		if (line.startsWith("event:")) {
			event = line.slice(6).trim();
			continue;
		}
		if (line.startsWith("data:")) {
			dataLines.push(line.slice(5).trimStart());
		}
	}
	if (!dataLines.length) return null;
	return { event, data: dataLines.join("\n") };
}

// ---- hook ----

export interface UseChatSessionReturn {
	messages: ChatMessage[];
	isStreaming: boolean;
	isConnecting: boolean;
	error: string | null;
	threadId: string | undefined;
	send: (text: string) => Promise<void>;
	abort: () => void;
	retry: () => void;
	toggleBlockCollapse: (blockId: string) => void;
	clearError: () => void;
	lastUserContent: string | undefined;
}

export function useChatSession(): UseChatSessionReturn {
	const [state, dispatch] = useReducer(chatReducer, {
		messages: [],
		inFlightId: null,
		error: null,
	});

	const [isConnecting, setIsConnecting] = useStateRef(false);
	const abortRef = useRef<AbortController | null>(null);
	const threadIdRef = useRef<string | undefined>(undefined);
	const savedInputRef = useRef<string>("");

	const abort = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
	}, []);

	const send = useCallback(
		async (text: string) => {
			if (!text.trim() || state.inFlightId) return;
			savedInputRef.current = text;

			dispatch({ type: "append_user", message: buildUserMessage(text) });
			dispatch({ type: "start_assistant", message: buildAssistantPlaceholder() });
			setIsConnecting(true);

			const controller = new AbortController();
			abortRef.current = controller;

			try {
				const res = await fetch("/api/agent/chat", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ message: text, threadId: threadIdRef.current }),
					signal: controller.signal,
				});

				setIsConnecting(false);

				if (!res.ok || !res.body) {
					dispatch({ type: "error_assistant", text: `HTTP ${res.status}` });
					return;
				}

				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";

				const handle = (raw: string) => {
					const parsed = parseSSEFrame(raw);
					if (!parsed) return;
					try {
						const payload = JSON.parse(parsed.data);
						switch (parsed.event) {
							case "chunk": {
								const e = payload as SseChunkEvent;
								dispatch({ type: "append_chunk", delta: e.delta ?? "" });
								break;
							}
							case "done": {
								const e = payload as SseDoneEvent;
								threadIdRef.current = e.threadId;
								dispatch({ type: "seal_assistant", messageId: e.messageId });
								break;
							}
							case "tool": {
								const e = payload as SseToolEvent;
								dispatch({
									type: "add_tool_block",
									block: {
										id: localId("tc"),
										type: "tool_call",
										content: "",
										toolName: e.name,
										toolInput: e.input,
										isCollapsed: true,
									},
								});
								dispatch({
									type: "add_tool_block",
									block: {
										id: localId("tr"),
										type: "tool_result",
										content: "",
										toolName: e.name,
										toolResult: e.result,
										durationMs: e.durationMs,
										isCollapsed: true,
									},
								});
								break;
							}
							case "error": {
								const e = payload as SseErrorEvent;
								dispatch({ type: "error_assistant", text: e.message });
								break;
							}
						}
					} catch {
						// malformed frame — skip, per AC28
					}
				};

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					let boundary = buffer.indexOf("\n\n");
					while (boundary >= 0) {
						handle(buffer.slice(0, boundary));
						buffer = buffer.slice(boundary + 2);
						boundary = buffer.indexOf("\n\n");
					}
				}
				if (buffer.trim()) handle(buffer);
			} catch (err) {
				setIsConnecting(false);
				if (err instanceof Error && err.name === "AbortError") {
					dispatch({ type: "error_assistant", text: "Stopped." });
				} else {
					dispatch({ type: "error_assistant", text: "Connection error. Please retry." });
				}
			} finally {
				abortRef.current = null;
			}
		},
		// setIsConnecting is stable (useCallback from useStateRef) — safe to include
		[state.inFlightId, setIsConnecting],
	);

	const retry = useCallback(() => {
		dispatch({ type: "clear_error" });
	}, []);

	const toggleBlockCollapse = useCallback((blockId: string) => {
		dispatch({ type: "toggle_block_collapse", blockId });
	}, []);

	const clearError = useCallback(() => {
		dispatch({ type: "clear_error" });
	}, []);

	const lastUserContent = [...state.messages].reverse().find((m) => m.role === "user")?.content;

	return {
		messages: state.messages,
		isStreaming: state.inFlightId !== null,
		isConnecting: isConnecting.current,
		error: state.error,
		threadId: threadIdRef.current,
		send,
		abort,
		retry,
		toggleBlockCollapse,
		clearError,
		lastUserContent,
	};
}

// tiny helper — a ref-backed boolean that also forces re-render
function useStateRef(initial: boolean) {
	const ref = useRef(initial);
	const [, setTick] = useReducer((n: number) => n + 1, 0);
	const setter = useCallback((val: boolean) => {
		ref.current = val;
		setTick();
	}, []);
	return [ref, setter] as const;
}
