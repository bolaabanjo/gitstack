// components/file-explorer.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  File,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Upload,
  FileText,
  FileCode,
  Image as ImageIcon,
  FileJson,
  MoreHorizontal,
  Clock,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// File/Folder type definitions
interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modified?: Date;
  children?: FileNode[];
  extension?: string;
}

// Get icon based on file type
function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
      return FileCode;
    case "json":
      return FileJson;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return ImageIcon;
    case "md":
      return FileText;
    default:
      return File;
  }
}

// Format file size
function formatFileSize(bytes?: number): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Tree node component
function TreeNode({
  node,
  level = 0,
  onSelect,
  selectedId,
}: {
  node: FileNode;
  level?: number;
  onSelect: (node: FileNode) => void;
  selectedId?: string;
}) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const isFolder = node.type === "folder";
  const isSelected = selectedId === node.id;

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) setIsOpen(!isOpen);
          onSelect(node);
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
          isSelected && "bg-accent font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 flex-shrink-0 text-primary" />
            ) : (
              <Folder className="h-4 w-4 flex-shrink-0 text-primary" />
            )}
          </>
        ) : (
          <>
            <div className="w-4" /> {/* Spacer for alignment */}
            {(() => {
              const Icon = getFileIcon(node.name);
              return <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />;
            })()}
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// File table row component
function FileRow({ file }: { file: FileNode }) {
  const Icon = file.type === "folder" ? Folder : getFileIcon(file.name);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group grid grid-cols-[1fr_120px_120px_60px] items-center gap-4 rounded-lg border px-4 py-3 transition-all hover:bg-accent/50 hover:shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <span className="truncate font-medium">{file.name}</span>
        {file.extension && (
          <Badge variant="outline" className="text-xs">
            {file.extension}
          </Badge>
        )}
      </div>
      <div className="text-sm text-muted-foreground">
        {formatFileSize(file.size)}
      </div>
      <div className="text-sm text-muted-foreground">
        {file.modified ? formatDistanceToNow(file.modified, { addSuffix: true }) : "-"}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View</DropdownMenuItem>
          <DropdownMenuItem>Download</DropdownMenuItem>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

// Empty state component
function EmptyFileExplorer() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <FileText className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No files yet</h3>
      <p className="text-sm text-muted-foreground mb-8 max-w-md">
        Get started by initializing your project from the CLI or uploading your first files.\
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Initialize from CLI
        </Button>
      </div>
      <div className="mt-8 rounded-lg bg-muted/50 p-4 max-w-md">
        <p className="text-xs font-mono text-muted-foreground">
          $ gitstack init
        </p>
      </div>
    </div>
  );
}

// Main File Explorer Component
export function FileExplorer({ projectId: _projectId }: { projectId: string }) { // Renamed to _projectId to ignore, or remove if not needed
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);

  // Mock data - replace with real API call
  const mockFiles: FileNode[] = [
    {
      id: "1",
      name: "src",
      type: "folder",
      children: [
        {
          id: "2",
          name: "components",
          type: "folder",
          children: [
            {
              id: "3",
              name: "Button.tsx",
              type: "file",
              size: 2048,
              modified: new Date(Date.now() - 3600000 * 2),
              extension: "tsx",
            },
          ],
        },
        {
          id: "4",
          name: "App.tsx",
          type: "file",
          size: 4096,
          modified: new Date(Date.now() - 3600000 * 5),
          extension: "tsx",
        },
      ],
    },
    {
      id: "5",
      name: "package.json",
      type: "file",
      size: 1234,
      modified: new Date(Date.now() - 86400000),
      extension: "json",
    },
    {
      id: "6",
      name: "README.md",
      type: "file",
      size: 5678,
      modified: new Date(Date.now() - 86400000 * 3),
      extension: "md",
    },
  ];

  const hasFiles = mockFiles.length > 0;

  // Flatten file tree for table view
  const flattenFiles = (nodes: FileNode[], parentPath = ""): FileNode[] => {
    let result: FileNode[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.type === "folder" && node.children) {
        result = [...result, ...flattenFiles(node.children, `${parentPath}${node.name}/`)];
      }
    }
    return result;
  };

  const flatFiles = flattenFiles(mockFiles);
  const filteredFiles = searchQuery
    ? flatFiles.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : flatFiles;

  if (!hasFiles) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyFileExplorer />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">\
          <div>
            <CardTitle>Files</CardTitle>
            <CardDescription>Browse and manage your project files</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <File className="h-4 w-4 mr-2" />
                  New File
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Folder className="h-4 w-4 mr-2" />
                  New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Search bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[250px_1fr] gap-6">
          {/* Left: Tree View */}
          <div className="space-y-1 border-r pr-4">
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Folder className="h-3.5 w-3.5" />
              File Tree
            </div>
            {mockFiles.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                onSelect={setSelectedNode}
                selectedId={selectedNode?.id}
              />
            ))}
          </div>

          {/* Right: File Table */}
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_120px_60px] gap-4 px-4 text-xs font-medium text-muted-foreground">
              <div>Name</div>
              <div>Size</div>
              <div>Modified</div>
              <div></div>
            </div>
            {/* File Rows */}
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <FileRow key={file.id} file={file} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}