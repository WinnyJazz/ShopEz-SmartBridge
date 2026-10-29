
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
  MessageSquare,
  MapPin,
  Store,
} from "lucide-react";
import {
  API_BASE,
  PRODUCTS_API,
  formatPrice,
  normalizeProduct,
  resolveImage,
} from "../utils/productHelpers";
import "./ProductDetails.css";

function formatReviewDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ReviewStars({ rating, size = 16 }) {
  return (
    <span className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? "currentColor" : "none"}
          className={star <= rating ? "review-star-filled" : "review-star-empty"}
        />
      ))}
    </span>
  );
}

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  // Product reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const token = localStorage.getItem("token");

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

        if (!cancelled) {
          setProduct(normalizeProduct(data.product));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load product.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Load reviews for this product
  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewError("");

      try {
        const response = await fetch(`${API_BASE}/api/reviews/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load reviews.");
        }

        if (!cancelled) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        }
      } catch (err) {
        if (!cancelled) {
          setReviewError(err.message || "Unable to load reviews.");
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmitReview(event) {
    event.preventDefault();
    setReviewError("");
    setReviewNotice("");

    if (!token) {
      setReviewError("Please log in before submitting a review.");
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setReviewError("Please select a rating from 1 to 5 stars.");
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch(`${API_BASE}/api/reviews/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: selectedRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit your review.");
      }

      // Reload reviews after a successful submission
      const reviewsResponse = await fetch(`${API_BASE}/api/reviews/${id}`);
      const reviewsData = await reviewsResponse.json();

      if (reviewsResponse.ok) {
        setReviews(
          Array.isArray(reviewsData.reviews) ? reviewsData.reviews : []
        );
      }

      setReviewNotice("Your review has been submitted successfully!");
      setSelectedRating(0);
      setHoverRating(0);
      setReviewComment("");

      // Refresh product rating data too
      const productResponse = await fetch(`${PRODUCTS_API}/${id}`);
      const productData = await productResponse.json();

      if (productResponse.ok && productData.product) {
        setProduct(normalizeProduct(productData.product));
      }
    } catch (err) {
      setReviewError(err.message || "Unable to submit your review.");
    } finally {
      setSubmittingReview(false);
    }
  }

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

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviews.length
      : Number(product.rating || 0);

  const reviewCount =
    reviews.length > 0 ? reviews.length : Number(product.reviews || 0);

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
              type="button"
              className={`details-wishlist ${isWishlisted ? "active" : ""}`}
              onClick={() => setIsWishlisted(!isWishlisted)}
              aria-label="Toggle wishlist"
            >
              <Heart
                size={21}
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>

            {product.gallery[selectedImage] && (
              <img src={product.gallery[selectedImage]} alt={product.name} />
            )}
          </div>

          {product.gallery.length > 1 && (
            <div className="details-thumbnails">
              {product.gallery.map((image, index) => (
                <button
                  type="button"
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

          <div className="details-price-row">
            <span className="details-price">{formatPrice(product.price)}</span>
            {product.discount > 0 && (
              <>
                <span className="details-original-price">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="details-discount">
                  {product.discount}% OFF
                </span>
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
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || !product.inStock}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
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
              type="button"
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

      {product.sellerId && (
        <section className="details-shop-section" aria-label="Shop information">
          <Link
            to={`/shop/${product.sellerId}`}
            className="details-seller-card"
            aria-label={`Visit ${product.shopName || "shop"}`}
          >
            <span className="details-seller-avatar">
              {product.sellerShopImage ? (
                <img src={resolveImage(product.sellerShopImage)} alt="" />
              ) : (
                <Store size={20} />
              )}
            </span>
            <span className="details-seller-info">
              <small>SHOP</small>
              <strong>
                {product.shopName || product.sellerName || "ShopEZ Seller"}
              </strong>
              {product.location && (
                <small className="details-seller-location">
                  <MapPin size={12} />
                  {product.location}
                </small>
              )}
            </span>
            <ChevronRight size={18} className="details-seller-arrow" />
          </Link>
        </section>
      )}

      <div className="details-rating">
        <span className="details-star">
          <Star size={15} fill="currentColor" />
        </span>
        <strong>{reviewCount > 0 ? averageRating.toFixed(1) : "New"}</strong>
        <span>
          ({reviewCount.toLocaleString()}{" "}
          {reviewCount === 1 ? "review" : "reviews"})
        </span>
        {reviewCount > 0 && (
          <>
            <span className="rating-divider">|</span>
            <span className="verified-rating">
              <Check size={13} /> Customer ratings
            </span>
          </>
        )}
      </div>

      {/* CUSTOMER REVIEWS */}
      <section className="details-reviews-section" id="reviews">
        <div className="reviews-heading">
          <div>
            <p className="details-section-eyebrow">CUSTOMER FEEDBACK</p>
            <h2>Ratings & Reviews</h2>
            <p className="reviews-subtitle">
              See what customers think about this product.
            </p>
          </div>

          <div className="reviews-summary">
            <Star size={23} fill="currentColor" />
            <strong>
              {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
            </strong>
            <span>
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>

        {reviewError && (
          <div className="review-alert review-alert-error" role="alert">
            {reviewError}
          </div>
        )}

        {reviewNotice && (
          <div className="review-alert review-alert-success" role="status">
            <Check size={17} />
            {reviewNotice}
          </div>
        )}

        <div className="reviews-content">
          <div className="reviews-list">
            {reviewsLoading ? (
              <div className="reviews-empty">
                <LoaderCircle size={24} className="shop-spinner" />
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="reviews-empty">
                <MessageSquare size={28} />
                <h3>Be the first to leave a review</h3>
                <p>This product doesn't have any reviews yet.</p>
              </div>
            ) : (
              reviews.map((review) => {
                const buyerName =
                  review.buyer?.name || review.buyer?.username || "ShopEZ buyer";

                return (
                  <article
                    className="review-card"
                    key={review._id}
                  >
                    <div className="review-card-top">
                      <div className="review-buyer">
                        <div className="review-avatar">
                          {buyerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{buyerName}</strong>
                          <span>{formatReviewDate(review.createdAt)}</span>
                        </div>
                      </div>

                      <ReviewStars rating={Number(review.rating) || 0} />
                    </div>

                    {review.comment ? (
                      <p className="review-comment">{review.comment}</p>
                    ) : (
                      <p className="review-comment review-no-comment">
                        Rating submitted without a comment.
                      </p>
                    )}
                  </article>
                );
              })
            )}
          </div>

          <aside className="review-form-card">
            <p className="details-section-eyebrow">YOUR EXPERIENCE</p>
            <h3>Write a review</h3>
            <p className="review-form-description">
              Share your experience to help other shoppers.
            </p>

            {!token ? (
              <div className="review-login-prompt">
                <p>Please log in to submit a product review.</p>
                <Link
                  to="/login"
                  state={{ from: `/product/${id}` }}
                  className="details-primary-button"
                >
                  Log in to review
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="review-form">
                <label>How would you rate this product?</label>

                <div className="review-rating-picker" role="group" aria-label="Select rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={
                        star <= (hoverRating || selectedRating)
                          ? "rating-picker-star active"
                          : "rating-picker-star"
                      }
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onFocus={() => setHoverRating(star)}
                      onBlur={() => setHoverRating(0)}
                      aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                      aria-pressed={selectedRating === star}
                    >
                      <Star
                        size={29}
                        fill={
                          star <= (hoverRating || selectedRating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  ))}
                </div>

                <p className="rating-picker-hint">
                  {selectedRating === 0
                    ? "Select a star rating"
                    : `${selectedRating} out of 5 stars selected`}
                </p>

                <label htmlFor="review-comment">Comment (optional)</label>
                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="What did you like or dislike?"
                  maxLength={1000}
                  rows={5}
                />
                <span className="review-character-count">
                  {reviewComment.length}/1000
                </span>

                <button
                  type="submit"
                  className="review-submit-button"
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <>
                      <LoaderCircle size={17} className="shop-spinner" />
                      Submitting...
                    </>
                  ) : (
                    "Submit review"
                  )}
                </button>

                <p className="review-eligibility-note">
                  Reviews are subject to purchase eligibility checks.
                </p>
              </form>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
