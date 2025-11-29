const API_BASE = "http://localhost:5001";

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!data) {
    throw new Error("Invalid response");
  }
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  if (data.success === false) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export function post(path, body) {
  return request("POST", path, body);
}

export function get(path) {
  return request("GET", path);
}
