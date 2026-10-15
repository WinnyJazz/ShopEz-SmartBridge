
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

const categories = [
  {
    name: "Audio",
    description: "Headphones & speakers",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
    color: "#E9EFFB",
  },
  {
    name: "Smartphones",
    description: "Phones & accessories",
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=500&q=80",
    color: "#E8EDF6",
  },
  {
    name: "Wearables",
    description: "Smartwatches & fitness",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&q=80",
    color: "#E8F0F8",
  },
  {
    name: "Accessories",
    description: "Everyday essentials",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&q=80",
    color: "#EEF0F6",
  },
  {
    name: "Gaming",
    description: "Level up your setup",
    image:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80",
    color: "#E9EBF5",
  },
];

const products = [
  {
    id: 1,
    name: "Nova X Wireless Headphones",
    category: "Audio",
    price: 129,
    originalPrice: 159,
    rating: 4.8,
    reviews: "2.1k",
    badge: "BEST SELLER",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 2,
    name: "AeroPhone 15 Pro",
    category: "Smartphones",
    price: 799,
    originalPrice: 999,
    rating: 4.7,
    reviews: "1.4k",
    badge: "20% OFF",
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 3,
    name: "EZ Watch Series 4",
    category: "Wearables",
    price: 249,
    originalPrice: 299,
    rating: 4.9,
    reviews: "3.2k",
    badge: "NEW",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 4,
    name: "Pulse Buds Pro",
    category: "Accessories",
    price: 89,
    originalPrice: 105,
    rating: 4.6,
    reviews: "1.8k",
    badge: "15% OFF",
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=85",
  },
];

function formatPrice(price) {
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const currentBanner = banners[activeSlide];

  const changeSlide = (direction) => {
    setActiveSlide((current) =>
      (current + direction + banners.length) % banners.length
    );
  };

  const toggleWishlist = (productId) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((product) => product.category === activeCategory);

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

            <p className="hero-description">
              {currentBanner.description}
            </p>

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
              className={`hero-dot ${
                index === activeSlide ? "active" : ""
              }`}
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

          <a href="/catalogue" className="section-link">
            View All <ArrowRight size={17} />
          </a>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`category-card ${
                activeCategory === category.name ? "selected" : ""
              }`}
              style={{ "--category-bg": category.color }}
              onClick={() =>
                setActiveCategory((current) =>
                  current === category.name ? "All" : category.name
                )
              }
            >
              <div className="category-copy">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="category-arrow">
                  <ArrowRight size={17} />
                </span>
              </div>

              <img src={category.image} alt={category.name} />
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
              {activeCategory === "All"
                ? "Picked for You"
                : activeCategory}
            </h2>
          </div>

          <a href="/catalogue" className="section-link">
            View All <ArrowRight size={17} />
          </a>
        </div>

        {activeCategory !== "All" && (
          <button
            className="clear-filter"
            onClick={() => setActiveCategory("All")}
          >
            <ArrowLeft size={14} /> Show all products
          </button>
        )}

        <div className="product-grid">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            const discount = Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            );

            return (
              <article className="product-card" key={product.id}>
                <div className="product-image-wrap">
                  <span
                    className={`product-badge ${
                      product.badge === "BEST SELLER"
                        ? "badge-best"
                        : product.badge === "NEW"
                        ? "badge-new"
                        : "badge-sale"
                    }`}
                  >
                    {product.badge}
                  </span>

                  <button
                    className={`wishlist-button ${
                      isWishlisted ? "wishlisted" : ""
                    }`}
                    onClick={() => toggleWishlist(product.id)}
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

                  <a
                    href={`/product/${product.id}`}
                    className="product-image-link"
                    aria-label={`View ${product.name}`}
                  >
                    <img src={product.image} alt={product.name} />
                  </a>
                </div>

                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <a
                    href={`/product/${product.id}`}
                    className="product-name"
                  >
                    {product.name}
                  </a>

                  <div className="product-rating">
                    <span className="rating-stars">
                      <Star size={13} fill="currentColor" />
                    </span>
                    <span>{product.rating}</span>
                    <span className="rating-reviews">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="product-pricing">
                    <span className="product-price">
                      {formatPrice(product.price)}
                    </span>
                    <span className="product-original-price">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="product-discount">{discount}% OFF</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <p className="empty-products">No products found in this category.</p>
        )}

        <div className="products-bottom">
          <a href="/catalogue" className="outline-button">
            Explore All Products <ArrowRight size={17} />
          </a>
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
        <a href="/catalogue" className="promo-button">
          Start Exploring <ArrowRight size={17} />
        </a>
      </section>
    </main>
  );
}
