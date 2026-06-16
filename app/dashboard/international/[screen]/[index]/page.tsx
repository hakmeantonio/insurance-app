import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  INTL_SCREENS,
  DOCUMENT_CATEGORIES,
  type IntlScreenSlug,
  type IntlPolicy,
} from "@/lib/types";
import { DocumentGrid } from "./_components/document-grid";
import { UploadFiles } from "./_components/upload-files";

export default async function PolicyDocumentsPage({
  params,
}: {
  params: Promise<{ screen: string; index: string }>;
}) {
  const { screen, index } = await params;
  if (!(screen in INTL_SCREENS)) notFound();

  const slug = screen as IntlScreenSlug;
  const policyIndex = Number(index);
  if (!Number.isInteger(policyIndex) || policyIndex <= 0) notFound();

  const supabase = await createClient();

  const [{ data: policy }, { data: profile }, { data: permRow }] = await Promise.all([
    supabase
      .from("international_policies")
      .select("*")
      .eq("screen", slug)
      .eq("policy_index", policyIndex)
      .single(),
    supabase
      .from("profiles")
      .select("role")
      .eq("id", (await supabase.auth.getUser()).data.user!.id)
      .single(),
    supabase
      .from("intl_permissions")
      .select("can_read, can_create, can_update, can_delete")
      .eq("user_id", (await supabase.auth.getUser()).data.user!.id)
      .eq("screen", slug)
      .maybeSingle(),
  ]);

  if (!policy) notFound();

  const isAdmin = profile?.role === "admin";
  const perm = isAdmin
    ? { can_read: true, can_create: true, can_update: true, can_delete: true }
    : permRow ?? { can_read: false, can_create: false, can_update: false, can_delete: false };

  if (!perm.can_read) notFound();

  const canEdit = perm.can_create || perm.can_update || perm.can_delete;
  const screenName = INTL_SCREENS[slug];
  const intlPolicy = policy as IntlPolicy;

  // List files for each category subfolder
  const categoryListResults = await Promise.all(
    DOCUMENT_CATEGORIES.map(async (cat) => {
      const { data } = await supabase.storage
        .from("policy-documents")
        .list(`${slug}/${policyIndex}/${cat}`, { sortBy: { column: "name", order: "asc" } });
      const files = (data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");
      return { category: cat, files };
    })
  );

  // Batch-generate signed URLs for all files across all categories
  const allFileMeta = categoryListResults.flatMap(({ category, files }) =>
    files.map((f) => ({
      category,
      name: f.name,
      size: f.metadata?.size ?? 0,
      path: `${slug}/${policyIndex}/${category}/${f.name}`,
    }))
  );

  let signedUrls: (string | null)[] = allFileMeta.map(() => null);
  if (allFileMeta.length > 0) {
    const { data: signed } = await supabase.storage
      .from("policy-documents")
      .createSignedUrls(allFileMeta.map((f) => f.path), 3600);
    signedUrls = (signed ?? []).map((s) => s.signedUrl ?? null);
  }

  // Rebuild per-category file lists with signed URLs
  let urlIdx = 0;
  const categoryFiles = categoryListResults.map(({ category, files }) => ({
    category,
    files: files.map((f) => ({
      name: f.name,
      signedUrl: signedUrls[urlIdx++] ?? "",
      size: allFileMeta[urlIdx - 1]?.size ?? 0,
    })),
  }));

  const totalFiles = allFileMeta.length;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/international/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {screenName}
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {screenName} &middot; Index {policyIndex}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900">
              {intlPolicy.first_name} {intlPolicy.last_name}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalFiles} file{totalFiles !== 1 ? "s" : ""}
            </p>
          </div>
          {canEdit && <UploadFiles screen={slug} policyIndex={policyIndex} />}
        </div>
      </div>

      <DocumentGrid
        categoryFiles={categoryFiles}
        screen={slug}
        policyIndex={policyIndex}
        canEdit={canEdit}
      />
    </div>
  );
}
