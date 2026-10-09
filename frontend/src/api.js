const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listSupplies: () => request("/supplies"),
  getSupply: (id) => request(`/supplies/${id}`),
  createSupply: (data) => request("/supplies", { method: "POST", body: JSON.stringify(data) }),
  updateSupply: (id, data) =>
    request(`/supplies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSupply: (id) => request(`/supplies/${id}`, { method: "DELETE" }),
  listMovements: (id) => request(`/supplies/${id}/movements`),
  createMovement: (id, data) =>
    request(`/supplies/${id}/movements`, { method: "POST", body: JSON.stringify(data) }),
  listRequests: (status) => request(status ? `/requests?status=${status}` : "/requests"),
  syncRequests: () => request("/requests/sync", { method: "POST" }),
  deliverRequest: (id) => request(`/requests/${id}/deliver`, { method: "POST" }),
  rejectRequest: (id) => request(`/requests/${id}/reject`, { method: "POST" }),
};
