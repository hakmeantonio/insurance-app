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
import { COUNTRIES, NATIONALITIES } from "./rl360-policy-form-dialog";
import type { IntlPolicy } from "@/lib/types";

const SALUTATIONS = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", "Rev"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Separated", "Civil Partnership"];
const CURRENCIES = [
  "USD", "EUR", "GBP", "CHF", "AED", "LBP", "SAR", "QAR", "KWD", "BHD",
  "OMR", "JOD", "EGP", "CAD", "AUD", "JPY", "CNY", "INR", "SGD", "HKD",
];

interface Props {
  policy?: IntlPolicy;
}

const empty = {
  salutation: "",
  first_name: "",
  last_name: "",
  policy_number: "",
  date_of_birth: "",
  residence_country: "",
  nationality: "",
  marital_status: "",
  plan_type: "",
  plan_basis: "",
  currency_of_plan: "",
  selected_retirement_age: "",
  passport_expiry_date: "",
  regular_contribution: "",
  single_contribution: "",
  frequency: "",
  contribution_term: "",
  contribution_escalation: "",
  smoker_status: "",
  additional_protection: "",
  investment_details: "",
  mode_of_payment: "",
  special_remarks: "",
  agent: "",
  start_date: "",
  policy_status: "",
};

type Fields = typeof empty;

function policyToFields(p: IntlPolicy): Fields {
  return {
    salutation: p.salutation ?? "",
    first_name: p.first_name,
    last_name: p.last_name,
    policy_number: p.policy_number ?? "",
    date_of_birth: p.date_of_birth ?? "",
    residence_country: p.residence_country ?? "",
    nationality: p.nationality ?? "",
    marital_status: p.marital_status ?? "",
    plan_type: p.plan_type ?? "",
    plan_basis: p.plan_basis ?? "",
    currency_of_plan: p.currency_of_plan ?? "",
    selected_retirement_age: p.selected_retirement_age ?? "",
    passport_expiry_date: p.passport_expiry_date ?? "",
    regular_contribution: p.regular_contribution ?? "",
    single_contribution: p.single_contribution ?? "",
    frequency: p.frequency ?? "",
    contribution_term: p.contribution_term ?? "",
    contribution_escalation: p.contribution_escalation ?? "",
    smoker_status: p.smoker_status ?? "",
    additional_protection: p.additional_protection ?? "",
    investment_details: p.investment_details ?? "",
    mode_of_payment: p.mode_of_payment ?? "",
    special_remarks: p.special_remarks ?? "",
    agent: p.agent ?? "",
    start_date: p.start_date ?? "",
    policy_status: p.policy_status ?? "",
  };
}

export function FriendsPolicyFormDialog({ policy }: Props) {
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
      ? await updateIntlPolicy(policy.id, "friends-provident", fd)
      : await createIntlPolicy("friends-provident", fd);

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
              {isEdit ? "Edit Friends Provident Policy" : "New Friends Provident Policy"}
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
                {renderInput("date_of_birth", "D.O.B.", "date")}
                {renderSelect("residence_country", "Country Of Residence", COUNTRIES)}
                {renderSelect("nationality", "Nationality", NATIONALITIES)}
                {renderSelect("marital_status", "Marital Status", MARITAL_STATUSES)}

                {sectionHeader("Plan Details")}
                {renderInput("plan_type", "Type Of Plan")}
                {renderInput("plan_basis", "Plan Basis")}
                {renderSelect("currency_of_plan", "Currency Of Plan", CURRENCIES)}
                {renderInput("selected_retirement_age", "Selected Retirement Age")}
                {renderInput("passport_expiry_date", "Passport Expiry Date", "date")}
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {sectionHeader("Contributions")}
                {renderInput("regular_contribution", "Regular Contribution")}
                {renderInput("single_contribution", "Single Contribution")}
                {renderInput("frequency", "Contribution Frequency")}
                {renderInput("contribution_term", "Contribution Term")}
                {renderInput("contribution_escalation", "Contribution Escalation")}
                {renderInput("smoker_status", "Smoker / Non Smoker")}
                {renderInput("additional_protection", "Additional Protection")}
                {renderInput("investment_details", "Investment Details")}

                {sectionHeader("Additional")}
                {renderInput("mode_of_payment", "Method Of Payment")}
                {renderInput("special_remarks", "Special Remark")}
                {renderInput("agent", "Agent")}
                {renderInput("start_date", "Commencement Date", "date")}
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
