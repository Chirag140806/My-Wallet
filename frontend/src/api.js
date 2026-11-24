// One helper for every request to the Django API. Adds the login token automatically.
function readError(data) {
  if (!data || typeof data !== "object") return "Something went wrong. Please try again.";
  const parts = Object.entries(data).flatMap(([k, v]) => {
    const msg = Array.isArray(v) ? v.join(" ") : String(v);
    return k === "detail" || k === "non_field_errors" ? msg : `${k}: ${msg}`;
  });
  return parts.join(" ");
}

export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  let res;
  try {
    res = await fetch("/api" + path, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Token ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the Django backend running?");
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) window.dispatchEvent(new Event("unauthorized"));
  if (!res.ok) throw new Error(readError(data));
  return data;
}
