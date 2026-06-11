"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PolicyStatus } from "@/lib/types";

function revalidate(screenId: string) {
  revalidatePath(`/dashboard/insurance/${screenId}`);
}

export async function createPolicy(screenId: number, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("policies").insert({
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
  });

  if (error) return { error: error.message };
  revalidate(String(screenId));
  return { error: null };
}

export async function updatePolicy(
  policyId: string,
  screenId: number,
  formData: FormData
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("policies")
    .update({
      policy_number: formData.get("policy_number") as string,
      client_name: formData.get("client_name") as string,
      client_email: (formData.get("client_email") as string) || null,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
      premium: formData.get("premium") ? Number(formData.get("premium")) : null,
      status: formData.get("status") as PolicyStatus,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", policyId);

  if (error) return { error: error.message };
  revalidate(String(screenId));
  return { error: null };
}

export async function deletePolicy(policyId: string, screenId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("policies")
    .delete()
    .eq("id", policyId);

  if (error) return { error: error.message };
  revalidate(String(screenId));
  return { error: null };
}
