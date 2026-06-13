"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { getUserPermissions, savePermissions, saveIntlPermissions } from "../actions";
import type { AppUser, Screen, UserPermission, IntlPermission, IntlScreenSlug } from "@/lib/types";
import { INTL_SCREENS } from "@/lib/types";

const PERM_KEYS = ["can_read", "can_create", "can_update", "can_delete"] as const;
const PERM_LABELS: Record<(typeof PERM_KEYS)[number], string> = {
  can_read: "Read",
  can_create: "Create",
  can_update: "Update",
  can_delete: "Delete",
};

type PermMap = Record<number, UserPermission>;
type IntlPermMap = Record<string, IntlPermission>;

function buildPermMap(screens: Screen[], existing: UserPermission[]): PermMap {
  const map: PermMap = {};
  for (const screen of screens) {
    const found = existing.find((p) => p.screen_id === screen.id);
    map[screen.id] = found ?? {
      screen_id: screen.id,
      can_read: false,
      can_create: false,
      can_update: false,
      can_delete: false,
    };
  }
  return map;
}

function buildIntlPermMap(existing: IntlPermission[]): IntlPermMap {
  const map: IntlPermMap = {};
  for (const slug of Object.keys(INTL_SCREENS) as IntlScreenSlug[]) {
    const found = existing.find((p) => p.screen === slug);
    map[slug] = found ?? {
      screen: slug,
      can_read: false,
      can_create: false,
      can_update: false,
      can_delete: false,
    };
  }
  return map;
}

function PermTable({
  label,
  rows,
  onToggle,
}: {
  label: string;
  rows: { id: string | number; name: string; perm: Record<string, boolean> }[];
  onToggle: (id: string | number, key: (typeof PERM_KEYS)[number]) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 font-medium text-gray-600">Screen</th>
              {PERM_KEYS.map((k) => (
                <th key={k} className="text-center px-3 py-2 font-medium text-gray-600 w-20">
                  {PERM_LABELS[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-4 py-2 font-medium text-gray-800">{row.name}</td>
                {PERM_KEYS.map((k) => (
                  <td key={k} className="px-3 py-2 text-center">
                    <Switch
                      checked={row.perm[k] ?? false}
                      onCheckedChange={() => onToggle(row.id, k)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PermissionsDialog({ user }: { user: AppUser }) {
  const [open, setOpen] = useState(false);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [permMap, setPermMap] = useState<PermMap>({});
  const [intlPermMap, setIntlPermMap] = useState<IntlPermMap>({});
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    setOpen(true);
    setLoadingData(true);
    const { screens, permissions, intlPermissions } = await getUserPermissions(user.id);
    setScreens(screens);
    setPermMap(buildPermMap(screens, permissions));
    setIntlPermMap(buildIntlPermMap(intlPermissions));
    setLoadingData(false);
  }

  function toggleInsurance(screenId: number, key: (typeof PERM_KEYS)[number]) {
    setPermMap((prev) => ({
      ...prev,
      [screenId]: { ...prev[screenId], [key]: !prev[screenId][key] },
    }));
  }

  function toggleIntl(slug: string, key: (typeof PERM_KEYS)[number]) {
    setIntlPermMap((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [key]: !prev[slug][key] },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const [r1, r2] = await Promise.all([
      savePermissions(user.id, Object.values(permMap)),
      saveIntlPermissions(user.id, Object.values(intlPermMap) as IntlPermission[]),
    ]);

    setSaving(false);
    if (r1.error ?? r2.error) {
      setError(r1.error ?? r2.error ?? "Unknown error");
    } else {
      setOpen(false);
    }
  }

  const insuranceRows = screens.map((s) => ({
    id: s.id,
    name: s.name,
    perm: permMap[s.id] as unknown as Record<string, boolean>,
  }));

  const intlRows = (Object.entries(INTL_SCREENS) as [IntlScreenSlug, string][]).map(
    ([slug, name]) => ({
      id: slug,
      name,
      perm: intlPermMap[slug] as unknown as Record<string, boolean>,
    })
  );

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpen}>
        <ShieldCheck className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm text-gray-500 mb-4">{user.email}</p>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            {loadingData ? (
              <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
            ) : (
              <>
                {insuranceRows.length > 0 && (
                  <PermTable
                    label="Insurance"
                    rows={insuranceRows}
                    onToggle={(id, key) => toggleInsurance(id as number, key)}
                  />
                )}
                <PermTable
                  label="International Policies"
                  rows={intlRows}
                  onToggle={(id, key) => toggleIntl(id as string, key)}
                />
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || loadingData}>
              {saving ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
