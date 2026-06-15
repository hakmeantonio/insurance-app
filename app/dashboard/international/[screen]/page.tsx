import { notFound } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { INTL_SCREENS, type IntlScreenSlug, type IntlPolicy } from "@/lib/types";
import { IntlPoliciesTable } from "./_components/intl-policies-table";
import { IntlPolicyFormDialog } from "./_components/intl-policy-form-dialog";
import { RL360PolicyFormDialog } from "./_components/rl360-policy-form-dialog";

export default async function IntlScreenPage({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen } = await params;
  if (!(screen in INTL_SCREENS)) notFound();

  const slug = screen as IntlScreenSlug;
  const screenName = INTL_SCREENS[slug];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: permRow }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user!.id).single(),
    supabase
      .from("intl_permissions")
      .select("can_read, can_create, can_update, can_delete")
      .eq("user_id", user!.id)
      .eq("screen", slug)
      .maybeSingle(),
  ]);

  const isAdmin = profile?.role === "admin";

  const perm = isAdmin
    ? { can_read: true, can_create: true, can_update: true, can_delete: true }
    : permRow ?? { can_read: false, can_create: false, can_update: false, can_delete: false };

  if (!perm.can_read) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ShieldOff className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Access Denied</h2>
        <p className="text-gray-400 text-sm mt-1">
          You don&apos;t have permission to view this screen. Contact an administrator.
        </p>
      </div>
    );
  }

  const { data: policies } = await supabase
    .from("international_policies")
    .select("*")
    .eq("screen", slug)
    .order("policy_index", { ascending: true });

  const policyList = (policies ?? []) as IntlPolicy[];
  const canEdit = perm.can_create || perm.can_update || perm.can_delete;

  const today = new Date();
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  const expiringSoon = policyList.filter((p) => {
    if (!p.end_date) return false;
    const end = new Date(p.end_date);
    return end >= today && end <= in30;
  }).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            International Policies
          </p>
          <h1 className="text-2xl font-semibold text-gray-900">{screenName}</h1>
        </div>
        {perm.can_create && (
          slug === "rl360"
            ? <RL360PolicyFormDialog />
            : <IntlPolicyFormDialog screen={slug} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{policyList.length}</p>
          <p className="text-sm text-gray-500">Total Policies</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-500">{expiringSoon}</p>
          <p className="text-sm text-gray-500">Expiring Within 30 Days</p>
        </div>
      </div>

      <IntlPoliciesTable policies={policyList} screen={slug} canEdit={canEdit} perm={perm} />
    </div>
  );
}
