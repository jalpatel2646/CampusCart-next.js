/**
 * Thin client for the CampusCart REST API.
 * Every browser-side request goes through this module so error handling and
 * response unwrapping stay consistent.
 */

async function request(path, { method = "GET", body, signal, headers } = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(path, {
    method,
    signal,
    credentials: "same-origin",
    cache: method === "GET" ? "no-store" : undefined,
    headers: isFormData
      ? headers
      : body
        ? { "Content-Type": "application/json", ...headers }
        : headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || (payload && payload.success === false)) {
    const error = new Error(
      payload?.message || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.code = payload?.code;
    error.details = payload?.errors;
    throw error;
  }

  return payload?.data ?? null;
}

/* Auth */
export const signUp = (payload) =>
  request("/api/auth/signup", { method: "POST", body: payload });

export const signIn = (payload) =>
  request("/api/auth/login", { method: "POST", body: payload });

export const signOut = () => request("/api/auth/logout", { method: "POST" });

export const getCurrentUser = () => request("/api/auth/me");

/* Listings */
export const getListings = (params = {}) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) value.forEach((entry) => search.append(key, entry));
    else search.set(key, value);
  }
  const query = search.toString();
  return request(`/api/listings${query ? `?${query}` : ""}`);
};

export const getListing = (id) => request(`/api/listings/${id}`);

export const createListing = (payload) =>
  request("/api/listings", { method: "POST", body: payload });

export const updateListing = (id, payload) =>
  request(`/api/listings/${id}`, { method: "PUT", body: payload });

export const deleteListing = (id) =>
  request(`/api/listings/${id}`, { method: "DELETE" });

export const setListingStatus = (id, status) =>
  request(`/api/listings/${id}/status`, { method: "PATCH", body: { status } });

export const deactivateListing = (id) =>
  request(`/api/listings/${id}/deactivate`, { method: "PATCH" });

export const reactivateListing = (id) =>
  request(`/api/listings/${id}/reactivate`, { method: "PATCH" });

/* Enquiries */
export const createEnquiry = (payload) =>
  request("/api/enquiries", { method: "POST", body: payload });

export const getEnquiries = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return request(`/api/enquiries${search ? `?${search}` : ""}`);
};

export const updateEnquiryStatus = (id, { status, sellerResponse }) =>
  request(`/api/enquiries/${id}`, {
    method: "PATCH",
    body: { status, sellerResponse },
  });

/* Favourites */
export const getFavorites = () => request("/api/favorites");

export const getFavoriteStatus = (listing) =>
  request(`/api/favorites/${listing}`);

export const addFavorite = (listing) =>
  request("/api/favorites", { method: "POST", body: { listing } });

export const removeFavorite = (listing) =>
  request(`/api/favorites/${listing}`, { method: "DELETE" });

/* Notifications */
export const getNotifications = () => request("/api/notifications");

export const markNotificationSeen = (id) =>
  request(`/api/notifications/${id}/seen`, { method: "POST" });

export const markAllNotificationsSeen = () =>
  request("/api/notifications/seen", { method: "POST" });

export const getSentEnquiries = () => request("/api/enquiries?sent=true");

/* AI listing assist */
export const assistDescribe = (payload) =>
  request("/api/listings/assist", { method: "POST", body: { mode: "describe", ...payload } });

export const assistClassify = (payload) =>
  request("/api/listings/assist", { method: "POST", body: { mode: "classify", ...payload } });

/* Saved searches */
export const getSavedSearches = () => request("/api/saved-searches");

export const createSavedSearch = (payload) =>
  request("/api/saved-searches", { method: "POST", body: payload });

export const deleteSavedSearch = (id) =>
  request(`/api/saved-searches/${id}`, { method: "DELETE" });

export const markSavedSearchSeen = (id) =>
  request(`/api/saved-searches/${id}/seen`, { method: "POST" });

export const markAllSavedSearchesSeen = () =>
  request("/api/saved-searches/seen", { method: "POST" });

/* Dashboard */
export const getDashboard = () => request("/api/dashboard");

/* Uploads */
export function uploadImages(files) {
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  return request("/api/uploads", { method: "POST", body: formData });
}

/* Health */
export const checkHealth = () => request("/api/health");
