"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole, UserPermission, IntlPermission, IntlScreenSlug } from "@/lib/types";
import { INTL_SCREENS } from "@/lib/types";

async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "Not authenticated";
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") return "Access denied";
  return null;
}

export async function createUser(formData: FormData) {
  const authError = await requireAdmin();
  if (authError) return { error: authError };

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as UserRole;

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
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

export async function resetUserPassword(userId: string, newPassword: string) {
  const authError = await requireAdmin();
  if (authError) return { error: authError };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const authError = await requireAdmin();
  if (authError) return { error: authError };
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
  const authError = await requireAdmin();
  if (authError) return { error: authError };
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/users");
  return { error: null };
}

export async function getUserPermissions(userId: string) {
  // Use admin client so RLS doesn't block reading another user's rows
  const supabase = createAdminClient();

  const [{ data: screens }, { data: permissions }, { data: intlPermissions }] =
    await Promise.all([
      supabase.from("screens").select("*").order("name"),
      supabase
        .from("permissions")
        .select("screen_id, can_read, can_create, can_update, can_delete")
        .eq("user_id", userId),
      supabase
        .from("intl_permissions")
        .select("screen, can_read, can_create, can_update, can_delete")
        .eq("user_id", userId),
    ]);

  return {
    screens: screens ?? [],
    permissions: permissions ?? [],
    intlPermissions: intlPermissions ?? [],
  };
}

export async function saveIntlPermissions(
  userId: string,
  permissions: IntlPermission[]
) {
  const authError = await requireAdmin();
  if (authError) return { error: authError };
  const supabase = createAdminClient();

  const { error } = await supabase.from("intl_permissions").upsert(
    permissions.map((p) => ({ user_id: userId, ...p })),
    { onConflict: "user_id,screen" }
  );

  if (error) return { error: error.message };
  revalidatePath("/dashboard/users");
  return { error: null };
}

export async function getIntlPermission(
  userId: string,
  screen: IntlScreenSlug
): Promise<IntlPermission> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("intl_permissions")
    .select("can_read, can_create, can_update, can_delete")
    .eq("user_id", userId)
    .eq("screen", screen)
    .single();

  return (
    data
      ? { screen, ...data }
      : { screen, can_read: false, can_create: false, can_update: false, can_delete: false }
  );
}

export async function savePermissions(
  userId: string,
  permissions: UserPermission[]
) {
  const authError = await requireAdmin();
  if (authError) return { error: authError };
  const supabase = createAdminClient();

  const { error } = await supabase.from("permissions").upsert(
    permissions.map((p) => ({ user_id: userId, ...p })),
    { onConflict: "user_id,screen_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard/users");
  return { error: null };
}
