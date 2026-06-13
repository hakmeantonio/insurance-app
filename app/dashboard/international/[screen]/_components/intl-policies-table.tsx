"use client";

import Link from "next/link";
import { FolderOpen, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IntlPolicyFormDialog } from "./intl-policy-form-dialog";
import { DeleteIntlPolicyButton } from "./delete-intl-policy-button";
import type { IntlPolicy, IntlScreenSlug } from "@/lib/types";
import { INTL_SCREENS } from "@/lib/types";

function fmt(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

interface Props {
  policies: IntlPolicy[];
  screen: IntlScreenSlug;
  canEdit: boolean;
}

export function IntlPoliciesTable({ policies, screen, canEdit }: Props) {
  const folderBase = process.env.NEXT_PUBLIC_INTL_FOLDER_BASE;
  const screenName = INTL_SCREENS[screen];

  function folderHref(index: number) {
    if (!folderBase) return null;
    const base = folderBase.replace(/\\/g, "/").replace(/\/$/, "");
    return `file:///${base}/${screenName}/${index}`;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Index</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Family Name</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {policies.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-12 text-gray-400"
              >
                No policies yet. Add your first policy above.
              </TableCell>
            </TableRow>
          ) : (
            policies.map((policy) => {
              const href = folderHref(policy.policy_index);
              return (
                <TableRow key={policy.id}>
                  <TableCell>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        title={`Open folder: ${href}`}
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        {policy.policy_index}
                      </a>
                    ) : (
                      <span className="font-mono font-bold text-gray-800">
                        {policy.policy_index}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {policy.first_name}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {policy.last_name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {fmt(policy.date_of_birth)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {fmt(policy.start_date)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {fmt(policy.end_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/international/${screen}/${policy.policy_index}`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      {canEdit && (
                        <>
                          <IntlPolicyFormDialog screen={screen} policy={policy} />
                          <DeleteIntlPolicyButton
                            policyId={policy.id}
                            policyIndex={policy.policy_index}
                            screen={screen}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
