import { useEffect, useState } from "react";
import { PRODUCTS_API, normalizeProduct } from "../utils/productHelpers";

// limit = jumlah produk yang diambil (produk terbaru dulu). Kosongin kalau mau semua.
export default function useProducts(limit) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(PRODUCTS_API);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load products.");
        }

        const list = (data.products || []).map(normalizeProduct);

        if (!cancelled) setProducts(limit ? list.slice(0, limit) : list);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { products, loading, error };
}