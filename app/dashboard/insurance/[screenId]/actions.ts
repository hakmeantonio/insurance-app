"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import type { PolicyStatus } from "@/lib/types";

function revalidate(screenId: string) {
  revalidatePath(`/dashboard/insurance/${screenId}`);
}

export async function createPolicy(screenId: number, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    screen_id: screenId,
    policy_number: formData.get("policy_number") as string,
    client_name: formData.get("client_name") as string,
    client_email: (formData.get("client_email") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    premium: formData.get("premium") ? Number(formData.get("premium")) : null,
    status: (formData.get("status") as PolicyStatus) ?? "active",
    notes: (formData.get("notes") as string) || null,
    created_by: user?.id,
  };

  const { data, error } = await supabase.from("policies").insert(payload).select("id").single();

  if (error) return { error: error.message };

  await logAudit({
    action: "create",
    entityType: "policy",
    entityId: data?.id,
    screen: `insurance/${screenId}`,
    details: { policy_number: payload.policy_number, client_name: payload.client_name, screen_id: screenId },
  });

  revalidate(String(screenId));
  return { error: null };
}

export async function updatePolicy(
  policyId: string,
  screenId: number,
  formData: FormData
) {
  const supabase = await createClient();

  const payload = {
    policy_number: formData.get("policy_number") as string,
    client_name: formData.get("client_name") as string,
    client_email: (formData.get("client_email") as string) || null,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    premium: formData.get("premium") ? Number(formData.get("premium")) : null,
    status: formData.get("status") as PolicyStatus,
    notes: (formData.get("notes") as string) || null,
  };

  const { error } = await supabase.from("policies").update(payload).eq("id", policyId);

  if (error) return { error: error.message };

  await logAudit({
    action: "update",
    entityType: "policy",
    entityId: policyId,
    screen: `insurance/${screenId}`,
    details: { policy_number: payload.policy_number, client_name: payload.client_name, screen_id: screenId },
  });

  revalidate(String(screenId));
  return { error: null };
}

export async function deletePolicy(policyId: string, screenId: number) {
  const supabase = await createClient();

  const { data: policy } = await supabase
    .from("policies")
    .select("policy_number, client_name")
    .eq("id", policyId)
    .single();

  const { error } = await supabase.from("policies").delete().eq("id", policyId);

  if (error) return { error: error.message };

  await logAudit({
    action: "delete",
    entityType: "policy",
    entityId: policyId,
    screen: `insurance/${screenId}`,
    details: { policy_number: policy?.policy_number, client_name: policy?.client_name, screen_id: screenId },
  });

  revalidate(String(screenId));
  return { error: null };
}
