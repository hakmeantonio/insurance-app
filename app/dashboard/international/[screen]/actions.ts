"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { IntlScreenSlug } from "@/lib/types";

function revalidate(screen: IntlScreenSlug) {
  revalidatePath(`/dashboard/international/${screen}`);
}

export async function createIntlPolicy(screen: IntlScreenSlug, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("international_policies").insert({
    screen,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    date_of_birth: (formData.get("date_of_birth") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    policy_index: Number(formData.get("policy_index")),
    created_by: user?.id,
  });

  if (error) {
    if (error.code === "23505") return { error: "That index number is already in use." };
    return { error: error.message };
  }
  revalidate(screen);
  return { error: null };
}

export async function updateIntlPolicy(
  policyId: string,
  screen: IntlScreenSlug,
  formData: FormData
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("international_policies")
    .update({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      date_of_birth: (formData.get("date_of_birth") as string) || null,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
      policy_index: Number(formData.get("policy_index")),
    })
    .eq("id", policyId);

  if (error) {
    if (error.code === "23505") return { error: "That index number is already in use." };
    return { error: error.message };
  }
  revalidate(screen);
  return { error: null };
}

export async function deleteIntlPolicy(policyId: string, screen: IntlScreenSlug) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("international_policies")
    .delete()
    .eq("id", policyId);

  if (error) return { error: error.message };
  revalidate(screen);
  return { error: null };
}
