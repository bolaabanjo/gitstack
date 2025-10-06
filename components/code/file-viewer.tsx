"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/code/copy-button";
import { CodeBlock } from "@/components/code/code-block";
import { type BlobResponse } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { codeSurface, codeBorder } from "@/components/code/code-theme";

function getFileName(path?: string) {
  if (!path) return "";
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}
function getExtension(path?: string) {
  if (!path) return "";
  const name = getFileName(path);
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}
function isMarkdown(mime: string | null, path?: string) {
  const ext = getExtension(path);
  return mime === "text/markdown" || ext === "md" || ext === "mdx";
}
function isTextual(mime: string | null, path?: string) {
  if (!mime && !path) return false;
  const ext = getExtension(path);
  if (mime) {
    if (mime.startsWith("text/")) return true;
    if (mime === "application/json") return true;
    if (mime === "application/javascript") return true;
    if (mime === "application/xml") return true;
  }
  return [
    "ts","tsx","js","jsx","json","txt","css","html","md","mdx",
    "py","go","rs","java","kt","sh","yml","yaml","c","cpp","h","hpp"
  ].includes(ext);
}
function isImage(mime: string | null, path?: string) {
  if (mime && mime.startsWith("image/")) return true;
  const ext = getExtension(path);
  return ["png","jpg","jpeg","gif","webp","svg"].includes(ext);
}
function toDisplaySize(size?: number) {
  if (typeof size !== "number") return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
function makeImageSrc(content: string | null, mime: string | null) {
  if (!content) return null;
  if (content.startsWith("data:")) return content;
  if (mime) return `data:${mime};base64,${content}`;
  return `data:application/octet-stream;base64,${content}`;
}
function languageFromExt(ext: string) {
  return ext || "text";
}

export function FileViewer({ blob }: { blob?: BlobResponse }) {
  const fileName = useMemo(() => getFileName(blob?.path), [blob?.path]);
  const ext = useMemo(() => getExtension(blob?.path), [blob?.path]);

  if (!blob) return null;

  const { path, hash, size, mime, content, message } = blob;

  const Header = (
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base md:text-lg truncate">{fileName || path}</CardTitle>
          <div className="mt-1 text-xs text-muted-foreground space-x-3">
            <span>Size: {toDisplaySize(size)}</span>
            {ext ? <span>Type: .{ext}</span> : null}
            {mime ? <span>Mime: {mime}</span> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {path ? <CopyButton text={path} /> : null}
          {hash ? <CopyButton text={hash} /> : null}
        </div>
      </div>
    </CardHeader>
  );

  if (content == null) {
    return (
      <Card>
        {Header}
        <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
          <div>File content preview is not available.</div>
          {message ? <div className="text-xs">{message}</div> : null}
          <div
            className="rounded-md p-3 font-mono text-xs w-full overflow-x-auto"
            style={{ backgroundColor: codeSurface, border: `1px solid ${codeBorder}` }}
          >
            <div>Path: {path}</div>
            <div>Hash: {hash}</div>
            <div>Size: {typeof size === "number" ? `${size} B` : "-"}</div>
            <div>Mime: {mime ?? "-"}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isImage(mime, path)) {
    const src = makeImageSrc(content, mime);
    return (
      <Card>
        {Header}
        <CardContent className="p-4">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={fileName} className="w-full h-auto rounded-md border" />
          ) : (
            <div className="text-sm text-muted-foreground">Unable to render image.</div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isMarkdown(mime, path)) {
    return (
      <Card>
        {Header}
        <CardContent className="p-6 prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </CardContent>
      </Card>
    );
  }

  if (isTextual(mime, path)) {
    const language = languageFromExt(ext);
    return (
      <Card>
        {Header}
        <CardContent className="p-0">
          <CodeBlock
            code={content}
            language={language}
            showLineNumbers
            wrap={false}
            label={fileName || path}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {Header}
      <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
        <div>Preview for this file type is not supported yet.</div>
        <div
          className="rounded-md p-3 font-mono text-xs w-full overflow-x-auto"
          style={{ backgroundColor: codeSurface, border: `1px solid ${codeBorder}` }}
        >
          <div>Path: {path}</div>
          <div>Hash: {hash}</div>
          <div>Size: {typeof size === "number" ? `${size} B` : "-"}</div>
          <div>Mime: {mime ?? "-"}</div>
        </div>
      </CardContent>
    </Card>
  );
}