import { supabase } from "../supabase";
import { API_BASE_URL } from "./config";

export async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Could not read Supabase session: ${error.message}`);
  }

  const token = data.session?.access_token;

  if (!token) {
    throw new Error("No active Supabase access token");
  }

  return token;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return data as T;
}
