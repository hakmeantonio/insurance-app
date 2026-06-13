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
}

export interface IntlPermission {
  screen: IntlScreenSlug;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}
