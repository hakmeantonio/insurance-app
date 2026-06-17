"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import { DOCUMENT_CATEGORIES, type IntlScreenSlug } from "@/lib/types";

function revalidate(screen: IntlScreenSlug) {
  revalidatePath(`/dashboard/international/${screen}`);
}

async function getNextPolicyIndex(screen: IntlScreenSlug): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("international_policies")
    .select("policy_index")
    .eq("screen", screen)
    .order("policy_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.policy_index ?? 0) + 1;
}

async function createStorageFolders(screen: IntlScreenSlug, policyIndex: number) {
  const admin = createAdminClient();
  const placeholder = Buffer.alloc(0);
  await Promise.all(
    DOCUMENT_CATEGORIES.map((cat) =>
      admin.storage
        .from("policy-documents")
        .upload(`${screen}/${policyIndex}/${cat}/.emptyFolderPlaceholder`, placeholder, {
          upsert: false,
        })
    )
  );
}

export async function createIntlPolicy(screen: IntlScreenSlug, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  function str(key: string) { return (formData.get(key) as string) || null; }

  const policyIndex = await getNextPolicyIndex(screen);

  const payload = {
    screen,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    date_of_birth: str("date_of_birth"),
    start_date: str("start_date"),
    end_date: str("end_date"),
    policy_index: policyIndex,
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
    group_name: str("group_name"),
    area: str("area"),
    plan_options: str("plan_options"),
    original_database: str("original_database"),
    wife_husband: str("wife_husband"),
    spouse_dob: str("spouse_dob"),
    spouse_certificate_number: str("spouse_certificate_number"),
    dependant_1: str("dependant_1"),
    dependant_2: str("dependant_2"),
    dependant_3: str("dependant_3"),
    dependant_4: str("dependant_4"),
    dependant_5: str("dependant_5"),
    dependant_6: str("dependant_6"),
    dependant_7: str("dependant_7"),
    renewal_date: str("renewal_date"),
    selected_retirement_age: str("selected_retirement_age"),
    regular_contribution: str("regular_contribution"),
    single_contribution: str("single_contribution"),
    contribution_term: str("contribution_term"),
    contribution_escalation: str("contribution_escalation"),
    smoker_status: str("smoker_status"),
    additional_protection: str("additional_protection"),
    investment_details: str("investment_details"),
  };

  const { data, error } = await supabase
    .from("international_policies")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  await createStorageFolders(screen, policyIndex);

  await logAudit({
    action: "create",
    entityType: "international_policy",
    entityId: data?.id,
    screen,
    details: { first_name: payload.first_name, last_name: payload.last_name, policy_index: policyIndex },
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
    group_name: str("group_name"),
    area: str("area"),
    plan_options: str("plan_options"),
    original_database: str("original_database"),
    wife_husband: str("wife_husband"),
    spouse_dob: str("spouse_dob"),
    spouse_certificate_number: str("spouse_certificate_number"),
    dependant_1: str("dependant_1"),
    dependant_2: str("dependant_2"),
    dependant_3: str("dependant_3"),
    dependant_4: str("dependant_4"),
    dependant_5: str("dependant_5"),
    dependant_6: str("dependant_6"),
    dependant_7: str("dependant_7"),
    renewal_date: str("renewal_date"),
    selected_retirement_age: str("selected_retirement_age"),
    regular_contribution: str("regular_contribution"),
    single_contribution: str("single_contribution"),
    contribution_term: str("contribution_term"),
    contribution_escalation: str("contribution_escalation"),
    smoker_status: str("smoker_status"),
    additional_protection: str("additional_protection"),
    investment_details: str("investment_details"),
  };

  const { error } = await supabase
    .from("international_policies")
    .update(payload)
    .eq("id", policyId);

  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    entityType: "international_policy",
    entityId: policyId,
    screen,
    details: { first_name: payload.first_name, last_name: payload.last_name },
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
