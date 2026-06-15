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
import type { IntlPolicy } from "@/lib/types";

const SALUTATIONS = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", "Rev"];

const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Separated", "Civil Partnership"];

const CURRENCIES = [
  "USD", "EUR", "GBP", "CHF", "AED", "LBP", "SAR", "QAR", "KWD", "BHD",
  "OMR", "JOD", "EGP", "CAD", "AUD", "JPY", "CNY", "INR", "SGD", "HKD",
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe",
];

const NATIONALITIES = [
  "Afghan", "Albanian", "Algerian", "Andorran", "Angolan", "Antiguan", "Argentine",
  "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini",
  "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese",
  "Bhutanese", "Bolivian", "Bosnian", "Botswanan", "Brazilian", "Bruneian",
  "Bulgarian", "Burkinabe", "Burundian", "Cabo Verdean", "Cambodian", "Cameroonian",
  "Canadian", "Central African", "Chadian", "Chilean", "Chinese", "Colombian",
  "Comorian", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech",
  "Danish", "Djiboutian", "Dominican", "Ecuadorian", "Egyptian", "Emirati",
  "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", "Fijian", "Finnish",
  "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek",
  "Grenadian", "Guatemalan", "Guinean", "Guyanese", "Haitian", "Honduran",
  "Hungarian", "Icelandic", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish",
  "Israeli", "Italian", "Jamaican", "Japanese", "Jordanian", "Kazakhstani",
  "Kenyan", "Kiribati", "Kuwaiti", "Kyrgyz", "Lao", "Latvian", "Lebanese",
  "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourgish",
  "Malagasy", "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese",
  "Marshallese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan",
  "Monacan", "Mongolian", "Montenegrin", "Moroccan", "Mozambican", "Myanmar",
  "Namibian", "Nauruan", "Nepali", "Dutch", "New Zealander", "Nicaraguan",
  "Nigerien", "Nigerian", "North Korean", "Norwegian", "Omani", "Pakistani",
  "Palauan", "Palestinian", "Panamanian", "Papua New Guinean", "Paraguayan",
  "Peruvian", "Filipino", "Polish", "Portuguese", "Qatari", "Romanian", "Russian",
  "Rwandan", "Samoan", "Saudi", "Senegalese", "Serbian", "Seychellois",
  "Sierra Leonean", "Singaporean", "Slovak", "Slovenian", "Solomon Islander",
  "Somali", "South African", "South Korean", "South Sudanese", "Spanish",
  "Sri Lankan", "Sudanese", "Surinamese", "Swedish", "Swiss", "Syrian",
  "Taiwanese", "Tajik", "Tanzanian", "Thai", "Timorese", "Togolese", "Tongan",
  "Trinidadian", "Tunisian", "Turkish", "Turkmen", "Tuvaluan", "Ugandan",
  "Ukrainian", "British", "American", "Uruguayan", "Uzbek", "Vanuatuan",
  "Venezuelan", "Vietnamese", "Yemeni", "Zambian", "Zimbabwean",
];

interface Props {
  policy?: IntlPolicy;
}

const empty = {
  salutation: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  marital_status: "",
  nationality: "",
  residence_country: "",
  policy_number: "",
  plan_type: "",
  plan_basis: "",
  currency_of_plan: "",
  premium: "",
  passport_expiry_date: "",
  escalated_premium: "",
  frequency: "",
  vanishing_premium: "",
  benefits: "",
  escalated_benefits: "",
  fund_selection: "",
  plan_term: "",
  sra: "",
  mode_of_payment: "",
  agent: "",
  special_remarks: "",
  start_date: "",
  policy_status: "",
  policy_index: "",
};

type Fields = typeof empty;

function policyToFields(p: IntlPolicy): Fields {
  return {
    salutation: p.salutation ?? "",
    first_name: p.first_name,
    last_name: p.last_name,
    date_of_birth: p.date_of_birth ?? "",
    marital_status: p.marital_status ?? "",
    nationality: p.nationality ?? "",
    residence_country: p.residence_country ?? "",
    policy_number: p.policy_number ?? "",
    plan_type: p.plan_type ?? "",
    plan_basis: p.plan_basis ?? "",
    currency_of_plan: p.currency_of_plan ?? "",
    premium: p.premium ?? "",
    passport_expiry_date: p.passport_expiry_date ?? "",
    escalated_premium: p.escalated_premium ?? "",
    frequency: p.frequency ?? "",
    vanishing_premium: p.vanishing_premium ?? "",
    benefits: p.benefits ?? "",
    escalated_benefits: p.escalated_benefits ?? "",
    fund_selection: p.fund_selection ?? "",
    plan_term: p.plan_term ?? "",
    sra: p.sra ?? "",
    mode_of_payment: p.mode_of_payment ?? "",
    agent: p.agent ?? "",
    special_remarks: p.special_remarks ?? "",
    start_date: p.start_date ?? "",
    policy_status: p.policy_status ?? "",
    policy_index: String(p.policy_index),
  };
}

export function RL360PolicyFormDialog({ policy }: Props) {
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
    if (!fields.policy_index || isNaN(Number(fields.policy_index))) {
      setError("Index must be a valid number.");
      return;
    }
    setLoading(true);
    setError(null);

    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.set(k, v));

    const result = isEdit
      ? await updateIntlPolicy(policy.id, "rl360", fd)
      : await createIntlPolicy("rl360", fd);

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
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{isEdit ? "Edit RL360 Policy" : "New RL360 Policy"}</DialogTitle>
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
                {renderInput("date_of_birth", "D.O.B.", "date")}
                {renderSelect("marital_status", "Marital Status", MARITAL_STATUSES)}
                {renderSelect("nationality", "Nationality", NATIONALITIES)}
                {renderSelect("residence_country", "Residence Country", COUNTRIES)}
                {renderInput("passport_expiry_date", "Passport Expiry Date", "date")}

                {sectionHeader("Policy Info")}
                {renderInput("policy_number", "Policy No.")}
                {renderInput("plan_type", "Plan Type")}
                {renderInput("plan_basis", "Plan Basis")}
                {renderSelect("currency_of_plan", "Currency Of Plan", CURRENCIES)}
                {renderInput("premium", "Premium")}
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {sectionHeader("Plan Details")}
                {renderInput("escalated_premium", "Escalated Premium")}
                {renderInput("frequency", "Frequency")}
                {renderInput("vanishing_premium", "Vanishing Premium")}
                {renderInput("benefits", "Benefits")}
                {renderInput("escalated_benefits", "Escalated Benefits")}
                {renderInput("fund_selection", "Fund Selection")}
                {renderInput("plan_term", "Plan Term")}
                {renderInput("sra", "SRA")}
                {renderInput("mode_of_payment", "Mode Of Payment")}

                {sectionHeader("Additional")}
                {renderInput("agent", "Agent")}
                {renderInput("special_remarks", "Special Remarks")}
                {renderInput("start_date", "Commencement Date", "date")}
                {renderInput("policy_status", "Policy Status")}
              </div>
            </div>

            <div className="mt-6 space-y-1.5 border-t border-gray-100 pt-4">
              <Label htmlFor="policy_index" className="text-sm font-medium text-gray-700">
                Index *
              </Label>
              <Input
                id="policy_index"
                type="number"
                min="1"
                step="1"
                value={fields.policy_index}
                onChange={(e) => set("policy_index", e.target.value)}
                required
                placeholder="e.g. 1001"
                className="h-9 max-w-xs"
              />
              <p className="text-xs text-gray-400">
                Unique number — corresponds to the physical folder for this policy.
              </p>
            </div>

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
