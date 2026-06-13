import { createClient } from "@/lib/supabase/server";

type AuditAction = "create" | "update" | "delete";

export async function logAudit({
  action,
  entityType,
  entityId,
  screen,
  details,
}: {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  screen?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      user_id: user?.id,
      user_email: user?.email,
      action,
      entity_type: entityType,
      entity_id: entityId,
      screen,
      details,
    });
  } catch {
    // audit failures must never break the primary operation
  }
}
