
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  Star,
  X,
  PackageSearch,
  ArrowRight,
} from "lucide-react";

import FilterSidebar from "../components/FilterSidebar";
import "./Catalogue.css";

const products = [
  {
    id: 1,
    name: "Nova X Wireless Headphones",
    category: "Electronics",
    subcategory: "Audio",
    price: 129,
    originalPrice: 159,
    rating: 4.8,
    storeRating: 4.9,
    reviews: 2100,
    location: "Jakarta",
    paymentMethods: ["bank_transfer", "e_wallet", "card", "cod"],
    shippingOptions: ["regular", "express", "free_shipping"],
    inStock: true,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 2,
    name: "AeroPhone 15 Pro",
    category: "Electronics",
    subcategory: "Smartphones",
    price: 799,
    originalPrice: 999,
    rating: 4.7,
    storeRating: 4.8,
    reviews: 1400,
    location: "Tangerang",
    paymentMethods: ["bank_transfer", "e_wallet", "card"],
    shippingOptions: ["regular", "express"],
    inStock: true,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 3,
    name: "EZ Watch Series 4",
    category: "Electronics",
    subcategory: "Wearables",
    price: 249,
    originalPrice: 299,
    rating: 4.9,
    storeRating: 4.9,
    reviews: 3200,
    location: "Bandung",
    paymentMethods: ["bank_transfer", "e_wallet", "card", "cod"],
    shippingOptions: ["regular", "express", "same_day"],
    inStock: true,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 4,
    name: "Pulse Buds Pro",
    category: "Accessories",
    subcategory: "Audio",
    price: 89,
    originalPrice: 105,
    rating: 4.6,
    storeRating: 4.7,
    reviews: 1800,
    location: "Surabaya",
    paymentMethods: ["bank_transfer", "e_wallet", "cod"],
    shippingOptions: ["regular", "free_shipping"],
    inStock: true,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 5,
    name: "Studio Wireless Headphones",
    category: "Electronics",
    subcategory: "Audio",
    price: 179,
    originalPrice: 179,
    rating: 4.5,
    storeRating: 4.6,
    reviews: 860,
    location: "Yogyakarta",
    paymentMethods: ["bank_transfer", "card", "cod"],
    shippingOptions: ["regular", "express"],
    inStock: true,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 6,
    name: "Minimal Everyday Backpack",
    category: "Accessories",
    subcategory: "Bags",
    price: 69,
    originalPrice: 89,
    rating: 4.6,
    storeRating: 4.8,
    reviews: 540,
    location: "Medan",
    paymentMethods: ["bank_transfer", "e_wallet", "cod"],
    shippingOptions: ["regular", "free_shipping"],
    inStock: true,
    isNew: false,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 7,
    name: "Smart Home Speaker",
    category: "Home & Living",
    subcategory: "Smart Home",
    price: 99,
    originalPrice: 129,
    rating: 4.4,
    storeRating: 4.5,
    reviews: 420,
    location: "Jakarta",
    paymentMethods: ["bank_transfer", "e_wallet", "card"],
    shippingOptions: ["regular", "express"],
    inStock: false,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 8,
    name: "Performance Sports Watch",
    category: "Sports",
    subcategory: "Wearables",
    price: 199,
    originalPrice: 249,
    rating: 4.7,
    storeRating: 4.7,
    reviews: 710,
    location: "Tangerang",
    paymentMethods: ["bank_transfer", "e_wallet", "card", "cod"],
    shippingOptions: ["regular", "express", "same_day"],
    inStock: true,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=700&q=85",
  },
];

const defaultFilters = {
  minPrice: "",
  maxPrice: "",
  productRating: 0,
  storeRating: 0,
  locations: [],
  paymentMethods: [],
  shippingOptions: [],
  categories: [],
  onSale: false,
  inStock: false,
};

