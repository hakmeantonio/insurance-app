export type UserRole = "employee" | "broker" | "admin";
export type PolicyStatus = "active" | "pending" | "expired" | "cancelled";

export interface AppUser {
  id: string;
  email: string;
  role: UserRole | null;
  created_at: string;
}

export interface Screen {
  id: number;
  name: string;
  description: string | null;
}

export interface UserPermission {
  screen_id: number;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface Policy {
  id: string;
  screen_id: number;
  policy_number: string;
  client_name: string;
  client_email: string | null;
  start_date: string | null;
  end_date: string | null;
  premium: number | null;
  status: PolicyStatus;
  notes: string | null;
  created_at: string;
}

export const INTL_SCREENS = {
  "rl360": "RL360",
  "omnilife": "Omnilife",
  "friends-provident": "Friends Provident",
  "expacare": "Expacare",
  "claims": "Claims",
} as const;

export type IntlScreenSlug = keyof typeof INTL_SCREENS;

export interface IntlPolicy {
  id: string;
  screen: IntlScreenSlug;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  start_date: string | null;
  end_date: string | null;
  policy_index: number;
  created_at: string;
  // RL360-specific fields
  salutation: string | null;
  marital_status: string | null;
  nationality: string | null;
  residence_country: string | null;
  policy_number: string | null;
  plan_type: string | null;
  plan_basis: string | null;
  currency_of_plan: string | null;
  premium: string | null;
  passport_expiry_date: string | null;
  escalated_premium: string | null;
  frequency: string | null;
  vanishing_premium: string | null;
  benefits: string | null;
  escalated_benefits: string | null;
  fund_selection: string | null;
  plan_term: string | null;
  sra: string | null;
  mode_of_payment: string | null;
  agent: string | null;
  special_remarks: string | null;
  policy_status: string | null;
}

export const DOCUMENT_CATEGORIES = [
  "ALL",
  "APPLICATION",
  "BENEFICIARY-FORM",
  "CREDIT-CARD",
  "EDD",
  "ID-VORA",
  "ILLUSTRATION",
  "MISCELLANEOUS",
  "POLICY-DOCUMENTS",
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export interface IntlPermission {
  screen: IntlScreenSlug;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}
