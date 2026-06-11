import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShieldOff } from "lucide-react";
import { PoliciesTable } from "./_components/policies-table";
import { PolicyFormDialog } from "./_components/policy-form-dialog";
import type { Policy, UserPermission } from "@/lib/types";

const NO_PERMISSION: UserPermission = {
  screen_id: 0,
  can_read: false,
  can_create: false,
  can_update: false,
  can_delete: false,
};

export default async function InsuranceScreenPage({
  params,
}: {
  params: Promise<{ screenId: string }>;
}) {
  const { screenId } = await params;
  const id = Number(screenId);
  if (isNaN(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: screen }, { data: permRow }, { data: policies }] =
    await Promise.all([
      supabase.from("screens").select("*").eq("id", id).single(),
      supabase
        .from("permissions")
        .select("can_read, can_create, can_update, can_delete")
        .eq("user_id", user!.id)
        .eq("screen_id", id)
        .maybeSingle(),
      supabase
        .from("policies")
        .select("*")
        .eq("screen_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!screen) notFound();

  const permission: UserPermission = permRow
    ? { screen_id: id, ...permRow }
    : NO_PERMISSION;

  if (!permission.can_read) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <ShieldOff className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">Access Denied</h2>
        <p className="text-gray-400 text-sm mt-1">
          You don&apos;t have permission to view this screen. Contact an
          administrator.
        </p>
      </div>
    );
  }

  const policyList = (policies ?? []) as Policy[];

  const stats = {
    total: policyList.length,
    active: policyList.filter((p) => p.status === "active").length,
    totalPremium: policyList.reduce((sum, p) => sum + (p.premium ?? 0), 0),
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{screen.name}</h1>
          {screen.description && (
            <p className="text-gray-500 text-sm mt-1">{screen.description}</p>
          )}
        </div>
        {permission.can_create && <PolicyFormDialog screenId={id} />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Policies</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-sm text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }).format(stats.totalPremium)}
          </p>
          <p className="text-sm text-gray-500">Total Premium</p>
        </div>
      </div>

      <PoliciesTable
        policies={policyList}
        permission={permission}
        screenId={id}
      />
    </div>
  );
}
