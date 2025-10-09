"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/code/copy-button";
import { CodeBlock } from "@/components/code/code-block";
import { type BlobResponse } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { codeSurface, codeBorder } from "@/components/code/code-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";

// ---------- Utility Helpers ----------
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
    if (["application/json", "application/javascript", "application/xml"].includes(mime))
      return true;
  }
  return [
    "ts", "tsx", "js", "jsx", "json", "txt", "css", "html", "md", "mdx",
    "py", "go", "rs", "java", "kt", "sh", "yml", "yaml", "c", "cpp", "h", "hpp"
  ].includes(ext);
}

function isImage(mime: string | null, path?: string) {
  if (mime && mime.startsWith("image/")) return true;
  const ext = getExtension(path);
  return ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);
}

function toDisplaySize(size?: number) {
  if (typeof size !== "number") return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function makeImageSrc(base64Content: string | null, mimeType: string | null) {
  if (!base64Content || !mimeType) return null;
  return `data:${mimeType};base64,${base64Content}`;
}

function languageFromExt(ext: string) {
  return ext || "text";
}

// ---------- Component ----------
interface FileViewerProps {
  blob?: BlobResponse;
  onDeleteFile: (filePath: string) => void;
}

export function FileViewer({ blob, onDeleteFile }: FileViewerProps) {
  // Compute these *before* any return to keep hooks consistent
  const fileName = useMemo(() => getFileName(blob?.path), [blob?.path]);
  const ext = useMemo(() => getExtension(blob?.path), [blob?.path]);

  const decodedContent = useMemo(() => {
    const path = blob?.path;
    const mime = blob?.mime;
    const content = blob?.content;

    if (content && isTextual(mime, path) && !isImage(mime, path)) {
      try {
        return Buffer.from(content, "base64").toString("utf-8");
      } catch (e) {
        console.error("Failed to decode base64 content:", e);
        return content;
      }
    }
    return content;
  }, [blob?.content, blob?.mime, blob?.path]);

  // If no blob is provided, render nothing
  if (!blob) return null;

  const { path, hash, size, mime, message } = blob;

  // ---------- Header ----------
  const Header = (
    <CardHeader className="pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base md:text-lg truncate">
            {fileName || path}
          </CardTitle>
          <div className="mt-1 text-xs text-muted-foreground space-x-3">
            <span>Size: {toDisplaySize(size)}</span>
            {ext && <span>Type: .{ext}</span>}
            {mime && <span>Mime: {mime}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {path && <CopyButton text={path} />}
          {hash && <CopyButton text={hash} />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteFile(path)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardHeader>
  );

  // ---------- Rendering states ----------

  // 1. Missing or empty content
  if (content == null || (content === "" && message)) {
    return (
      <Card>
        {Header}
        <CardContent className="p-6 text-sm text-muted-foreground space-y-3">
          <div>File content preview is not available.</div>
          {message && <div className="text-xs">{message}</div>}
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

  // 2. Image files
  if (isImage(mime, path)) {
    const src = makeImageSrc(content, mime);
    return (
      <Card>
        {Header}
        <CardContent className="p-4">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={fileName}
              className="w-full h-auto rounded-md border"
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              Unable to render image.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // 3. Markdown files
  if (isMarkdown(mime, path)) {
    return (
      <Card>
        {Header}
        <CardContent className="p-6 prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {decodedContent ?? ""}
          </ReactMarkdown>
        </CardContent>
      </Card>
    );
  }

  // 4. Text/code files
  if (isTextual(mime, path)) {
    const language = languageFromExt(ext);
    return (
      <Card>
        {Header}
        <CardContent className="p-0">
          <CodeBlock
            code={decodedContent ?? ""}
            language={language}
            showLineNumbers
            wrap={false}
            label={fileName || path}
          />
        </CardContent>
      </Card>
    );
  }

  // 5. Unsupported file type
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
