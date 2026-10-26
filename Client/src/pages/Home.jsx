import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
} from "lucide-react";
import useProducts from "../hooks/useProducts";
import useFavorites from "../hooks/useFavorites";
import { PRODUCT_CATEGORIES } from "../constants/productCategories";
import { formatPrice } from "../utils/productHelpers";
import "./Home.css";

const banners = [
  {
    eyebrow: "TECH FOR A SMARTER YOU",
    title: "UPGRADE YOUR",
    highlight: "EVERYDAY.",
    description:
      "Discover the latest tech essentials for a more connected, inspired lifestyle.",
    button: "Explore Collection",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1100&q=85",
    label: "New Arrivals",
  },
  {
    eyebrow: "YOUR NEXT FAVORITE TECH",
    title: "LESS PRICE.",
    highlight: "MORE POWER.",
    description:
      "Discover selected essentials and enjoy special prices on your favorites.",
    button: "Explore Deals",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1100&q=85",
    label: "Exclusive Deals",
  },
  {
    eyebrow: "MADE FOR YOUR LIFESTYLE",
    title: "FIND YOUR",
    highlight: "NEXT FAVORITE.",
    description:
      "Thoughtfully selected gadgets to make every day a little better.",
    button: "Shop Best Sellers",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1100&q=85",
    label: "Best Sellers",
  },
];

const MAX_HOME_PRODUCTS = 8;

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");

  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();

  const currentBanner = banners[activeSlide];

  const changeSlide = (direction) => {
    setActiveSlide(
      (current) => (current + direction + banners.length) % banners.length
    );
  };

  const handleToggleFavorite = async (productId) => {
    const ok = await toggleFavorite(productId);
    if (!ok) navigate("/login"); // belum login
  };

  const filteredProducts = (
    activeCategory === "All"
      ? products
      : products.filter(
          (product) =>
            product.category.toLowerCase() === activeCategory.toLowerCase()
        )
  ).slice(0, MAX_HOME_PRODUCTS);

  return (
    <main className="home-page">
      {/* HERO SLIDER */}
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-copy" key={activeSlide}>
            <p className="hero-eyebrow">
              <span className="eyebrow-dot" />
              {currentBanner.eyebrow}
            </p>

            <h1>
              {currentBanner.title}
              <span>{currentBanner.highlight}</span>
            </h1>

            <p className="hero-description">{currentBanner.description}</p>

            <a className="hero-button" href="#picked-for-you">
              {currentBanner.button}
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="hero-image-wrap" key={`image-${activeSlide}`}>
            <img
              className="hero-image"
              src={currentBanner.image}
              alt={currentBanner.label}
            />
            <div className="hero-image-label">
              <span className="hero-label-dot" />
              {currentBanner.label}
            </div>
          </div>
        </div>

        <button
          className="hero-arrow hero-arrow-left"
          onClick={() => changeSlide(-1)}
          aria-label="Previous banner"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          className="hero-arrow hero-arrow-right"
          onClick={() => changeSlide(1)}
          aria-label="Next banner"
        >
          <ChevronRight size={22} />
        </button>

        <div className="hero-pagination">
          <span className="hero-slide-count">
            {String(activeSlide + 1).padStart(2, "0")} /{" "}
            {String(banners.length).padStart(2, "0")}
          </span>

          {banners.map((banner, index) => (
            <button
              key={banner.label}
              className={`hero-dot ${index === activeSlide ? "active" : ""}`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="home-section category-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">FIND YOUR FAVORITES</p>
            <h2>Shop by Category</h2>
          </div>

          <Link to="/catalogue" className="section-link">
            View All <ArrowRight size={17} />
          </Link>
        </div>

        <div className="category-grid">
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category.value}
              className={`category-card ${
                activeCategory === category.value ? "selected" : ""
              }`}
              style={{ "--category-bg": category.color }}
              title={`${category.description}: ${category.examples}`}
              onClick={() =>
                setActiveCategory((current) =>
                  current === category.value ? "All" : category.value
                )
              }
            >
              <div className="category-copy">
                <h3>{category.label}</h3>
                <p>{category.description}</p>
                <span className="category-arrow">
                  <ArrowRight size={17} />
                </span>
              </div>

              <img src={category.image} alt={category.label} />
            </button>
          ))}
        </div>
      </section>

      {/* PICKED FOR YOU */}
      <section className="home-section products-section" id="picked-for-you">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">CURATED FOR YOU</p>
            <h2>
              {activeCategory === "All" ? "Picked for You" : activeCategory}
            </h2>
          </div>

          <Link to="/catalogue" className="section-link">
            View All <ArrowRight size={17} />
          </Link>
        </div>

        {activeCategory !== "All" && (
          <button
            className="clear-filter"
            onClick={() => setActiveCategory("All")}
          >
            <ArrowLeft size={14} /> Show all products
          </button>
        )}

        {loading && <p className="empty-products">Loading products...</p>}

        {!loading && error && <p className="empty-products">{error}</p>}

        {!loading && !error && (
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const isWishlisted = isFavorite(product.id);
              const badge = product.isNew
                ? "NEW"
                : product.discount > 0
                ? `${product.discount}% OFF`
                : "";

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-image-wrap">
                    {badge && (
                      <span
                        className={`product-badge ${
                          product.isNew ? "badge-new" : "badge-sale"
                        }`}
                      >
                        {badge}
                      </span>
                    )}

                    <button
                      className={`wishlist-button ${
                        isWishlisted ? "wishlisted" : ""
                      }`}
                      onClick={() => handleToggleFavorite(product.id)}
                      aria-label={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                    >
                      <Heart
                        size={19}
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </button>

                    <Link
                      to={`/product/${product.id}`}
                      className="product-image-link"
                      aria-label={`View ${product.name}`}
                    >
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <PackageSearch size={40} strokeWidth={1.2} />
                      )}
                    </Link>
                  </div>

                  <div className="product-info">
                    <p className="product-category">{product.category}</p>
                    <Link
                      to={`/product/${product.id}`}
                      className="product-name"
                    >
                      {product.name}
                    </Link>

                    {product.rating !== null && (
                      <div className="product-rating">
                        <span className="rating-stars">
                          <Star size={13} fill="currentColor" />
                        </span>
                        <span>{product.rating}</span>
                        <span className="rating-reviews">
                          ({product.reviews})
                        </span>
                      </div>
                    )}

                    <div className="product-pricing">
                      <span className="product-price">
                        {formatPrice(product.price)}
                      </span>
                      {product.discount > 0 && (
                        <>
                          <span className="product-original-price">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="product-discount">
                            {product.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="empty-products">
            {products.length === 0
              ? "No products have been listed yet."
              : "No products found in this category."}
          </p>
        )}

        <div className="products-bottom">
          <Link to="/catalogue" className="outline-button">
            Explore All Products <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* PROMO STRIP */}
      <section className="home-promo">
        <div className="promo-icon">
          <Star size={23} />
        </div>
        <div>
          <p className="promo-eyebrow">THE SHOP EZ EXPERIENCE</p>
          <h2>Good tech. Better everyday.</h2>
          <p>Discover essentials that fit your lifestyle.</p>
        </div>
        <Link to="/catalogue" className="promo-button">
          Start Exploring <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}