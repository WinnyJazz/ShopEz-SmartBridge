export const API_BASE = "http://localhost:5000";
export const PRODUCTS_API = `${API_BASE}/api/products`;
export const FAVORITES_API = `${API_BASE}/api/favorites`;

// Kalau path gambar relatif (/uploads/xxx.jpg), tambahin host server
export function resolveImage(src) {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  return `${API_BASE}${src.startsWith("/") ? "" : "/"}${src}`;
}

export const formatPrice = (price) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price || 0);

// Ubah data dari MongoDB jadi bentuk yang dipakai UI
export function normalizeProduct(p) {
  const rawImages =
    Array.isArray(p.images) && p.images.length
      ? p.images
      : p.image
      ? [p.image]
      : [];

  const gallery = rawImages.map(resolveImage);
  const discount = Number(p.discountPercentage) || 0;
  const originalPrice = Number(p.price) || 0;
  const price = Math.round(originalPrice * (1 - discount / 100));
  const stock = Number(p.stock) || 0;

  const createdAt = p.createdAt ? new Date(p.createdAt).getTime() : 0;
  const isNew = createdAt > 0 && Date.now() - createdAt < 7 * 24 * 60 * 60 * 1000;

  // seller bisa berupa object (hasil populate) atau cuma id string
  const seller = p.seller && typeof p.seller === "object" ? p.seller : {};

  // Rating baru dianggap ada kalau sudah ada review
  const reviews = Number(p.numReviews) || 0;
  const rating = reviews > 0 ? Number(p.rating) || 0 : null;

  return {
    id: p._id,
    name: p.name || "",
    description: p.description || "",
    category: Array.isArray(p.category)
      ? p.category[0] || "Others"
      : p.category || "Others",
    price,
    originalPrice,
    discount,
    stock,
    shippingEstimateDays: Number(p.shippingEstimateDays) || 3,
    inStock: stock > 0,
    isNew,
    createdAt,
    image: gallery[0] || "",
    gallery,
    sellerName: seller.name || "",
    sellerProfileImage: seller.profileImage || "",
    sellerShopImage: seller.shopImage || seller.profileImage || "",
    shopName: seller.shopName || "",
    location: seller.shopLocation || p.location || "",
    rating,
    reviews,
    // belum ada di backend, jadi null / kosong dulu
    storeRating: p.storeRating ?? null,
    paymentMethods: p.paymentMethods || [],
    shippingOptions: p.shippingOptions || [],
    sellerId: seller._id || (typeof p.seller === "string" ? p.seller : ""),
  };
}