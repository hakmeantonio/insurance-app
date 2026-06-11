"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PolicyFormDialog } from "./policy-form-dialog";
import { DeletePolicyButton } from "./delete-policy-button";
import type { Policy, UserPermission } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  expired: "bg-gray-100 text-gray-600 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

function fmtCurrency(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

interface Props {
  policies: Policy[];
  permission: UserPermission;
  screenId: number;
}

export function PoliciesTable({ policies, permission, screenId }: Props) {
  const hasActions = permission.can_update || permission.can_delete;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Policy #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Premium</TableHead>
            {hasActions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={hasActions ? 7 : 6}
                className="text-center py-12 text-gray-400"
              >
                No policies yet.{" "}
                {permission.can_create && "Add your first policy above."}
              </TableCell>
            </TableRow>
          ) : (
            policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-mono text-sm font-medium">
                  {policy.policy_number}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {policy.client_name}
                  </div>
                  {policy.client_email && (
                    <div className="text-xs text-gray-400">
                      {policy.client_email}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[policy.status] ?? ""}`}
                  >
                    {policy.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {fmt(policy.start_date)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {fmt(policy.end_date)}
                </TableCell>
                <TableCell className="text-sm text-gray-700 font-medium">
                  {fmtCurrency(policy.premium)}
                </TableCell>
                {hasActions && (
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {permission.can_update && (
                        <PolicyFormDialog
                          screenId={screenId}
                          policy={policy}
                        />
                      )}
                      {permission.can_delete && (
                        <DeletePolicyButton
                          policyId={policy.id}
                          policyNumber={policy.policy_number}
                          screenId={screenId}
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
