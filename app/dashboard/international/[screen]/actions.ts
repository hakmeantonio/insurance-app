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

  function str(key: string) { return (formData.get(key) as string) || null; }

  const payload = {
    screen,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    date_of_birth: str("date_of_birth"),
    start_date: str("start_date"),
    end_date: str("end_date"),
    policy_index: Number(formData.get("policy_index")),
    created_by: user?.id,
    salutation: str("salutation"),
    marital_status: str("marital_status"),
    nationality: str("nationality"),
    residence_country: str("residence_country"),
    policy_number: str("policy_number"),
    plan_type: str("plan_type"),
    plan_basis: str("plan_basis"),
    currency_of_plan: str("currency_of_plan"),
    premium: str("premium"),
    passport_expiry_date: str("passport_expiry_date"),
    escalated_premium: str("escalated_premium"),
    frequency: str("frequency"),
    vanishing_premium: str("vanishing_premium"),
    benefits: str("benefits"),
    escalated_benefits: str("escalated_benefits"),
    fund_selection: str("fund_selection"),
    plan_term: str("plan_term"),
    sra: str("sra"),
    mode_of_payment: str("mode_of_payment"),
    agent: str("agent"),
    special_remarks: str("special_remarks"),
    policy_status: str("policy_status"),
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

  function str(key: string) { return (formData.get(key) as string) || null; }

  const payload = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    date_of_birth: str("date_of_birth"),
    start_date: str("start_date"),
    end_date: str("end_date"),
    policy_index: Number(formData.get("policy_index")),
    salutation: str("salutation"),
    marital_status: str("marital_status"),
    nationality: str("nationality"),
    residence_country: str("residence_country"),
    policy_number: str("policy_number"),
    plan_type: str("plan_type"),
    plan_basis: str("plan_basis"),
    currency_of_plan: str("currency_of_plan"),
    premium: str("premium"),
    passport_expiry_date: str("passport_expiry_date"),
    escalated_premium: str("escalated_premium"),
    frequency: str("frequency"),
    vanishing_premium: str("vanishing_premium"),
    benefits: str("benefits"),
    escalated_benefits: str("escalated_benefits"),
    fund_selection: str("fund_selection"),
    plan_term: str("plan_term"),
    sra: str("sra"),
    mode_of_payment: str("mode_of_payment"),
    agent: str("agent"),
    special_remarks: str("special_remarks"),
    policy_status: str("policy_status"),
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
