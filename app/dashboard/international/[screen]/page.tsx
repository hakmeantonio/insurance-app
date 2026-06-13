import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { INTL_SCREENS, type IntlScreenSlug, type IntlPolicy } from "@/lib/types";
import { IntlPoliciesTable } from "./_components/intl-policies-table";
import { IntlPolicyFormDialog } from "./_components/intl-policy-form-dialog";

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
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", (await supabase.auth.getUser()).data.user!.id)
    .single();

  const { data: policies } = await supabase
    .from("international_policies")
    .select("*")
    .eq("screen", slug)
    .order("policy_index", { ascending: true });

  const policyList = (policies ?? []) as IntlPolicy[];
  const canEdit = profile?.role === "admin" || profile?.role === "employee";

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
        {canEdit && <IntlPolicyFormDialog screen={slug} />}
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

      <IntlPoliciesTable policies={policyList} screen={slug} canEdit={canEdit} />
    </div>
  );
}
