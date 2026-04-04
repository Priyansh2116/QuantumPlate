/**
 * Client-side auth helpers — browser only
 */

const WORKER_ID_KEY = "gg_worker_id";
const WORKER_NAME_KEY = "gg_worker_name";
const TOKEN_KEY = "gg_token";

export function saveSession(workerId: string, name: string, token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WORKER_ID_KEY, workerId);
  localStorage.setItem(WORKER_NAME_KEY, name);
  localStorage.setItem(TOKEN_KEY, token);
}

export function getSession(): { workerId: string; name: string; token: string } | null {
  if (typeof window === "undefined") return null;
  const workerId = localStorage.getItem(WORKER_ID_KEY);
  const name = localStorage.getItem(WORKER_NAME_KEY) || "";
  const token = localStorage.getItem(TOKEN_KEY);
  if (!workerId || !token) return null;
  return { workerId, name, token };
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WORKER_ID_KEY);
  localStorage.removeItem(WORKER_NAME_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/** Auth headers for API calls */
export function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Fallback demo worker ID for seeded data when not logged in
export const DEMO_WORKER_ID = "worker_rajan";
