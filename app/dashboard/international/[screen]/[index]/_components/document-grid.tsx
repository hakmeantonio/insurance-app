"use client";

import { useState } from "react";
import { FileText, FileSpreadsheet, File, X, Download, ExternalLink, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteDocumentButton } from "./delete-document-button";
import { DOCUMENT_CATEGORIES, type DocumentCategory, type IntlScreenSlug } from "@/lib/types";

type FileType = "image" | "pdf" | "word" | "excel" | "other";

function getFileType(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "tif", "tiff"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["xls", "xlsx"].includes(ext)) return "excel";
  return "other";
}

function formatBytes(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface CategoryFiles {
  category: DocumentCategory;
  files: { name: string; signedUrl: string; size: number }[];
}

interface PreviewFile {
  name: string;
  signedUrl: string;
  size: number;
  category: DocumentCategory;
}

interface Props {
  categoryFiles: CategoryFiles[];
  screen: IntlScreenSlug;
  policyIndex: number;
  canEdit: boolean;
}

function DocIcon({ type, className }: { type: FileType; className?: string }) {
  const cls = cn("mx-auto", className);
  if (type === "pdf") return <FileText className={cn(cls, "text-red-400")} />;
  if (type === "word") return <FileText className={cn(cls, "text-blue-500")} />;
  if (type === "excel") return <FileSpreadsheet className={cn(cls, "text-green-600")} />;
  return <File className={cn(cls, "text-gray-400")} />;
}

export function DocumentGrid({ categoryFiles, screen, policyIndex, canEdit }: Props) {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "ALL">("ALL");
  const [preview, setPreview] = useState<PreviewFile | null>(null);

  const allFiles: PreviewFile[] = categoryFiles.flatMap((cf) =>
    cf.files.map((f) => ({ ...f, category: cf.category }))
  );

  const displayedFiles: PreviewFile[] =
    activeCategory === "ALL"
      ? allFiles
      : (categoryFiles.find((cf) => cf.category === activeCategory)?.files ?? []).map((f) => ({
          ...f,
          category: activeCategory as DocumentCategory,
        }));

  return (
    <div
      className="flex rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      style={{ minHeight: 520 }}
    >
      {/* ── Left sidebar ── */}
      <div className="w-52 flex-shrink-0 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Categories
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {/* ALL entry */}
          <button
            onClick={() => { setActiveCategory("ALL"); setPreview(null); }}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
              activeCategory === "ALL"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <span>ALL</span>
            <span
              className={cn(
                "text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                activeCategory === "ALL"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {allFiles.length}
            </span>
          </button>

          {DOCUMENT_CATEGORIES.filter((cat) => cat !== "ALL").map((cat) => {
            const count = categoryFiles.find((cf) => cf.category === cat)?.files.length ?? 0;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPreview(null); }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                  activeCategory === cat
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <span className="truncate text-left">{cat}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ml-1 min-w-[20px] text-center",
                      activeCategory === cat
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Center grid ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {displayedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-24 text-center">
            <FolderOpen className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">No documents here</p>
            {canEdit && (
              <p className="text-xs text-gray-300 mt-1">
                Select a category above, then upload files.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {displayedFiles.map((file) => {
              const type = getFileType(file.name);
              const isSelected =
                preview?.name === file.name && preview?.category === file.category;
              return (
                <div key={`${file.category}/${file.name}`} className="relative group">
                  <button
                    onClick={() => setPreview(isSelected ? null : file)}
                    className={cn(
                      "w-full text-left rounded-lg border overflow-hidden transition-all hover:shadow-md",
                      isSelected
                        ? "border-blue-400 ring-2 ring-blue-200 shadow-md"
                        : "border-gray-200 shadow-sm"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="h-40 flex items-center justify-center bg-gray-50 overflow-hidden">
                      {type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={file.signedUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DocIcon type={type} className="w-10 h-10" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-2.5 py-2 bg-white">
                      <p
                        className="text-xs font-medium text-gray-800 truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      {file.size > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatBytes(file.size)}
                        </p>
                      )}
                    </div>
                  </button>

                  {canEdit && (
                    <DeleteDocumentButton
                      screen={screen}
                      policyIndex={policyIndex}
                      category={file.category}
                      filename={file.name}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right preview panel ── */}
      {preview && (
        <div className="w-72 flex-shrink-0 border-l border-gray-100 flex flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Preview
            </p>
            <button
              onClick={() => setPreview(null)}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preview area */}
          <div className="border-b border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden" style={{ minHeight: 220 }}>
            {(() => {
              const type = getFileType(preview.name);
              if (type === "image") {
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview.signedUrl}
                    alt={preview.name}
                    className="max-w-full max-h-64 object-contain"
                  />
                );
              }
              return (
                <div className="flex flex-col items-center py-8">
                  <DocIcon type={type} className="w-16 h-16" />
                  <p className="text-xs text-gray-400 mt-2">
                    {type === "pdf" ? "PDF Document"
                      : type === "word" ? "Word Document"
                      : type === "excel" ? "Excel Spreadsheet"
                      : "File"}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* File details + actions */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 break-all leading-snug">
                {preview.name}
              </p>
              {preview.size > 0 && (
                <p className="text-xs text-gray-400 mt-1">{formatBytes(preview.size)}</p>
              )}
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                {preview.category}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {(getFileType(preview.name) === "image" ||
                getFileType(preview.name) === "pdf") && (
                <a
                  href={preview.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open
                </a>
              )}
              <a
                href={preview.signedUrl}
                download={preview.name}
                className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
