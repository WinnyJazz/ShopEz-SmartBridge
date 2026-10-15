
import { useState } from "react";
import { SlidersHorizontal, Heart, ShoppingBag } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FilterSidebar from "./components/FilterSidebar";
import "./App.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Everyday Sneakers",
    brand: "Nike",
    price: 89.99,
    rating: 4.5,
    delivery: "standard",
    category: "Fashion",
  },
  {
    id: 2,
    name: "Classic Sports Watch",
    brand: "Apple",
    price: 249.99,
    rating: 4.8,
    delivery: "pickup",
    category: "Electronics",
  },
  {
    id: 3,
    name: "Essential Cotton Shirt",
    brand: "Uniqlo",
    price: 29.99,
    rating: 4.2,
    delivery: "standard",
    category: "Fashion",
  },
  {
    id: 4,
    name: "Wireless Headphones",
    brand: "Samsung",
    price: 119.99,
    rating: 4.6,
    delivery: "standard",
    category: "Electronics",
  },
  {
    id: 5,
    name: "Everyday Running Shoes",
    brand: "Adidas",
    price: 75.5,
    rating: 3.9,
    delivery: "pickup",
    category: "Fashion",
  },
  {
    id: 6,
    name: "Portable Smart Device",
    brand: "Xiaomi",
    price: 59.99,
    rating: 4.1,
    delivery: "standard",
    category: "Electronics",
  },
];

const EMPTY_FILTERS = {
  minPrice: "",
  maxPrice: "",
  rating: 0,
  brands: [],
  delivery: "",
};

function App() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesMin =
      filters.minPrice === "" || product.price >= Number(filters.minPrice);

    const matchesMax =
      filters.maxPrice === "" || product.price <= Number(filters.maxPrice);

    const matchesRating =
      Number(filters.rating) === 0 || product.rating >= Number(filters.rating);

    const matchesBrand =
      filters.brands.length === 0 || filters.brands.includes(product.brand);

    const matchesDelivery =
      !filters.delivery || product.delivery === filters.delivery;

    return (
      matchesMin &&
      matchesMax &&
      matchesRating &&
      matchesBrand &&
      matchesDelivery
    );
  });

  const activeFilterCount =
    Number(filters.minPrice !== "") +
    Number(filters.maxPrice !== "") +
    Number(filters.rating > 0) +
    filters.brands.length +
    Number(filters.delivery !== "");

  return (
    <>
      <Navbar />

      <main className="catalogue">
        <div className="catalogue-heading">
          <div>
            <h1>All Products</h1>
            <p>Discover products you'll love.</p>
          </div>

          <button
            type="button"
            className="catalogue-filter-button"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Open product filters"
          >
            <SlidersHorizontal size={18} />
            Filter
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </button>
        </div>

        <div className="catalogue-results">
          {filteredProducts.length} products
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image-placeholder">
                  <span>{product.category}</span>
                  <button
                    type="button"
                    className="product-favorite"
                    aria-label={`Add ${product.name} to favorites`}
                  >
                    <Heart size={19} />
                  </button>
                </div>

                <div className="product-information">
                  <span className="product-brand">{product.brand}</span>
                  <h2>{product.name}</h2>

                  <div className="product-meta">
                    <span className="product-rating">
                      ★ {product.rating.toFixed(1)}
                    </span>
                    <span className="product-delivery">
                      {product.delivery === "pickup"
                        ? "Pick Up"
                        : "Standard Delivery"}
                    </span>
                  </div>

                  <div className="product-card-bottom">
                    <span className="product-price">
                      ${product.price.toFixed(2)}
                    </span>

                    <button
                      type="button"
                      className="product-cart-button"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingBag size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="catalogue-empty">
            <h2>No products found</h2>
            <p>Try changing your filters to see more products.</p>
            <button
              type="button"
              onClick={() => setFilters({ ...EMPTY_FILTERS, brands: [] })}
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      <Footer />

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={filters}
        onApply={setFilters}
      />
    </>
  );
}

export default App;
