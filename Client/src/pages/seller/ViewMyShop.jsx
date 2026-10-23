import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ViewMyShop.css";

const API_URL = "http://localhost:5000/api/products";
const SHOP_API_URL = "http://localhost:5000/api/shop/me";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  image: "",
  stock: "0",
  discountPercentage: "0",
};

const emptyShopProfile = {
  shopName: "",
  shopDescription: "",
  shopImage: "",
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
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

  // Shop profile state
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load shop profile.");
    }

    const profile = {
      shopName: data.shop?.shopName || "",
      shopDescription: data.shop?.shopDescription || "",
      shopImage: data.shop?.shopImage || "",
    };

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

  function openAddForm() {
    setEditingProduct(null);
    setForm(emptyForm);
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
      category: product.category || "",
      image: product.image || "",
      stock: String(product.stock ?? 0),
      discountPercentage: String(product.discountPercentage ?? 0),
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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
      image: form.image.trim(),
      stock: Number(form.stock),
      discountPercentage: Number(form.discountPercentage || 0),
    };

    if (
      !payload.name ||
      !payload.description ||
      !payload.category ||
      !payload.image
    ) {
      setError("Please complete all required fields.");
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
      const url = isEditing
        ? `${API_URL}/${editingProduct._id}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

    if (!name || name.length > 100) {
      setShopError("Shop name must contain 1–100 characters.");
      return;
    }

    if (description.length > 1000) {
      setShopError("Description cannot exceed 1000 characters.");
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save shop profile.");
      }

      const savedProfile = {
        shopName: data.shop?.shopName || "",
        shopDescription: data.shop?.shopDescription || "",
        shopImage: data.shop?.shopImage || "",
      };

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

  function formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
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
              {filteredProducts.map((product) => (
                <article className="shop-product-card" key={product._id}>
                  <div className="shop-product-image-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="shop-product-image"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    {product.discountPercentage > 0 && (
                      <span className="shop-discount-badge">
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </div>

                  <div className="shop-product-content">
                    <span className="shop-product-category">
                      {product.category}
                    </span>
                    <h3 title={product.name}>{product.name}</h3>
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
              ))}
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
                Image URL *
                <input
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/product.jpg"
                  required
                />
              </label>

              {form.image && (
                <div className="shop-image-preview">
                  <img
                    src={form.image}
                    alt="Product preview"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <span>Image preview</span>
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
