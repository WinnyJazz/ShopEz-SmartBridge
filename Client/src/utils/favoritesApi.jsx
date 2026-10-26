import { FAVORITES_API } from "./productHelpers";

export const getToken = () => localStorage.getItem("token");

async function request(path, options = {}) {
  const response = await fetch(`${FAVORITES_API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export const fetchFavorites = () => request("");
export const fetchFavoriteIds = () => request("/ids");

export const addFavorite = (productId) =>
  request(`/${productId}`, { method: "POST" });

export const removeFavorite = (productId) =>
  request(`/${productId}`, { method: "DELETE" });