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
import { PlusCircle, Pencil } from "lucide-react";
import { createIntlPolicy, updateIntlPolicy } from "../actions";
import { COUNTRIES } from "./rl360-policy-form-dialog";
import type { IntlPolicy } from "@/lib/types";

const SALUTATIONS = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", "Rev"];

interface Props {
  policy?: IntlPolicy;
}

const empty = {
  salutation: "",
  first_name: "",
  last_name: "",
  policy_number: "",
  company: "",
  address1: "",
  city: "",
  residence_country: "",
  date_of_birth: "",
  salary: "",
  passport_expiry_date: "",
  cover: "",
  net_premium: "",
  gross_premium: "",
  benefits: "",
  plan_term: "",
  group_name: "",
  start_date: "",
  agent: "",
  policy_status: "",
};

type Fields = typeof empty;

function policyToFields(p: IntlPolicy): Fields {
  return {
    salutation: p.salutation ?? "",
    first_name: p.first_name,
    last_name: p.last_name,
    policy_number: p.policy_number ?? "",
    company: p.company ?? "",
    address1: p.address1 ?? "",
    city: p.city ?? "",
    residence_country: p.residence_country ?? "",
    date_of_birth: p.date_of_birth ?? "",
    salary: p.salary ?? "",
    passport_expiry_date: p.passport_expiry_date ?? "",
    cover: p.cover ?? "",
    net_premium: p.net_premium ?? "",
    gross_premium: p.gross_premium ?? "",
    benefits: p.benefits ?? "",
    plan_term: p.plan_term ?? "",
    group_name: p.group_name ?? "",
    start_date: p.start_date ?? "",
    agent: p.agent ?? "",
    policy_status: p.policy_status ?? "",
  };
}

export function OmnilifePolicyFormDialog({ policy }: Props) {
  const isEdit = !!policy;
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<Fields>(isEdit ? policyToFields(policy) : empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: keyof Fields, value: string) {
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
      ? await updateIntlPolicy(policy.id, "omnilife", fd)
      : await createIntlPolicy("omnilife", fd);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  function renderInput(id: keyof Fields, label: string, type = "text", required = false) {
    return (
      <div key={id} className="space-y-1.5">
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}{required && " *"}
        </Label>
        <Input
          id={id}
          type={type}
          value={fields[id]}
          onChange={(e) => set(id, e.target.value)}
          required={required}
          className="h-9"
        />
      </div>
    );
  }

  function renderSelect(id: keyof Fields, label: string, options: string[], required = false) {
    return (
      <div key={id} className="space-y-1.5">
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}{required && " *"}
        </Label>
        <Select value={fields[id]} onValueChange={(v) => set(id, v ?? "")}>
          <SelectTrigger id={id} className="h-9 w-full">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  function sectionHeader(title: string) {
    return (
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2 pb-1 border-b border-gray-100">
        {title}
      </p>
    );
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
        <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEdit ? "Edit Omnilife Policy" : "New Omnilife Policy"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="py-2">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              {/* Left column */}
              <div className="space-y-4">
                {sectionHeader("Personal Details")}
                {renderSelect("salutation", "Salutation", SALUTATIONS)}
                {renderInput("first_name", "First Name", "text", true)}
                {renderInput("last_name", "Last Name", "text", true)}
                {renderInput("policy_number", "Policy No.")}
                {renderInput("company", "Company")}
                {renderInput("address1", "Address")}
                {renderInput("city", "City")}
                {renderSelect("residence_country", "Country", COUNTRIES)}
                {renderInput("date_of_birth", "D.O.B.", "date")}
                {renderInput("salary", "Salary")}
                {renderInput("passport_expiry_date", "Passport Expiry Date", "date")}
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {sectionHeader("Policy Details")}
                {renderInput("cover", "Cover")}
                {renderInput("net_premium", "Net Premium")}
                {renderInput("gross_premium", "Gross Premium")}
                {renderInput("benefits", "Benefits")}
                {renderInput("plan_term", "Term")}
                {renderInput("group_name", "Group")}
                {renderInput("start_date", "Inception Date", "date")}
                {renderInput("agent", "Agent")}
                {renderInput("policy_status", "Policy Status")}
              </div>
            </div>

            {isEdit && (
              <div className="mt-2 border-t border-gray-100 pt-4 flex items-center gap-2 text-sm text-gray-500">
                <span>Index:</span>
                <span className="font-mono font-bold text-gray-800">{policy.policy_index}</span>
                <span className="text-xs text-gray-400">(auto-assigned, cannot be changed)</span>
              </div>
            )}

            <DialogFooter className="pt-4">
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
