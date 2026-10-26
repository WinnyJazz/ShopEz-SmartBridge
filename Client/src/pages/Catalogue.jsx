import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  Star,
  X,
  PackageSearch,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

import FilterSidebar from "../components/FilterSidebar";
import useFavorites from "../hooks/useFavorites";
import {
  PRODUCTS_API,
  formatPrice,
  normalizeProduct,
} from "../utils/productHelpers";
import "./Catalogue.css";

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

function ProductCard({ product, isWishlisted, onToggleWishlist }) {
  return (
    <article className="catalogue-product-card">
      <div className="catalogue-product-image">
        {product.isNew ? (
          <span className="catalogue-product-badge new">NEW</span>
        ) : product.discount > 0 ? (
          <span className="catalogue-product-badge sale">
            {product.discount}% OFF
          </span>
        ) : null}

        <button
          className={`catalogue-wishlist ${isWishlisted ? "active" : ""}`}
          onClick={() => onToggleWishlist(product.id)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        <Link
          to={`/product/${product.id}`}
          className="catalogue-product-image-link"
        >
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <PackageSearch size={40} strokeWidth={1.2} />
          )}
        </Link>
      </div>

      <div className="catalogue-product-info">
        <p className="catalogue-product-category">{product.category}</p>

        <Link
          to={`/product/${product.id}`}
          className="catalogue-product-name"
        >
          {product.name}
        </Link>

        {product.rating !== null && (
          <div className="catalogue-product-rating">
            <Star size={13} fill="currentColor" />
            <strong>{product.rating}</strong>
            <span>({product.reviews.toLocaleString()})</span>
          </div>
        )}

        <div className="catalogue-product-price">
          <strong>{formatPrice(product.price)}</strong>
          {product.discount > 0 && (
            <>
              <span className="catalogue-old-price">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="catalogue-discount">{product.discount}% OFF</span>
            </>
          )}
        </div>

        {!product.inStock && (
          <p className="catalogue-product-category">Out of stock</p>
        )}
      </div>
    </article>
  );
}

export default function Catalogue() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(PRODUCTS_API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load products.");
      }

      setProducts((data.products || []).map(normalizeProduct));
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleWishlist = async (id) => {
    const ok = await toggleFavorite(id);
    if (!ok) navigate("/login"); // belum login
  };

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const minPrice =
        filters.minPrice === "" ? 0 : Number(filters.minPrice);
      const maxPrice =
        filters.maxPrice === "" ? Infinity : Number(filters.maxPrice);

      const matchesPrice =
        product.price >= minPrice && product.price <= maxPrice;

      // Filter di bawah ini cuma dipakai kalau datanya memang ada di produk
      const matchesProductRating =
        !filters.productRating ||
        product.rating === null ||
        product.rating >= Number(filters.productRating);

      const matchesStoreRating =
        !filters.storeRating ||
        product.storeRating === null ||
        product.storeRating >= Number(filters.storeRating);

      const matchesLocation =
        !filters.locations?.length ||
        !product.location ||
        filters.locations.includes(product.location);

      const matchesPayment =
        !filters.paymentMethods?.length ||
        !product.paymentMethods.length ||
        filters.paymentMethods.some((method) =>
          product.paymentMethods.includes(method)
        );

      const matchesShipping =
        !filters.shippingOptions?.length ||
        !product.shippingOptions.length ||
        filters.shippingOptions.some((option) =>
          product.shippingOptions.includes(option)
        );

      const matchesCategory =
        !filters.categories?.length ||
        filters.categories.some(
          (category) =>
            category.toLowerCase() === product.category.toLowerCase()
        );

      const matchesSale = !filters.onSale || product.discount > 0;
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
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [products, filters, search, sortBy]);

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
          {loading ? "—" : filteredProducts.length} products
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
        {loading ? (
          <div className="catalogue-empty">
            <LoaderCircle size={34} className="shop-spinner" />
            <h3>Loading products...</h3>
          </div>
        ) : error ? (
          <div className="catalogue-empty">
            <PackageSearch size={42} strokeWidth={1.3} />
            <h3>Couldn't load products</h3>
            <p>{error}</p>
            <button onClick={loadProducts}>Try again</button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="catalogue-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={isFavorite(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="catalogue-empty">
            <PackageSearch size={42} strokeWidth={1.3} />
            <h3>No products found</h3>
            <p>
              {products.length === 0
                ? "No products have been listed yet."
                : "Try changing your search or adjusting your filters."}
            </p>
            {products.length > 0 && (
              <button onClick={resetFilters}>Reset Filters</button>
            )}
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