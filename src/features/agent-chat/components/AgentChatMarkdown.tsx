"use client";

// Markdown renderer for agent chat messages — Phase 22a
// AC34: react-markdown + remark-gfm
// AC35: syntax highlighting via react-syntax-highlighter
// AC36: code-block copy button (1.5s feedback)
// AC37: table rendering (GFM)
// AC38: <think> tag collapsible box

import { Check, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// ---- Think-block collapsible ----

function ThinkBlock({ content }: { content: string }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="my-2 rounded border border-border/60 bg-muted/40 text-xs">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-muted-foreground hover:text-foreground transition-colors"
			>
				{open ? (
					<ChevronDown className="h-3 w-3 shrink-0" />
				) : (
					<ChevronRight className="h-3 w-3 shrink-0" />
				)}
				<span className="font-medium">Thinking…</span>
			</button>
			{open && (
				<div className="border-t border-border/40 px-3 py-2 text-muted-foreground whitespace-pre-wrap leading-relaxed">
					{content}
				</div>
			)}
		</div>
	);
}

// ---- Code-block with copy ----

function CodeBlock({ language, value }: { language: string; value: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		void navigator.clipboard.writeText(value).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	}, [value]);

	return (
		<div className="relative my-2 rounded-md overflow-hidden border border-border/50">
			<div className="flex items-center justify-between px-3 py-1 bg-muted/60 border-b border-border/40">
				<span className="text-[10px] font-mono text-muted-foreground">{language || "text"}</span>
				<button
					type="button"
					onClick={handleCopy}
					className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
				>
					{copied ? (
						<>
							<Check className="h-3 w-3 text-emerald-500" />
							<span className="text-emerald-500">Copied!</span>
						</>
					) : (
						<>
							<Copy className="h-3 w-3" />
							<span>Copy</span>
						</>
					)}
				</button>
			</div>
			<SyntaxHighlighter
				style={oneDark}
				language={language || "text"}
				PreTag="div"
				customStyle={{
					margin: 0,
					borderRadius: 0,
					fontSize: "0.75rem",
					lineHeight: "1.5",
					background: "transparent",
				}}
			>
				{value}
			</SyntaxHighlighter>
		</div>
	);
}

// ---- Shared ReactMarkdown components config ----

const markdownComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
	code({ className, children, ...props }) {
		const match = /language-(\w+)/.exec(className ?? "");
		const value = String(children).replace(/\n$/, "");
		if (!match && !value.includes("\n")) {
			return (
				<code
					className="rounded bg-muted px-1 py-0.5 font-mono text-[0.8em] text-foreground"
					{...props}
				>
					{children}
				</code>
			);
		}
		return <CodeBlock language={match?.[1] ?? ""} value={value} />;
	},
	pre({ children }) {
		return <>{children}</>;
	},
	table({ children }) {
		return (
			<div className="overflow-x-auto my-2">
				<table className="w-full text-xs border-collapse border border-border/40">{children}</table>
			</div>
		);
	},
	th({ children }) {
		return (
			<th className="border border-border/40 bg-muted/60 px-2 py-1 text-left font-semibold text-muted-foreground">
				{children}
			</th>
		);
	},
	td({ children }) {
		return <td className="border border-border/40 px-2 py-1 text-foreground/80">{children}</td>;
	},
	a({ children, href }) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className="text-primary underline underline-offset-2 hover:opacity-80"
			>
				{children}
			</a>
		);
	},
	blockquote({ children }) {
		return (
			<blockquote className="border-l-2 border-primary/50 pl-3 text-muted-foreground italic my-2">
				{children}
			</blockquote>
		);
	},
};

// ---- Pre-processor: extract <think> blocks from raw markdown ----

interface Segment {
	type: "markdown" | "think";
	content: string;
	key: string;
}

function splitThinkBlocks(raw: string): Segment[] {
	const segments: Segment[] = [];
	const re = /<think>([\s\S]*?)<\/think>/g;
	let last = 0;
	let pos = 0;

	for (let m = re.exec(raw); m !== null; m = re.exec(raw)) {
		if (m.index > last) {
			segments.push({ type: "markdown", content: raw.slice(last, m.index), key: `md-${pos}` });
			pos++;
		}
		segments.push({ type: "think", content: m[1].trim(), key: `think-${pos}` });
		pos++;
		last = m.index + m[0].length;
	}
	if (last < raw.length) {
		segments.push({ type: "markdown", content: raw.slice(last), key: `md-${pos}` });
	}
	return segments;
}

// ---- Main component ----

interface AgentChatMarkdownProps {
	content: string;
}

import { memo } from "react";

function AgentChatMarkdownInner({ content }: AgentChatMarkdownProps) {
	const segments = splitThinkBlocks(content);

	return (
		<div className="prose prose-sm prose-invert max-w-none leading-relaxed text-sm text-foreground">
			{segments.map((seg) => {
				if (seg.type === "think") {
					return <ThinkBlock key={seg.key} content={seg.content} />;
				}
				return (
					<ReactMarkdown key={seg.key} remarkPlugins={[remarkGfm]} components={markdownComponents}>
						{seg.content}
					</ReactMarkdown>
				);
			})}
		</div>
	);
}

// AC67: memo — only re-render when content string changes
export const AgentChatMarkdown = memo(AgentChatMarkdownInner);
