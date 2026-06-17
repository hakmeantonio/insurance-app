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

interface Props {
  policy?: IntlPolicy;
}

const empty = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  policy_number: "",
  residence_country: "",
  nationality: "",
  start_date: "",
  end_date: "",
  group_name: "",
  area: "",
  plan_type: "",
  plan_options: "",
  premium: "",
  frequency: "",
  passport_expiry_date: "",
  renewal_date: "",
  special_remarks: "",
  mode_of_payment: "",
  agent: "",
  original_database: "",
  wife_husband: "",
  spouse_dob: "",
  spouse_certificate_number: "",
  dependant_1: "",
  dependant_2: "",
  dependant_3: "",
  dependant_4: "",
  dependant_5: "",
  dependant_6: "",
  dependant_7: "",
  policy_status: "",
};

type Fields = typeof empty;

function policyToFields(p: IntlPolicy): Fields {
  return {
    first_name: p.first_name,
    last_name: p.last_name,
    date_of_birth: p.date_of_birth ?? "",
    policy_number: p.policy_number ?? "",
    residence_country: p.residence_country ?? "",
    nationality: p.nationality ?? "",
    start_date: p.start_date ?? "",
    end_date: p.end_date ?? "",
    group_name: p.group_name ?? "",
    area: p.area ?? "",
    plan_type: p.plan_type ?? "",
    plan_options: p.plan_options ?? "",
    premium: p.premium ?? "",
    frequency: p.frequency ?? "",
    passport_expiry_date: p.passport_expiry_date ?? "",
    renewal_date: p.renewal_date ?? "",
    special_remarks: p.special_remarks ?? "",
    mode_of_payment: p.mode_of_payment ?? "",
    agent: p.agent ?? "",
    original_database: p.original_database ?? "",
    wife_husband: p.wife_husband ?? "",
    spouse_dob: p.spouse_dob ?? "",
    spouse_certificate_number: p.spouse_certificate_number ?? "",
    dependant_1: p.dependant_1 ?? "",
    dependant_2: p.dependant_2 ?? "",
    dependant_3: p.dependant_3 ?? "",
    dependant_4: p.dependant_4 ?? "",
    dependant_5: p.dependant_5 ?? "",
    dependant_6: p.dependant_6 ?? "",
    dependant_7: p.dependant_7 ?? "",
    policy_status: p.policy_status ?? "",
  };
}

export function ExpacarePolicyFormDialog({ policy }: Props) {
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
      ? await updateIntlPolicy(policy.id, "expacare", fd)
      : await createIntlPolicy("expacare", fd);

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
              {isEdit ? "Edit Expacare Policy" : "New Expacare Policy"}
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
                {renderInput("first_name", "First Name", "text", true)}
                {renderInput("last_name", "Last Name", "text", true)}
                {renderInput("date_of_birth", "Birth Date", "date")}
                {renderInput("policy_number", "Certificate Number")}
                {renderSelect("residence_country", "Residence Country", COUNTRIES)}
                {renderSelect("nationality", "Nationality", NATIONALITIES)}
                {renderInput("start_date", "Inception Date", "date")}
                {renderInput("end_date", "Validity (End Date)", "date")}
                {renderInput("group_name", "Group")}
                {renderInput("area", "Area")}
                {renderInput("plan_type", "Plan")}
                {renderInput("plan_options", "Options")}
                {renderInput("premium", "Premium")}
                {renderInput("frequency", "Payment Frequency")}
                {renderInput("passport_expiry_date", "Passport Expiry Date", "date")}
                {renderInput("renewal_date", "Renewal Date", "date")}
                {renderInput("special_remarks", "Remarks")}
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {sectionHeader("Payment & Agent")}
                {renderInput("mode_of_payment", "Method Of Payment")}
                {renderInput("agent", "Agent")}
                {renderInput("original_database", "Original Database")}

                {sectionHeader("Family")}
                {renderInput("wife_husband", "Wife / Husband")}
                {renderInput("spouse_dob", "Spouse DOB")}
                {renderInput("spouse_certificate_number", "Spouse Certificate Number")}

                {sectionHeader("Dependants")}
                {renderInput("dependant_1", "Dependant 1")}
                {renderInput("dependant_2", "Dependant 2")}
                {renderInput("dependant_3", "Dependant 3")}
                {renderInput("dependant_4", "Dependant 4")}
                {renderInput("dependant_5", "Dependant 5")}
                {renderInput("dependant_6", "Dependant 6")}
                {renderInput("dependant_7", "Dependant 7")}

                {sectionHeader("Status")}
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
