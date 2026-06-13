"use client";

import { FileText, FileSpreadsheet, File, ExternalLink, Download } from "lucide-react";
import { DeleteDocumentButton } from "./delete-document-button";
import type { IntlScreenSlug } from "@/lib/types";

type FileType = "image" | "pdf" | "word" | "excel" | "other";

function getFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext))
    return "image";
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

interface FileItem {
  name: string;
  signedUrl: string;
  size: number;
}

interface Props {
  files: FileItem[];
  screen: IntlScreenSlug;
  policyIndex: number;
  canEdit: boolean;
}

export function DocumentGrid({ files, screen, policyIndex, canEdit }: Props) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-dashed border-gray-300">
        <File className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No documents yet</p>
        {canEdit && (
          <p className="text-gray-400 text-sm mt-1">
            Upload files using the button above.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map((file) => {
        const type = getFileType(file.name);
        return (
          <div key={file.name} className="relative group">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Preview area */}
              <div className="h-36 flex items-center justify-center bg-gray-50 overflow-hidden">
                {type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.signedUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : type === "pdf" ? (
                  <FileText className="w-12 h-12 text-red-400" />
                ) : type === "word" ? (
                  <FileText className="w-12 h-12 text-blue-500" />
                ) : type === "excel" ? (
                  <FileSpreadsheet className="w-12 h-12 text-green-600" />
                ) : (
                  <File className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* File info + action */}
              <div className="p-2">
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
                <a
                  href={file.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={type !== "image" && type !== "pdf" ? file.name : undefined}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {type === "image" || type === "pdf" ? (
                    <>
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      Download
                    </>
                  )}
                </a>
              </div>
            </div>

            {canEdit && (
              <DeleteDocumentButton
                screen={screen}
                policyIndex={policyIndex}
                filename={file.name}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
