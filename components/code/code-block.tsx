"use client";

import React, { useMemo } from "react";
import { Highlight, PrismTheme, Language } from "prism-react-renderer";
import { codeTheme, codeSurface, codeSurfaceSoft, codeBorder } from "@/components/code/code-theme";
import { CopyButton } from "@/components/code/copy-button";
import { cn } from "@/lib/utils";

type Token = { types: string[]; content: string };
type HighlightChildArgs = {
  className: string;
  style: React.CSSProperties;
  tokens: Token[][];
  getLineProps: (opts: { line: Token[]; key?: React.Key }) => React.HTMLAttributes<HTMLElement>;
  getTokenProps: (opts: { token: Token; key?: React.Key }) => React.HTMLAttributes<HTMLElement>;
};

function clampLanguage(lang?: string): Language {
  if (!lang) return "text" as Language;
  const aliases: Record<string, Language> = {
    yml: "yaml",
    sh: "bash",
    shell: "bash",
    tsx: "tsx",
    ts: "ts",
    js: "js",
    jsx: "jsx",
    md: "markdown",
    mdx: "markdown",
    py: "python",
    go: "go",
    rs: "rust",
  };
  return aliases[lang] ?? (lang as Language);
}

export function CodeBlock({
  code,
  language,
  showLineNumbers = true,
  wrap = false,
  className,
  label,
}: {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  wrap?: boolean;
  className?: string;
  label?: string;
}) {
  const lang = useMemo(() => clampLanguage(language), [language]);

  return (
    <div
      className={cn("rounded-md border overflow-hidden shadow-sm relative", className)}
      style={{ backgroundColor: codeSurface, borderColor: codeBorder }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 text-xs"
        style={{ backgroundColor: codeSurfaceSoft, borderBottom: `1px solid ${codeBorder}` }}
      >
        <div className="text-muted-foreground truncate">
          {label ? label : lang ? lang.toUpperCase() : "CODE"}
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={code} size="sm" />
        </div>
      </div>

      <div className={cn("overflow-auto", wrap ? "whitespace-pre-wrap" : "whitespace-pre")}>
        <Highlight code={code} language={lang} theme={codeTheme as PrismTheme}>
          {({ className: cls, style, tokens, getLineProps, getTokenProps }: HighlightChildArgs) => (
            <pre
              className={cn(cls, "m-0 p-0")}
              style={{
                ...style,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: "0.875rem",
                lineHeight: "1.65",
              }}
            >
              <code className="grid grid-cols-[auto_1fr]">
                {tokens.map((line, i) => {
                  const lineNumber = i + 1;
                  return (
                    <div key={i} className="contents">
                      {showLineNumbers && (
                        <span
                          className="select-none pr-3 pl-3 text-right tabular-nums text-[11px] leading-6"
                          style={{ color: "oklch(0.65 0 0)", backgroundColor: codeSurface }}
                        >
                          {lineNumber}
                        </span>
                      )}
                      <span
                        className={cn(
                          "pr-4 pl-2 leading-6 overflow-hidden",
                          wrap ? "break-words" : "break-normal"
                        )}
                        {...getLineProps({ line, key: i })}
                      >
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token, key })} />
                        ))}
                      </span>
                    </div>
                  );
                })}
              </code>
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
