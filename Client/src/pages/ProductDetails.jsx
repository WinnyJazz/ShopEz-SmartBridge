import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { addToCart as addItemToCart } from "../utils/cart";

import {
  Heart,
  Star,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Check,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import {
  PRODUCTS_API,
  formatPrice,
  normalizeProduct,
} from "../utils/productHelpers";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setQuantity(1);
      setSelectedImage(0);
      setCartMessage("");

      try {
        const response = await fetch(`${PRODUCTS_API}/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Product not found.");
        }

        if (!cancelled) setProduct(normalizeProduct(data.product));
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="product-not-found">
        <LoaderCircle size={34} className="shop-spinner" />
        <p>Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-not-found">
        <div className="not-found-icon">
          <ShoppingBag size={34} />
        </div>
        <h1>Product not found.</h1>
        <p>{error || "This product may no longer be available."}</p>
        <Link to="/catalogue" className="details-primary-button">
          Explore Products
        </Link>
      </main>
    );
  }

  const addToCart = () => {
    addItemToCart(product, quantity);
    setCartMessage(`${product.name} added to your cart!`);
  };

  const badge = product.isNew
    ? "NEW"
    : product.discount > 0
    ? `${product.discount}% OFF`
    : "";

  return (
    <main className="product-details-page">
      <nav className="details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={14} />
        <Link to="/catalogue">Catalogue</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>

      <section className="product-details-layout">
        {/* PRODUCT GALLERY */}
        <div className="details-gallery">
          <div className="details-main-image">
            {badge && <span className="details-badge">{badge}</span>}

            <button
              className={`details-wishlist ${isWishlisted ? "active" : ""}`}
              onClick={() => setIsWishlisted(!isWishlisted)}
              aria-label="Toggle wishlist"
            >
              <Heart size={21} fill={isWishlisted ? "currentColor" : "none"} />
            </button>

            {product.gallery[selectedImage] && (
              <img src={product.gallery[selectedImage]} alt={product.name} />
            )}
          </div>

          {product.gallery.length > 1 && (
            <div className="details-thumbnails">
              {product.gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  className={`details-thumbnail ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="details-information">
          <p className="details-category">{product.category}</p>

          <h1>{product.name}</h1>

          {product.rating !== null && (
            <div className="details-rating">
              <span className="details-star">
                <Star size={15} fill="currentColor" />
              </span>
              <strong>{product.rating}</strong>
              <span>({product.reviews.toLocaleString()} reviews)</span>
              <span className="rating-divider">|</span>
              <span className="verified-rating">
                <Check size={13} /> Verified ratings
              </span>
            </div>
          )}

          <div className="details-price-row">
            <span className="details-price">{formatPrice(product.price)}</span>
            {product.discount > 0 && (
              <>
                <span className="details-original-price">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="details-discount">{product.discount}% OFF</span>
              </>
            )}
          </div>

          <div className="details-divider" />

          <p className="details-description">{product.description}</p>

          <div className="details-stock">
            <span className="stock-dot" />
            {product.inStock
              ? `${product.stock} items available`
              : "Out of stock"}
          </div>

          <div className="details-purchase">
            <div className="details-quantity">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || !product.inStock}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                disabled={quantity >= product.stock || !product.inStock}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              className="details-add-button"
              onClick={addToCart}
              disabled={!product.inStock}
            >
              <ShoppingBag size={18} />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          {cartMessage && (
            <div className="details-cart-message" role="status">
              <Check size={17} />
              <span>{cartMessage}</span>
              <Link to="/cart">View Cart</Link>
            </div>
          )}

          <div className="details-benefits">
            <div>
              <Truck size={20} />
              <div>
                <strong>Shipping Information</strong>
                <p>Shipping options shown at checkout.</p>
              </div>
            </div>

            <div>
              <ShieldCheck size={20} />
              <div>
                <strong>Secure Shopping</strong>
                <p>Your shopping experience matters to us.</p>
              </div>
            </div>

            <div>
              <RotateCcw size={20} />
              <div>
                <strong>Easy Returns</strong>
                <p>Return policy details can be added here.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="details-description-section">
        <p className="details-section-eyebrow">GET TO KNOW YOUR PRODUCT</p>
        <h2>Designed for your everyday.</h2>
        <p className="details-long-description">{product.description}</p>
      </section>
    </main>
  );
}