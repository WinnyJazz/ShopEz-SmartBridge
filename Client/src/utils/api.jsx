const API_URL = "http://localhost:5000";

export function getToken() {
  return localStorage.getItem("token");
}

function decodePayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// Sisa waktu token dalam ms (<= 0 berarti sudah expired / invalid)
export function getTokenRemainingMs(token) {
  const payload = decodePayload(token);
  if (!payload || !payload.exp) return 0;
  return payload.exp * 1000 - Date.now();
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("authChanged"));
}

function handleSessionExpired() {
  window.dispatchEvent(new Event("sessionExpired"));
}

// Pakai ini untuk semua request yang butuh login (BUKAN untuk /login & /register)
export async function apiFetch(path, options = {}) {
  const token = getToken();

  if (token && getTokenRemainingMs(token) <= 0) {
    handleSessionExpired();
    throw new Error("Session expired. Please log in again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 401 && token) {
    handleSessionExpired();
    throw new Error("Session expired. Please log in again.");
  }

  return response;
}