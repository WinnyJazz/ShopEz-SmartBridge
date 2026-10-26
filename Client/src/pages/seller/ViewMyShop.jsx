import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShopPaymentSettings from "../../components/ShopPaymentSettings";
import { PRODUCT_CATEGORIES } from "../../constants/productCategories";
import {
  Store,
  Star,
  Package,
  Boxes,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ImagePlus,
  LoaderCircle,
  Camera,
  MapPin,
  Eye,
} from "lucide-react";

import { API_BASE, formatPrice, resolveImage } from "../../utils/productHelpers";
import "./ViewMyShop.css";

const API_URL = `${API_BASE}/api/products`;
const SHOP_API_URL = `${API_BASE}/api/shop/me`;

const MAX_IMAGES = 8;

const CITY_SUGGESTIONS = [
  "Jakarta",
  "Tangerang",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Medan",
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: [],
  stock: "0",
  discountPercentage: "0",
};

const emptyShopProfile = {
  shopName: "",
  shopDescription: "",
  shopImage: "",
  shopLocation: "",
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

function toShopProfile(shop) {
  return {
    shopName: shop?.shopName || "",
    shopDescription: shop?.shopDescription || "",
    shopImage: shop?.shopImage || "",
    shopLocation: shop?.shopLocation || "",
  };
}

function ViewMyShop() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Gambar produk
  const [selectedProductImages, setSelectedProductImages] = useState([]); // File baru
  const [productImagePreviews, setProductImagePreviews] = useState([]); // gabungan lama + baru
  const [removedImages, setRemovedImages] = useState([]); // path gambar lama yang dihapus

  // Shop profile
  const [shopProfile, setShopProfile] = useState(emptyShopProfile);
  const [showShopEditor, setShowShopEditor] = useState(false);
  const [shopDraft, setShopDraft] = useState(emptyShopProfile);
  const [savingShop, setSavingShop] = useState(false);
  const [shopError, setShopError] = useState("");
  const [shopMessage, setShopMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  async function loadProducts() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products.");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function loadShopProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const response = await fetch(SHOP_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load shop profile.");
    }

    const profile = toShopProfile(data.shop);
    setShopProfile(profile);
    setShopDraft(profile);
  }

  useEffect(() => {
    loadProducts();

    loadShopProfile().catch((err) => {
      setShopError(err.message || "Failed to load shop profile.");
    });
    // Load the products and shop profile when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const outOfStock = products.filter((product) => product.stock === 0).length;

  function resetImageState() {
    setSelectedProductImages([]);
    setProductImagePreviews([]);
    setRemovedImages([]);
  }

  function openAddForm() {
    setEditingProduct(null);
    setForm(emptyForm);
    resetImageState();
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: Array.isArray(product.category)
        ? product.category
        : product.category
          ? [product.category]
          : [],
      stock: String(product.stock ?? 0),
      discountPercentage: String(product.discountPercentage ?? 0),
    });

    const currentImages =
      Array.isArray(product.images) && product.images.length
        ? product.images
        : product.image
        ? [product.image]
        : [];

    setSelectedProductImages([]);
    setRemovedImages([]);
    setProductImagePreviews(
      currentImages.map((raw) => ({
        url: resolveImage(raw),
        raw,
        existing: true,
      }))
    );
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    resetImageState();
    setError("");
  }

  function handleProductImageChange(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError("Please select JPG, PNG, or WebP images only.");
        event.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`Each product image must be 5 MB or smaller: ${file.name}`);
        event.target.value = "";
        return;
      }
    }

    if (productImagePreviews.length + files.length > MAX_IMAGES) {
      setError(`You can add a maximum of ${MAX_IMAGES} images per product.`);
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedProductImages((previous) => [...previous, ...files]);
    setProductImagePreviews((previous) => [
      ...previous,
      ...files.map((file) => ({
        url: URL.createObjectURL(file),
        existing: false,
        fileName: file.name,
      })),
    ]);
    event.target.value = "";
  }

  // Hapus gambar dari preview: gambar lama dicatat untuk dihapus di server,
  // gambar baru cukup dibuang dari daftar upload.
  function removeProductImage(previewIndex) {
    const preview = productImagePreviews[previewIndex];
    if (!preview) return;

    if (preview.existing) {
      setRemovedImages((previous) => [...previous, preview.raw]);
    } else {
      const selectedIndex = productImagePreviews
        .slice(0, previewIndex)
        .filter((item) => !item.existing).length;

      setSelectedProductImages((previous) =>
        previous.filter((_, index) => index !== selectedIndex)
      );
    }

    setProductImagePreviews((previous) =>
      previous.filter((_, index) => index !== previewIndex)
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function toggleCategory(category) {
    setForm((previous) => {
      const currentCategories = Array.isArray(previous.category)
        ? previous.category
        : previous.category
          ? [previous.category]
          : [];

      const nextCategories = currentCategories.includes(category)
        ? currentCategories.filter((item) => item !== category)
        : [...currentCategories, category];

      return {
        ...previous,
        category: nextCategories,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      stock: Number(form.stock),
      discountPercentage: Number(form.discountPercentage || 0),
    };

    if (!payload.name || !payload.description || !payload.category) {
      setError("Please complete all required fields.");
      return;
    }

    if (productImagePreviews.length === 0) {
      setError("Please keep or upload at least one product image.");
      return;
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      setError("Stock must be a whole number of 0 or more.");
      return;
    }

    if (
      !Number.isFinite(payload.discountPercentage) ||
      payload.discountPercentage < 0 ||
      payload.discountPercentage > 100
    ) {
      setError("Discount must be between 0 and 100.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isEditing = Boolean(editingProduct);
      const url = isEditing ? `${API_URL}/${editingProduct._id}` : API_URL;

      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("description", payload.description);
      formData.append("price", String(payload.price));
      formData.append("category", payload.category);
      formData.append("stock", String(payload.stock));
      formData.append("discountPercentage", String(payload.discountPercentage));

      if (isEditing && removedImages.length > 0) {
        formData.append("removeImages", JSON.stringify(removedImages));
      }

      selectedProductImages.forEach((file) => formData.append("images", file));

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save product.");
      }

      setSuccess(
        isEditing
          ? "Product updated successfully."
          : "Product added successfully."
      );
      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);
      resetImageState();

      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/${product._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product.");
      }

      setProducts((previous) =>
        previous.filter((item) => item._id !== product._id)
      );
      setSuccess("Product deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  }

  function openShopEditor() {
    setShopDraft({ ...shopProfile });
    setSelectedImage(null);
    setImagePreview(shopProfile.shopImage || "");
    setShopError("");
    setShopMessage("");
    setShowShopEditor(true);
  }

  function closeShopEditor() {
    if (savingShop) return;
    setShowShopEditor(false);
    setShopDraft({ ...shopProfile });
    setSelectedImage(null);
    setImagePreview("");
    setShopError("");
  }

  function handleShopImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setShopError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 500 * 1024) {
      setShopError("Image must be 500 KB or smaller.");
      event.target.value = "";
      return;
    }

    setShopError("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSaveShopProfile(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const name = shopDraft.shopName.trim();
    const description = shopDraft.shopDescription.trim();
    const location = (shopDraft.shopLocation || "").trim();

    if (!name || name.length > 100) {
      setShopError("Shop name must contain 1–100 characters.");
      return;
    }

    if (description.length > 1000) {
      setShopError("Description cannot exceed 1000 characters.");
      return;
    }

    if (location.length > 100) {
      setShopError("Location cannot exceed 100 characters.");
      return;
    }

    setSavingShop(true);
    setShopError("");
    setShopMessage("");

    try {
      let shopImage = shopDraft.shopImage || "";

      if (selectedImage) {
        shopImage = await fileToBase64(selectedImage);
      }

      const response = await fetch(SHOP_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName: name,
          shopDescription: description,
          shopImage,
          shopLocation: location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save shop profile.");
      }

      const savedProfile = toShopProfile(data.shop);

      setShopProfile(savedProfile);
      setShopDraft(savedProfile);
      setSelectedImage(null);
      setImagePreview("");
      setShowShopEditor(false);
      setShopMessage("Shop profile updated successfully.");
    } catch (err) {
      setShopError(err.message || "Unable to save shop profile.");
    } finally {
      setSavingShop(false);
    }
  }

  return (
    <main className="my-shop-page">
      <div className="my-shop-container">
        <section className="shop-profile-card">
          <div className="shop-profile-main">
            <div className="shop-avatar-wrapper">
              <div className="shop-avatar shop-avatar-picture">
                {shopProfile.shopImage ? (
                  <img
                    src={shopProfile.shopImage}
                    alt="Shop profile"
                    className="shop-profile-image"
                  />
                ) : (
                  <Store size={32} />
                )}
              </div>

              <button
                type="button"
                className="shop-camera-button"
                title="Edit shop profile"
                aria-label="Edit shop profile"
                onClick={openShopEditor}
              >
                <Camera size={15} />
              </button>
            </div>

            <div className="shop-profile-info">
              <span className="shop-eyebrow">SELLER CENTER</span>
              <h1>{shopProfile.shopName || "My Shop"}</h1>

              <p className="shop-location-line">
                <MapPin size={14} />
                {shopProfile.shopLocation || "Location not set"}
              </p>

              <p>
                {shopProfile.shopDescription ||
                  "Add a description to introduce your shop."}
              </p>

              <span className="shop-status">
                <span className="status-dot" />
                Your shop
              </span>
            </div>
          </div>

          <div className="shop-header-actions">
            <button
              type="button"
              className="shop-edit-button"
              onClick={openShopEditor}
            >
              <Pencil size={16} />
              Edit Shop Profile
            </button>

            <button
              type="button"
              className="shop-add-button"
              onClick={openAddForm}
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </section>

        {shopMessage && (
          <div className="shop-alert shop-alert-success">{shopMessage}</div>
        )}

        {shopError && !showShopEditor && (
          <div className="shop-alert shop-alert-error">{shopError}</div>
        )}

        <section className="shop-stats-grid">
          <div className="shop-stat-card">
            <div className="shop-stat-icon">
              <Package size={21} />
            </div>
            <div>
              <p>Total Products</p>
              <h2>{loading ? "—" : products.length}</h2>
            </div>
          </div>

          <div className="shop-stat-card">
            <div className="shop-stat-icon">
              <Boxes size={21} />
            </div>
            <div>
              <p>Out of Stock</p>
              <h2>{loading ? "—" : outOfStock}</h2>
            </div>
          </div>

          <div className="shop-stat-card">
            <div className="shop-stat-icon rating-icon">
              <Star size={21} />
            </div>
            <div>
              <p>Shop Rating</p>
              <h2>—</h2>
              <span className="shop-stat-note">No ratings yet</span>
            </div>
          </div>
        </section>
        <ShopPaymentSettings />
        <section className="shop-products-section">
          <div className="shop-products-heading">
            <div>
              <span className="shop-eyebrow">YOUR INVENTORY</span>
              <h2>My Products</h2>
              <p>Manage your listings, prices, and stock.</p>
            </div>
            <span className="shop-product-count">
              {products.length} products
            </span>
          </div>

          <div className="shop-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search your products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {error && !showForm && (
            <div className="shop-alert shop-alert-error">
              {error}
              <button type="button" onClick={loadProducts}>
                Try again
              </button>
            </div>
          )}

          {success && (
            <div className="shop-alert shop-alert-success">{success}</div>
          )}

          {loading ? (
            <div className="shop-loading">
              <LoaderCircle className="shop-spinner" size={28} />
              <p>Loading your products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="shop-empty">
              <div className="shop-empty-icon">
                <ImagePlus size={30} />
              </div>
              <h3>{search ? "No matching products" : "Your shop is waiting"}</h3>
              <p>
                {search
                  ? "Try a different product name or category."
                  : "Add your first product to start building your shop."}
              </p>
              {!search && (
                <button
                  type="button"
                  className="shop-add-button"
                  onClick={openAddForm}
                >
                  <Plus size={18} />
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className="shop-product-grid">
              {filteredProducts.map((product) => {
                const cover =
                  (Array.isArray(product.images) && product.images[0]) ||
                  product.image;
                const imageCount =
                  Array.isArray(product.images) && product.images.length
                    ? product.images.length
                    : cover
                    ? 1
                    : 0;

                return (
                  <article className="shop-product-card" key={product._id}>
                    <Link
                      to={`/product/${product._id}`}
                      className="shop-product-image-wrap shop-product-link"
                      aria-label={`View ${product.name}`}
                    >
                      {cover ? (
                        <img
                          src={resolveImage(cover)}
                          alt={product.name}
                          className="shop-product-image"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <ImagePlus size={30} />
                      )}

                      {product.discountPercentage > 0 && (
                        <span className="shop-discount-badge">
                          -{product.discountPercentage}%
                        </span>
                      )}

                      {imageCount > 1 && (
                        <span className="shop-image-count">
                          {imageCount} photos
                        </span>
                      )}
                    </Link>

                    <div className="shop-product-content">
                      <span className="shop-product-category">
                        {product.category}
                      </span>

                      <h3 title={product.name}>
                        <Link
                          to={`/product/${product._id}`}
                          className="shop-product-name-link"
                        >
                          {product.name}
                        </Link>
                      </h3>

                      <p className="shop-product-price">
                        {formatPrice(product.price)}
                      </p>

                      <div className="shop-product-meta">
                        <span
                          className={
                            product.stock === 0
                              ? "stock-label stock-empty"
                              : "stock-label"
                          }
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : `Stock: ${product.stock}`}
                        </span>
                      </div>

                      <div className="shop-product-actions">
                        <Link
                          to={`/product/${product._id}`}
                          className="shop-view-button"
                          aria-label={`Preview ${product.name}`}
                          title="Preview as buyer"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          type="button"
                          className="shop-edit-button"
                          onClick={() => openEditForm(product)}
                        >
                          <Pencil size={15} />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="shop-delete-button"
                          onClick={() => handleDelete(product)}
                          aria-label={`Delete ${product.name}`}
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Edit Shop Profile Modal */}
      {showShopEditor && (
        <div
          className="shop-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeShopEditor();
          }}
        >
          <section
            className="shop-product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-profile-title"
          >
            <div className="shop-modal-header">
              <div>
                <span className="shop-eyebrow">SHOP SETTINGS</span>
                <h2 id="shop-profile-title">Edit Shop Profile</h2>
              </div>
              <button
                type="button"
                className="shop-modal-close"
                onClick={closeShopEditor}
                disabled={savingShop}
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            {shopError && (
              <div className="shop-alert shop-alert-error">{shopError}</div>
            )}

            <form
              className="shop-product-form"
              onSubmit={handleSaveShopProfile}
            >
              <div className="shop-photo-editor">
                <div className="shop-avatar shop-avatar-picture shop-avatar-large">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Shop profile preview"
                      className="shop-profile-image"
                    />
                  ) : (
                    <Store size={32} />
                  )}
                </div>

                <label className="shop-photo-upload">
                  <Camera size={16} />
                  Change Shop Photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={handleShopImageChange}
                  />
                </label>
                <span className="shop-stat-note">
                  JPG, PNG, or WebP · Maximum 500 KB
                </span>
              </div>

              <label>
                Shop Name *
                <input
                  value={shopDraft.shopName}
                  onChange={(event) =>
                    setShopDraft((previous) => ({
                      ...previous,
                      shopName: event.target.value,
                    }))
                  }
                  maxLength={100}
                  required
                  placeholder="Enter your shop name"
                />
              </label>

              <label>
                Shop Location (City)
                <input
                  list="shop-city-options"
                  value={shopDraft.shopLocation || ""}
                  onChange={(event) =>
                    setShopDraft((previous) => ({
                      ...previous,
                      shopLocation: event.target.value,
                    }))
                  }
                  maxLength={100}
                  placeholder="e.g. Jakarta"
                />
                <datalist id="shop-city-options">
                  {CITY_SUGGESTIONS.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </label>

              <label>
                Shop Description
                <textarea
                  value={shopDraft.shopDescription}
                  onChange={(event) =>
                    setShopDraft((previous) => ({
                      ...previous,
                      shopDescription: event.target.value,
                    }))
                  }
                  maxLength={1000}
                  rows={4}
                  placeholder="Tell customers about your shop..."
                />
              </label>

              <div className="shop-form-actions">
                <button
                  type="button"
                  className="shop-cancel-button"
                  onClick={closeShopEditor}
                  disabled={savingShop}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="shop-add-button"
                  disabled={savingShop}
                >
                  {savingShop ? (
                    <>
                      <LoaderCircle className="shop-spinner" size={18} />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div
          className="shop-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            className="shop-product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-form-title"
          >
            <div className="shop-modal-header">
              <div>
                <span className="shop-eyebrow">PRODUCT MANAGEMENT</span>
                <h2 id="shop-form-title">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
              </div>
              <button
                type="button"
                className="shop-modal-close"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            {error && (
              <div className="shop-alert shop-alert-error">{error}</div>
            )}

            <form className="shop-product-form" onSubmit={handleSubmit}>
              <label>
                Product Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Headphones"
                  maxLength={150}
                  required
                />
              </label>

              <div className="shop-form-row">
                <label>
                  Price (IDR) *
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="299000"
                    required
                  />
                </label>
                <label>
                  Stock *
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="shop-form-row">
                <label>
                  Category *
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Electronics"
                    required
                  />
                </label>
                <label>
                  Discount (%)
                  <input
                    name="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={form.discountPercentage}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <label>
                Product Images *
                <input
                  name="images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleProductImageChange}
                />
                <span className="shop-stat-note">
                  {productImagePreviews.length}/{MAX_IMAGES} images · JPG, PNG,
                  or WebP · Maximum 5 MB each · The first image is the cover
                </span>
              </label>

              {productImagePreviews.length > 0 && (
                <div className="shop-product-image-previews">
                  {productImagePreviews.map((preview, index) => (
                    <div
                      className="shop-product-image-preview-item"
                      key={`${preview.url}-${index}`}
                    >
                      <img
                        src={preview.url}
                        alt={`Product preview ${index + 1}`}
                      />
                      <span>
                        {index === 0
                          ? "Cover"
                          : preview.existing
                          ? `Image ${index + 1}`
                          : preview.fileName || `New image ${index + 1}`}
                      </span>
                      <button
                        type="button"
                        className="shop-remove-preview"
                        onClick={() => removeProductImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                        disabled={saving}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label>
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  maxLength={5000}
                  rows={4}
                  required
                />
              </label>

              <div className="shop-form-actions">
                <button
                  type="button"
                  className="shop-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="shop-add-button"
                  disabled={saving}
                >
                  {saving ? (
                    <LoaderCircle className="shop-spinner" size={18} />
                  ) : (
                    <Plus size={18} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default ViewMyShop;