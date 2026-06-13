"use client";

import { useState } from "react";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserPermissions } from "../actions";
import type { AppUser, Screen, UserPermission, IntlPermission } from "@/lib/types";
import { INTL_SCREENS, type IntlScreenSlug } from "@/lib/types";

const PERM_KEYS = ["can_read", "can_create", "can_update", "can_delete"] as const;
const PERM_LABELS: Record<(typeof PERM_KEYS)[number], string> = {
  can_read: "Read",
  can_create: "Create",
  can_update: "Update",
  can_delete: "Delete",
};

function PermRow({
  name,
  perm,
}: {
  name: string;
  perm: Record<string, boolean>;
}) {
  const hasAny = PERM_KEYS.some((k) => perm[k]);
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-4 py-2.5 text-sm font-medium text-gray-800 w-40">{name}</td>
      {PERM_KEYS.map((k) => (
        <td key={k} className="px-3 py-2.5 text-center">
          {perm[k] ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
          ) : (
            <XCircle className="w-4 h-4 text-gray-200 mx-auto" />
          )}
        </td>
      ))}
      {!hasAny && (
        <td className="px-3 py-2.5 text-xs text-gray-400 italic">No access</td>
      )}
    </tr>
  );
}

export function ViewPermissionsDialog({ user }: { user: AppUser }) {
  const [open, setOpen] = useState(false);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [intlPermissions, setIntlPermissions] = useState<IntlPermission[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setOpen(true);
    setLoading(true);
    const data = await getUserPermissions(user.id);
    setScreens(data.screens);
    setPermissions(data.permissions);
    setIntlPermissions(data.intlPermissions);
    setLoading(false);
  }

  function getInsurancePerm(screenId: number): Record<string, boolean> {
    const found = permissions.find((p) => p.screen_id === screenId);
    return {
      can_read: found?.can_read ?? false,
      can_create: found?.can_create ?? false,
      can_update: found?.can_update ?? false,
      can_delete: found?.can_delete ?? false,
    };
  }

  function getIntlPerm(slug: IntlScreenSlug): Record<string, boolean> {
    const found = intlPermissions.find((p) => p.screen === slug);
    return {
      can_read: found?.can_read ?? false,
      can_create: found?.can_create ?? false,
      can_update: found?.can_update ?? false,
      can_delete: found?.can_delete ?? false,
    };
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpen} title="View permissions">
        <Eye className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Permissions — {user.email}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
          ) : (
            <div className="space-y-5 py-2">
              {screens.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Insurance
                  </p>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-2 font-medium text-gray-600 w-40">
                            Screen
                          </th>
                          {PERM_KEYS.map((k) => (
                            <th key={k} className="text-center px-3 py-2 font-medium text-gray-600 w-20">
                              {PERM_LABELS[k]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {screens.map((s) => (
                          <PermRow key={s.id} name={s.name} perm={getInsurancePerm(s.id)} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  International Policies
                </p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-2 font-medium text-gray-600 w-40">
                          Screen
                        </th>
                        {PERM_KEYS.map((k) => (
                          <th key={k} className="text-center px-3 py-2 font-medium text-gray-600 w-20">
                            {PERM_LABELS[k]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(Object.entries(INTL_SCREENS) as [IntlScreenSlug, string][]).map(
                        ([slug, name]) => (
                          <PermRow key={slug} name={name} perm={getIntlPerm(slug)} />
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
