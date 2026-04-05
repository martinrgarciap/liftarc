import { apiFetch } from "./client";

export type MeResponse = {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
};

export function fetchMe() {
  return apiFetch<MeResponse>("/api/me");
}
