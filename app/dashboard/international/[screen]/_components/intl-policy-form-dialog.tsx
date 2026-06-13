"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pencil } from "lucide-react";
import { createIntlPolicy, updateIntlPolicy } from "../actions";
import type { IntlPolicy, IntlScreenSlug } from "@/lib/types";

interface Props {
  screen: IntlScreenSlug;
  policy?: IntlPolicy;
}

const empty = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  start_date: "",
  end_date: "",
  policy_index: "",
};

function policyToFields(p: IntlPolicy) {
  return {
    first_name: p.first_name,
    last_name: p.last_name,
    date_of_birth: p.date_of_birth ?? "",
    start_date: p.start_date ?? "",
    end_date: p.end_date ?? "",
    policy_index: String(p.policy_index),
  };
}

export function IntlPolicyFormDialog({ screen, policy }: Props) {
  const isEdit = !!policy;
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState(isEdit ? policyToFields(policy) : empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof empty, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleOpen() {
    setFields(isEdit ? policyToFields(policy) : empty);
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.policy_index || isNaN(Number(fields.policy_index))) {
      setError("Index must be a valid number.");
      return;
    }
    setLoading(true);
    setError(null);

    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.set(k, v));

    const result = isEdit
      ? await updateIntlPolicy(policy.id, screen, fd)
      : await createIntlPolicy(screen, fd);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  const trigger = isEdit ? (
    <Button variant="ghost" size="sm" onClick={handleOpen}>
      <Pencil className="w-4 h-4" />
    </Button>
  ) : (
    <Button onClick={handleOpen}>
      <PlusCircle className="w-4 h-4 mr-2" />
      Add Policy
    </Button>
  );

  return (
    <>
      {trigger}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Policy" : "New Policy"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={fields.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                  required
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Family Name *</Label>
                <Input
                  id="last_name"
                  value={fields.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                  required
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={fields.date_of_birth}
                onChange={(e) => set("date_of_birth", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Starting Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={fields.start_date}
                  onChange={(e) => set("start_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Ending Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={fields.end_date}
                  onChange={(e) => set("end_date", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_index">Index *</Label>
              <Input
                id="policy_index"
                type="number"
                min="1"
                step="1"
                value={fields.policy_index}
                onChange={(e) => set("policy_index", e.target.value)}
                required
                placeholder="e.g. 1001"
              />
              <p className="text-xs text-gray-400">
                Unique number — corresponds to the physical folder for this policy.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Policy"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
