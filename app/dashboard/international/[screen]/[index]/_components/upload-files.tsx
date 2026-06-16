"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_CATEGORIES, type DocumentCategory, type IntlScreenSlug } from "@/lib/types";

export function UploadFiles({
  screen,
  policyIndex,
}: {
  screen: IntlScreenSlug;
  policyIndex: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<DocumentCategory>("MISCELLANEOUS");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const errors: string[] = [];

    await Promise.all(
      files.map(async (file) => {
        const path = `${screen}/${policyIndex}/${category}/${file.name}`;
        const { error } = await supabase.storage
          .from("policy-documents")
          .upload(path, file, { upsert: true });
        if (error) errors.push(`${file.name}: ${error.message}`);
      })
    );

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (errors.length > 0) {
      setError(errors.join(", "));
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory)}
          className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={uploading}
        >
          {DOCUMENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Upload Files"}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
