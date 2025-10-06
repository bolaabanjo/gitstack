"use client";

import React, { useMemo } from "react";
import * as PrismRenderer from "prism-react-renderer";
import { codeTheme, codeSurface, codeSurfaceSoft, codeBorder } from "@/components/code/code-theme";
import { CopyButton } from "@/components/code/copy-button";
import { cn } from "@/lib/utils";

// ✅ Extend language support
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";

type HighlightChildArgs = {
  className: string;
  style: React.CSSProperties;
  tokens: Array<Array<{ types: string[]; content: string }>>;
  getLineProps: (opts: { line: any; key?: React.Key }) => any;
  getTokenProps: (opts: { token: any; key?: React.Key }) => any;
};

const Highlight: React.ComponentType<any> =
  ((PrismRenderer as any).default ?? PrismRenderer) as any;

function clampLanguage(lang?: string) {
  if (!lang) return "text";
  const m: Record<string, string> = {
    yml: "yaml",
    sh: "bash",
    shell: "bash",
    tsx: "tsx",
    ts: "ts",
    js: "js",
    jsx: "jsx",
    md: "markdown",
    mdx: "markdown",
  };
  return m[lang] ?? lang;
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
      className={cn(
        "rounded-md border overflow-hidden shadow-sm",
        "relative",
        className
      )}
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
        <Highlight code={code} language={lang} theme={codeTheme}>
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
                      {showLineNumbers ? (
                        <span
                          className="select-none pr-3 pl-3 text-right tabular-nums text-[11px] leading-6"
                          style={{ color: "oklch(0.65 0 0)", backgroundColor: codeSurface }}
                        >
                          {lineNumber}
                        </span>
                      ) : null}
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
