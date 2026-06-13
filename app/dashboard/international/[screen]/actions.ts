"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import type { IntlScreenSlug } from "@/lib/types";

function revalidate(screen: IntlScreenSlug) {
  revalidatePath(`/dashboard/international/${screen}`);
}

export async function createIntlPolicy(screen: IntlScreenSlug, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    screen,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    date_of_birth: (formData.get("date_of_birth") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    policy_index: Number(formData.get("policy_index")),
    created_by: user?.id,
  };

  const { data, error } = await supabase.from("international_policies").insert(payload).select("id").single();

  if (error) {
    if (error.code === "23505") return { error: "That index number is already in use." };
    return { error: error.message };
  }

  await logAudit({
    action: "create",
    entityType: "international_policy",
    entityId: data?.id,
    screen,
    details: { first_name: payload.first_name, last_name: payload.last_name, policy_index: payload.policy_index },
  });

  revalidate(screen);
  return { error: null };
}

export async function updateIntlPolicy(
  policyId: string,
  screen: IntlScreenSlug,
  formData: FormData
) {
  const supabase = await createClient();

  const payload = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    date_of_birth: (formData.get("date_of_birth") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    policy_index: Number(formData.get("policy_index")),
  };

  const { error } = await supabase.from("international_policies").update(payload).eq("id", policyId);

  if (error) {
    if (error.code === "23505") return { error: "That index number is already in use." };
    return { error: error.message };
  }

  await logAudit({
    action: "update",
    entityType: "international_policy",
    entityId: policyId,
    screen,
    details: { first_name: payload.first_name, last_name: payload.last_name, policy_index: payload.policy_index },
  });

  revalidate(screen);
  return { error: null };
}

export async function deleteIntlPolicy(policyId: string, screen: IntlScreenSlug) {
  const supabase = await createClient();

  const { data: policy } = await supabase
    .from("international_policies")
    .select("first_name, last_name, policy_index")
    .eq("id", policyId)
    .single();

  const { error } = await supabase.from("international_policies").delete().eq("id", policyId);

  if (error) return { error: error.message };

  await logAudit({
    action: "delete",
    entityType: "international_policy",
    entityId: policyId,
    screen,
    details: { first_name: policy?.first_name, last_name: policy?.last_name, policy_index: policy?.policy_index },
  });

  revalidate(screen);
  return { error: null };
}
