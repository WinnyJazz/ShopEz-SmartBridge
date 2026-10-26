
import { useCallback, useEffect, useState } from "react";
import { normalizeProduct } from "../utils/productHelpers";

import {
  getToken,
  fetchFavorites,
  fetchFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../utils/favoritesApi";


export default function useFavorites({ withProducts = false } = {}) {
  const [products, setProducts] = useState([]);
  const [ids, setIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(getToken());

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        if (withProducts) {
          const data = await fetchFavorites();
          if (cancelled) return;

          const list = (data.favorites || []).map(normalizeProduct);
          setProducts(list);
          setIds(list.map((product) => String(product.id)));
        } else {
          const data = await fetchFavoriteIds();
          if (cancelled) return;

          setIds(data.ids || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load favorites.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [withProducts, isLoggedIn]);

  const isFavorite = useCallback(
    (productId) => ids.includes(String(productId)),
    [ids]
  );

  // Return false kalau user belum login, supaya komponen bisa redirect ke /login
  const toggleFavorite = useCallback(
    async (productId) => {
      if (!getToken()) return false;

      const id = String(productId);
      const wasFavorite = ids.includes(id);
      const prevIds = ids;
      const prevProducts = products;

      // Optimistic update
      setIds((current) =>
        wasFavorite ? current.filter((x) => x !== id) : [...current, id]
      );

      if (wasFavorite) {
        setProducts((current) =>
          current.filter((product) => String(product.id) !== id)
        );
      }

      try {
        if (wasFavorite) await removeFavorite(id);
        else await addFavorite(id);
      } catch (err) {
        // Rollback kalau request gagal
        setIds(prevIds);
        setProducts(prevProducts);
        setError(err.message || "Failed to update favorites.");
      }

      return true;
    },
    [ids, products]
  );

  return {
    products,
    ids,
    loading,
    error,
    isLoggedIn,
    isFavorite,
    toggleFavorite,
  };
}