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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPolicy, updatePolicy } from "../actions";
import type { Policy, PolicyStatus } from "@/lib/types";
import { PlusCircle, Pencil } from "lucide-react";

interface Props {
  screenId: number;
  policy?: Policy;
  trigger?: React.ReactNode;
}

const STATUSES: { value: PolicyStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const empty = {
  policy_number: "",
  client_name: "",
  client_email: "",
  start_date: "",
  end_date: "",
  premium: "",
  status: "active" as PolicyStatus,
  notes: "",
};

function policyToFields(p: Policy) {
  return {
    policy_number: p.policy_number,
    client_name: p.client_name,
    client_email: p.client_email ?? "",
    start_date: p.start_date ?? "",
    end_date: p.end_date ?? "",
    premium: p.premium != null ? String(p.premium) : "",
    status: p.status,
    notes: p.notes ?? "",
  };
}

export function PolicyFormDialog({ screenId, policy, trigger }: Props) {
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
    setLoading(true);
    setError(null);

    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.set(k, v));

    const result = isEdit
      ? await updatePolicy(policy.id, screenId, fd)
      : await createPolicy(screenId, fd);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  const defaultTrigger = isEdit ? (
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
      {trigger ? (
        <span onClick={handleOpen} className="cursor-pointer">
          {trigger}
        </span>
      ) : (
        defaultTrigger
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="policy_number">Policy Number *</Label>
                <Input
                  id="policy_number"
                  value={fields.policy_number}
                  onChange={(e) => set("policy_number", e.target.value)}
                  required
                  placeholder="POL-0001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={fields.status}
                  onValueChange={(v) => set("status", v as PolicyStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name *</Label>
              <Input
                id="client_name"
                value={fields.client_name}
                onChange={(e) => set("client_name", e.target.value)}
                required
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_email">Client Email</Label>
              <Input
                id="client_email"
                type="email"
                value={fields.client_email}
                onChange={(e) => set("client_email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={fields.start_date}
                  onChange={(e) => set("start_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={fields.end_date}
                  onChange={(e) => set("end_date", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="premium">Premium ($)</Label>
              <Input
                id="premium"
                type="number"
                min="0"
                step="0.01"
                value={fields.premium}
                onChange={(e) => set("premium", e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={fields.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
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
