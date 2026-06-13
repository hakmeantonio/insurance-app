import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { INTL_SCREENS, type IntlScreenSlug, type IntlPolicy } from "@/lib/types";
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

  const [{ data: policy }, { data: profile }] = await Promise.all([
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
  ]);

  if (!policy) notFound();

  const canEdit = profile?.role === "admin" || profile?.role === "employee";
  const screenName = INTL_SCREENS[slug];
  const intlPolicy = policy as IntlPolicy;
  const storagePath = `${slug}/${policyIndex}`;

  // List files and generate signed URLs
  const { data: files } = await supabase.storage
    .from("policy-documents")
    .list(storagePath, { sortBy: { column: "name", order: "asc" } });

  const realFiles = (files ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");

  let fileList: { name: string; signedUrl: string; size: number }[] = [];
  if (realFiles.length > 0) {
    const paths = realFiles.map((f) => `${storagePath}/${f.name}`);
    const { data: signed } = await supabase.storage
      .from("policy-documents")
      .createSignedUrls(paths, 3600);

    fileList = (signed ?? [])
      .filter((s) => s.signedUrl != null)
      .map((s, i) => ({
        name: realFiles[i].name,
        signedUrl: s.signedUrl as string,
        size: realFiles[i].metadata?.size ?? 0,
      }));
  }

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
              {fileList.length} file{fileList.length !== 1 ? "s" : ""}
            </p>
          </div>
          {canEdit && (
            <UploadFiles screen={slug} policyIndex={policyIndex} />
          )}
        </div>
      </div>

      <DocumentGrid
        files={fileList}
        screen={slug}
        policyIndex={policyIndex}
        canEdit={canEdit}
      />
    </div>
  );
}
