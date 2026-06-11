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
import { getUserPermissions, savePermissions } from "../actions";
import type { AppUser, Screen, UserPermission } from "@/lib/types";

const PERM_KEYS = ["can_read", "can_create", "can_update", "can_delete"] as const;
const PERM_LABELS: Record<(typeof PERM_KEYS)[number], string> = {
  can_read: "Read",
  can_create: "Create",
  can_update: "Update",
  can_delete: "Delete",
};

type PermMap = Record<number, UserPermission>;

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

export function PermissionsDialog({ user }: { user: AppUser }) {
  const [open, setOpen] = useState(false);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [permMap, setPermMap] = useState<PermMap>({});
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    setOpen(true);
    setLoadingData(true);
    const { screens, permissions } = await getUserPermissions(user.id);
    setScreens(screens);
    setPermMap(buildPermMap(screens, permissions));
    setLoadingData(false);
  }

  function toggle(screenId: number, key: (typeof PERM_KEYS)[number]) {
    setPermMap((prev) => ({
      ...prev,
      [screenId]: { ...prev[screenId], [key]: !prev[screenId][key] },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await savePermissions(user.id, Object.values(permMap));
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpen}>
        <ShieldCheck className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
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
            ) : screens.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No insurance screens configured yet.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">
                        Screen
                      </th>
                      {PERM_KEYS.map((k) => (
                        <th
                          key={k}
                          className="text-center px-4 py-3 font-medium text-gray-600 w-24"
                        >
                          {PERM_LABELS[k]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {screens.map((screen, i) => (
                      <tr
                        key={screen.id}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {screen.name}
                          {screen.description && (
                            <p className="text-xs text-gray-400 font-normal">
                              {screen.description}
                            </p>
                          )}
                        </td>
                        {PERM_KEYS.map((k) => (
                          <td key={k} className="px-4 py-3 text-center">
                            <Switch
                              checked={permMap[screen.id]?.[k] ?? false}
                              onCheckedChange={() => toggle(screen.id, k)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || loadingData || screens.length === 0}>
              {saving ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
