"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DocumentCategory, IntlScreenSlug } from "@/lib/types";

export async function deleteDocument(
  screen: IntlScreenSlug,
  policyIndex: number,
  category: DocumentCategory,
  filename: string
) {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from("policy-documents")
    .remove([`${screen}/${policyIndex}/${category}/${filename}`]);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/international/${screen}/${policyIndex}`);
  return { error: null };
}
