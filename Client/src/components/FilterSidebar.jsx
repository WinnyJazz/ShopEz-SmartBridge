
import { useEffect, useState } from "react";
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Star,
  MapPin,
  CreditCard,
  Truck,
  Tag,
  PackageCheck,
} from "lucide-react";
import "./FilterSidebar.css";

export const DEFAULT_FILTERS = {
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

const LOCATIONS = [
  "Jakarta",
  "Tangerang",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Medan",
  "Semarang",
  "Other",
];

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "e_wallet", label: "E-Wallet" },
  { value: "card", label: "Debit / Credit Card" },
  { value: "cod", label: "Cash on Delivery (COD)" },
];

const SHIPPING_OPTIONS = [
  { value: "regular", label: "Regular Delivery" },
  { value: "express", label: "Express Delivery" },
  { value: "same_day", label: "Same-day Delivery" },
  { value: "free_shipping", label: "Free Shipping" },
];

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Sports",
  "Accessories",
];

function FilterSidebar({
  isOpen,
  onClose,
  initialFilters = DEFAULT_FILTERS,
  onApply,
}) {
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  }));

  useEffect(() => {
    if (!isOpen) return;

    setFilters({
      ...DEFAULT_FILTERS,
      ...initialFilters,
      locations: [...(initialFilters.locations || [])],
      paymentMethods: [...(initialFilters.paymentMethods || [])],
      shippingOptions: [...(initialFilters.shippingOptions || [])],
      categories: [...(initialFilters.categories || [])],
    });
  }, [isOpen, initialFilters]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleOption = (key, value) => {
    setFilters((current) => {
      const currentValues = current[key] || [];
      const exists = currentValues.includes(value);

      return {
        ...current,
        [key]: exists
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      ...DEFAULT_FILTERS,
      locations: [],
      paymentMethods: [],
      shippingOptions: [],
      categories: [],
    });
  };

  const applyFilters = () => {
    const min = filters.minPrice === "" ? "" : Number(filters.minPrice);
    const max = filters.maxPrice === "" ? "" : Number(filters.maxPrice);

    if (min !== "" && min < 0) {
      alert("Minimum price cannot be negative.");
      return;
    }

    if (max !== "" && max < 0) {
      alert("Maximum price cannot be negative.");
      return;
    }

    if (min !== "" && max !== "" && min > max) {
      alert("Minimum price cannot exceed maximum price.");
      return;
    }

    onApply({
      ...filters,
      minPrice: min,
      maxPrice: max,
      productRating: Number(filters.productRating),
      storeRating: Number(filters.storeRating),
      locations: [...filters.locations],
      paymentMethods: [...filters.paymentMethods],
      shippingOptions: [...filters.shippingOptions],
      categories: [...filters.categories],
    });

    onClose();
  };

  const activeFilterCount =
    Number(filters.minPrice !== "") +
    Number(filters.maxPrice !== "") +
    Number(filters.productRating > 0) +
    Number(filters.storeRating > 0) +
    filters.locations.length +
    filters.paymentMethods.length +
    filters.shippingOptions.length +
    filters.categories.length +
    Number(filters.onSale) +
    Number(filters.inStock);

  const renderCheckboxGroup = (key, options) =>
    options.map((option) => {
      const value = typeof option === "string" ? option : option.value;
      const label = typeof option === "string" ? option : option.label;

      return (
        <label className="filter-option" key={value}>
          <input
            type="checkbox"
            checked={filters[key].includes(value)}
            onChange={() => toggleOption(key, value)}
          />
          <span>{label}</span>
        </label>
      );
    });

  const renderRatingGroup = (key, title) => (
    <section className="filter-section" key={key}>
      <h3>{title}</h3>

      <div className="filter-options">
        {[5, 4, 3, 2, 1].map((rating) => (
          <label className="filter-option" key={rating}>
            <input
              type="radio"
              name={key}
              checked={Number(filters[key]) === rating}
              onChange={() => updateFilter(key, rating)}
            />

            <span className="filter-stars">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={14}
                  fill={index < rating ? "currentColor" : "none"}
                />
              ))}
            </span>

            <span className="filter-rating-label">
              {rating}+ stars
            </span>
          </label>
        ))}

        <label className="filter-option">
          <input
            type="radio"
            name={key}
            checked={Number(filters[key]) === 0}
            onChange={() => updateFilter(key, 0)}
          />
          <span>All ratings</span>
        </label>
      </div>
    </section>
  );

  return (
    <>
      <div
        className={`filter-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`filter-sidebar ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="filter-header">
          <div className="filter-heading">
            <SlidersHorizontal size={20} />
            <h2>Filters</h2>
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </div>

          <span className="filter-brand-logo">ShopEZ</span>

          <button
            type="button"
            className="filter-close"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={21} />
          </button>
        </div>

        <div className="filter-content">
          <section className="filter-section">
            <h3>Price Range</h3>

            <div className="filter-price-inputs">
              <label>
                <span>Minimum (Rp)</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(event) =>
                    updateFilter("minPrice", event.target.value)
                  }
                />
              </label>

              <label>
                <span>Maximum (Rp)</span>
                <input
                  type="number"
                  min="0"
                  placeholder="No limit"
                  value={filters.maxPrice}
                  onChange={(event) =>
                    updateFilter("maxPrice", event.target.value)
                  }
                />
              </label>
            </div>
          </section>

          {renderRatingGroup("productRating", "Product Rating")}
          {renderRatingGroup("storeRating", "Store Rating")}

          <section className="filter-section">
            <h3>
              <MapPin size={16} /> Seller Location
            </h3>
            <div className="filter-options">
              {renderCheckboxGroup("locations", LOCATIONS)}
            </div>
          </section>

          <section className="filter-section">
            <h3>
              <CreditCard size={16} /> Payment Methods
            </h3>
            <div className="filter-options">
              {renderCheckboxGroup("paymentMethods", PAYMENT_METHODS)}
            </div>
          </section>

          <section className="filter-section">
            <h3>
              <Truck size={16} /> Shipping Options
            </h3>
            <div className="filter-options">
              {renderCheckboxGroup("shippingOptions", SHIPPING_OPTIONS)}
            </div>
          </section>

          <section className="filter-section">
            <h3>Category</h3>
            <div className="filter-options">
              {renderCheckboxGroup("categories", CATEGORIES)}
            </div>
          </section>

          <section className="filter-section">
            <h3>Special Offers</h3>

            <label className="filter-option">
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={(event) =>
                  updateFilter("onSale", event.target.checked)
                }
              />
              <Tag size={16} />
              <span>On Sale / Discount</span>
            </label>

            <label className="filter-option">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(event) =>
                  updateFilter("inStock", event.target.checked)
                }
              />
              <PackageCheck size={16} />
              <span>In-stock products only</span>
            </label>
          </section>
        </div>

        <div className="filter-footer">
          <button
            type="button"
            className="filter-reset-button"
            onClick={resetFilters}
          >
            <RotateCcw size={16} />
            Reset All
          </button>

          <button
            type="button"
            className="filter-apply-button"
            onClick={applyFilters}
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}

export default FilterSidebar;
