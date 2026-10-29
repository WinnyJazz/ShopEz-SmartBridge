import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import { addToCart } from "../utils/cart";
import {
  API_BASE,
  formatPrice,
  normalizeProduct,
  resolveImage,
} from "../utils/productHelpers";
import "./PublicShop.css";

export default function PublicShop() {
  const { sellerId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedProductId, setAddedProductId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadShop() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE}/api/shop/${sellerId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this shop.");
        }

        if (!cancelled) {
          setShop(data.shop || null);
          setProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Unable to connect to the server.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadShop();
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const categories = Array.isArray(product.category)
        ? product.category.join(" ")
        : product.category || "";
      return `${product.name} ${categories}`.toLowerCase().includes(query);
    });
  }, [products, search]);

  function handleAddToCart(product) {
    addToCart(normalizeProduct(product));
    setAddedProductId(String(product._id));
    window.setTimeout(() => setAddedProductId(""), 1800);
  }

  const shopImage = shop?.profileImage || shop?.shopImage;

  return (
    <main className="public-shop-page">
      <div className="public-shop-container">
        <Link to="/catalogue" className="public-shop-back">
          <ArrowLeft size={16} />
          Back to catalogue
        </Link>

        {loading ? (
          <div className="public-shop-state" role="status">
            <LoaderCircle size={28} className="public-shop-spinner" />
            <p>Loading shop...</p>
          </div>
        ) : error ? (
          <div className="public-shop-state public-shop-error" role="alert">
            <Store size={28} />
            <h1>Shop unavailable</h1>
            <p>{error}</p>
            <Link to="/catalogue" className="public-shop-button">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <section className="public-shop-profile">
              <div className="public-shop-avatar">
                {shopImage ? (
                  <img src={resolveImage(shopImage)} alt="" />
                ) : (
                  <Store size={30} />
                )}
              </div>
              <div className="public-shop-profile-info">
                <span className="public-shop-eyebrow">SHOP PROFILE</span>
                <h1>{shop?.name || shop?.shopName || "ShopEZ Seller"}</h1>
                {shop?.shopLocation && (
                  <span className="public-shop-location">
                    <MapPin size={15} />
                    {shop.shopLocation}
                  </span>
                )}
                <p>
                  {shop?.shopDescription ||
                    "Explore products from this ShopEZ seller."}
                </p>
                <span className="public-shop-status">
                  <span />
                  Seller on ShopEZ
                </span>
              </div>
              <div className="public-shop-product-total">
                <Package size={18} />
                <strong>{products.length}</strong>
                <span>{products.length === 1 ? "product" : "products"}</span>
              </div>
            </section>

            <section className="public-shop-products">
              <div className="public-shop-products-heading">
                <div>
                  <span className="public-shop-eyebrow">FROM THIS SHOP</span>
                  <h2>Shop Products</h2>
                  <p>Browse the seller's available products and add them to your cart.</p>
                </div>
                <label className="public-shop-search">
                  <Search size={17} />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products"
                    aria-label="Search shop products"
                  />
                </label>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="public-shop-empty">
                  <Package size={28} />
                  <h3>{search ? "No matching products" : "No products yet"}</h3>
                  <p>
                    {search
                      ? "Try another product name or category."
                      : "This shop has not listed any available products yet."}
                  </p>
                </div>
              ) : (
                <div className="public-shop-grid">
                  {filteredProducts.map((product) => {
                    const category = Array.isArray(product.category)
                      ? product.category[0]
                      : product.category;
                    const image =
                      product.images?.[0] || product.image || "";
                    const discount = Number(product.discountPercentage) || 0;
                    const price =
                      Number(product.price) * (1 - discount / 100);
                    const wasAdded = addedProductId === String(product._id);

                    return (
                      <article
                        className="public-shop-product-card"
                        key={product._id}
                      >
                        <Link
                          to={`/product/${product._id}`}
                          className="public-shop-product-image"
                          aria-label={`View ${product.name}`}
                        >
                          {image ? (
                            <img src={resolveImage(image)} alt={product.name} />
                          ) : (
                            <Package size={32} />
                          )}
                          {discount > 0 && (
                            <span className="public-shop-discount">
                              -{discount}%
                            </span>
                          )}
                        </Link>
                        <div className="public-shop-product-info">
                          <span className="public-shop-category">
                            {category || "Product"}
                          </span>
                          <h3>
                            <Link to={`/product/${product._id}`}>
                              {product.name}
                            </Link>
                          </h3>
                          <div className="public-shop-rating">
                            <Star size={14} fill="currentColor" />
                            <strong>
                              {Number(product.numReviews) > 0
                                ? Number(product.rating).toFixed(1)
                                : "New"}
                            </strong>
                            <span>
                              {Number(product.numReviews) > 0
                                ? `(${product.numReviews})`
                                : "No reviews"}
                            </span>
                          </div>
                          <div className="public-shop-prices">
                            <strong>{formatPrice(price)}</strong>
                            {discount > 0 && (
                              <span>{formatPrice(product.price)}</span>
                            )}
                          </div>
                          <div className="public-shop-product-footer">
                            <span
                              className={
                                product.stock > 0
                                  ? "public-shop-stock"
                                  : "public-shop-stock is-empty"
                              }
                            >
                              {product.stock > 0
                                ? `${product.stock} in stock`
                                : "Out of stock"}
                            </span>
                            <button
                              type="button"
                              className="public-shop-add-button"
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.stock}
                              aria-label={`Add ${product.name} to cart`}
                            >
                              {wasAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                              <span>{wasAdded ? "Added" : "Add"}</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
