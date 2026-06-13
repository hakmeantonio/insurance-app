"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { IntlScreenSlug } from "@/lib/types";

export async function deleteDocument(
  screen: IntlScreenSlug,
  policyIndex: number,
  filename: string
) {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from("policy-documents")
    .remove([`${screen}/${policyIndex}/${filename}`]);

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/international/${screen}/${policyIndex}`);
  return { error: null };
}
