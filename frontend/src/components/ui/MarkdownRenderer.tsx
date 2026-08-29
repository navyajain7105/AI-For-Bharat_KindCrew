"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`prose-dark text-xs sm:text-sm text-zinc-300 leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-zinc-300">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-zinc-100">{children}</strong>,
          em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1 text-zinc-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1 text-zinc-300">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-bold text-zinc-100 mt-3 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold text-zinc-100 mt-2.5 mb-1.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-zinc-200 mt-2 mb-1">{children}</h3>,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-amber-300 text-xs font-mono">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-500/70 pl-3 my-2 italic text-zinc-400 bg-zinc-900/30 py-1 rounded-r">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