const formatPrice = (price) =>
  `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function ProductCard({ product, wishlist, onToggleWishlist }) {
  const isWishlisted = wishlist.includes(product.id);
  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <article className="catalogue-product-card">
      <div className="catalogue-product-image">
        {product.isNew ? (
          <span className="catalogue-product-badge new">NEW</span>
        ) : discount > 0 ? (
          <span className="catalogue-product-badge sale">
            {discount}% OFF
          </span>
        ) : null}

        <button
          className={`catalogue-wishlist ${
            isWishlisted ? "active" : ""
          }`}
          onClick={() => onToggleWishlist(product.id)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={18}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        <Link
          to={`/product/${product.id}`}
          className="catalogue-product-image-link"
        >
          <img src={product.image} alt={product.name} />
        </Link>
      </div>

      <div className="catalogue-product-info">
        <p className="catalogue-product-category">
          {product.category} · {product.subcategory}
        </p>

        <Link
          to={`/product/${product.id}`}
          className="catalogue-product-name"
        >
          {product.name}
        </Link>

        <div className="catalogue-product-rating">
          <Star size={13} fill="currentColor" />
          <strong>{product.rating}</strong>
          <span>({product.reviews.toLocaleString()})</span>
        </div>

        <div className="catalogue-product-price">
          <strong>{formatPrice(product.price)}</strong>
          {discount > 0 && (
            <>
              <span className="catalogue-old-price">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="catalogue-discount">{discount}% OFF</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Catalogue() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = (id) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.subcategory.toLowerCase().includes(query);

      const minPrice =
        filters.minPrice === "" ? 0 : Number(filters.minPrice);
      const maxPrice =
        filters.maxPrice === "" ? Infinity : Number(filters.maxPrice);

      const matchesPrice =
        product.price >= minPrice && product.price <= maxPrice;

      const matchesProductRating =
        !filters.productRating ||
        product.rating >= Number(filters.productRating);

      const matchesStoreRating =
        !filters.storeRating ||
        product.storeRating >= Number(filters.storeRating);

      const matchesLocation =
        !filters.locations?.length ||
        filters.locations.includes(product.location);

      const matchesPayment =
        !filters.paymentMethods?.length ||
        filters.paymentMethods.some((method) =>
          product.paymentMethods.includes(method)
        );

      const matchesShipping =
        !filters.shippingOptions?.length ||
        filters.shippingOptions.some((option) =>
          product.shippingOptions.includes(option)
        );

      const matchesCategory =
        !filters.categories?.length ||
        filters.categories.includes(product.category);

      const matchesSale =
        !filters.onSale || product.originalPrice > product.price;

      const matchesStock = !filters.inStock || product.inStock;

      return (
        matchesSearch &&
        matchesPrice &&
        matchesProductRating &&
        matchesStoreRating &&
        matchesLocation &&
        matchesPayment &&
        matchesShipping &&
        matchesCategory &&
        matchesSale &&
        matchesStock
      );
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "newest") {
      result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }

    return result;
  }, [filters, search, sortBy]);

  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearch("");
    setSortBy("featured");
  };

  const activeFilterCount = [
    filters.minPrice !== "" || filters.maxPrice !== "",
    Boolean(filters.productRating),
    Boolean(filters.storeRating),
    filters.locations?.length > 0,
    filters.paymentMethods?.length > 0,
    filters.shippingOptions?.length > 0,
    filters.categories?.length > 0,
    filters.onSale,
    filters.inStock,
  ].filter(Boolean).length;

  return (
    <main className="catalogue-page">
      <section className="catalogue-hero">
        <div>
          <p className="catalogue-eyebrow">THE SHOP EZ COLLECTION</p>
          <h1>Find your next favorite<span>.</span></h1>
          <p>
            Explore thoughtfully selected tech and everyday essentials,
            all in one place.
          </p>
        </div>

        <div className="catalogue-hero-art">
          <PackageSearch size={78} strokeWidth={1} />
        </div>
      </section>

      <nav className="catalogue-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Catalogue</span>
      </nav>

      <section className="catalogue-heading">
        <div>
          <p className="catalogue-eyebrow">EXPLORE THE COLLECTION</p>
          <h2>All Products</h2>
          <p className="catalogue-subtitle">
            Discover products selected for your everyday.
          </p>
        </div>

        <span className="catalogue-total">
          {filteredProducts.length} products
        </span>
      </section>

      <div className="catalogue-toolbar">
        <label className="catalogue-search">
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, categories..."
            aria-label="Search products"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </label>

        <div className="catalogue-toolbar-actions">
          <button
            className="catalogue-filter-button"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal size={17} />
            Filters
            {activeFilterCount > 0 && (
              <span className="catalogue-filter-count">
                {activeFilterCount}
              </span>
            )}
          </button>

          <label className="catalogue-sort">
            <ArrowUpDown size={15} />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="catalogue-active-filters">
          <span>{activeFilterCount} filter groups applied</span>
          <button onClick={resetFilters}>Clear all</button>
        </div>
      )}

      <section className="catalogue-results">
        {filteredProducts.length > 0 ? (
          <div className="catalogue-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="catalogue-empty">
            <PackageSearch size={42} strokeWidth={1.3} />
            <h3>No products found</h3>
            <p>
              Try changing your search or adjusting your filters.
            </p>
            <button onClick={resetFilters}>Reset Filters</button>
          </div>
        )}
      </section>

      <section className="catalogue-bottom-banner">
        <div>
          <p className="catalogue-eyebrow">A BETTER EVERYDAY STARTS HERE</p>
          <h2>Good tech. Better everyday.</h2>
          <p>Discover something that fits your lifestyle.</p>
        </div>
        <Link to="/" className="catalogue-back-home">
          Back to Home <ArrowRight size={17} />
        </Link>
      </section>

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={filters}
        onApply={(newFilters) => {
          setFilters({ ...defaultFilters, ...newFilters });
          setIsFilterOpen(false);
        }}
      />
    </main>
  );
}
