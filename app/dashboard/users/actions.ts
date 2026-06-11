"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole, UserPermission } from "@/lib/types";

export async function inviteUser(formData: FormData) {
  const email = formData.get("email") as string;
  const role = formData.get("role") as UserRole;

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role },
  });

  if (error) return { error: error.message };

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    role,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/dashboard/users");
  return { error: null };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/users");
  return { error: null };
}

export async function deleteUser(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/users");
  return { error: null };
}

export async function getUserPermissions(userId: string) {
  const supabase = await createClient();

  const [{ data: screens }, { data: permissions }] = await Promise.all([
    supabase.from("screens").select("*").order("name"),
    supabase
      .from("permissions")
      .select("screen_id, can_read, can_create, can_update, can_delete")
      .eq("user_id", userId),
  ]);

  return { screens: screens ?? [], permissions: permissions ?? [] };
}

export async function savePermissions(
  userId: string,
  permissions: UserPermission[]
) {
  const supabase = await createClient();

  const { error } = await supabase.from("permissions").upsert(
    permissions.map((p) => ({ user_id: userId, ...p })),
    { onConflict: "user_id,screen_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard/users");
  return { error: null };
}
