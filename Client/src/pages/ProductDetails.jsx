
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import "./ProductDetails.css";

const products = [
  {
    id: 1,
    name: "Nova X Wireless Headphones",
    category: "Audio",
    price: 129,
    originalPrice: 159,
    rating: 4.8,
    reviews: 2100,
    badge: "BEST SELLER",
    color: "Silver",
    stock: 24,
    description:
      "Experience your favorite music in exceptional comfort. Nova X Wireless Headphones combine a clean, modern design with immersive sound for work, travel, and everyday listening.",
    features: [
      "Immersive high-quality audio",
      "Comfortable over-ear design",
      "Wireless Bluetooth connectivity",
      "Long-lasting battery performance",
    ],
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 2,
    name: "AeroPhone 15 Pro",
    category: "Smartphones",
    price: 799,
    originalPrice: 999,
    rating: 4.7,
    reviews: 1400,
    badge: "20% OFF",
    color: "Titanium",
    stock: 18,
    description:
      "Discover a sleek smartphone experience designed for everyday creativity. AeroPhone 15 Pro pairs a sophisticated finish with a modern design that fits seamlessly into your lifestyle.",
    features: [
      "Premium contemporary design",
      "High-resolution display",
      "Versatile camera experience",
      "Fast and responsive performance",
    ],
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 3,
    name: "EZ Watch Series 4",
    category: "Wearables",
    price: 249,
    originalPrice: 299,
    rating: 4.9,
    reviews: 3200,
    badge: "NEW",
    color: "Midnight Black",
    stock: 15,
    description:
      "Keep your day organized with a stylish smartwatch. EZ Watch Series 4 brings useful everyday features together in a minimalist design made for work, workouts, and downtime.",
    features: [
      "Clear and vibrant display",
      "Activity and wellness tracking",
      "Convenient everyday notifications",
      "Comfortable adjustable strap",
    ],
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=85",
    ],
  },
  {
    id: 4,
    name: "Pulse Buds Pro",
    category: "Accessories",
    price: 89,
    originalPrice: 105,
    rating: 4.6,
    reviews: 1800,
    badge: "15% OFF",
    color: "White",
    stock: 30,
    description:
      "Enjoy your daily playlists with compact wireless earbuds. Pulse Buds Pro feature a lightweight design that is easy to carry wherever your day takes you.",
    features: [
      "Compact wireless design",
      "Comfortable everyday fit",
      "Portable charging case",
      "Easy Bluetooth pairing",
    ],
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&w=1000&q=85",
    ],
  },
];

const formatPrice = (price) =>
  `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ProductDetails() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  if (!product) {
    return (
      <main className="product-not-found">
        <div className="not-found-icon">
          <ShoppingBag size={34} />
        </div>
        <h1>Product not found.</h1>
        <p>This product may no longer be available.</p>
        <Link to="/catalogue" className="details-primary-button">
          Explore Products
        </Link>
      </main>
    );
  }

  const discount = Math.round(
    ((product.originalPrice - product.price) /
      product.originalPrice) *
      100
  );

  const addToCart = () => {
    // Frontend demonstration only; persistent cart integration comes later.
    const currentCart = JSON.parse(
      sessionStorage.getItem("shopez-demo-cart") || "[]"
    );

    const existingItem = currentCart.find(
      (item) => item.id === product.id
    );

    let updatedCart;

    if (existingItem) {
      updatedCart = currentCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        },
      ];
    }

    sessionStorage.setItem(
      "shopez-demo-cart",
      JSON.stringify(updatedCart)
    );

    setCartMessage(`${product.name} added to your demo cart!`);
  };

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
            <span className="details-badge">{product.badge}</span>

            <button
              className={`details-wishlist ${
                isWishlisted ? "active" : ""
              }`}
              onClick={() => setIsWishlisted(!isWishlisted)}
              aria-label="Toggle wishlist"
            >
              <Heart
                size={21}
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>

            <img
              src={product.gallery[selectedImage]}
              alt={product.name}
            />
          </div>

          <div className="details-thumbnails">
            {product.gallery.map((image, index) => (
              <button
                key={image}
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
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="details-information">
          <p className="details-category">{product.category}</p>

          <h1>{product.name}</h1>

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

          <div className="details-price-row">
            <span className="details-price">
              {formatPrice(product.price)}
            </span>
            <span className="details-original-price">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="details-discount">{discount}% OFF</span>
          </div>

          <p className="details-tax-note">
            Product price shown in USD for this demo.
          </p>

          <div className="details-divider" />

          <p className="details-description">{product.description}</p>

          <div className="details-color">
            <span>Color: </span>
            <strong>{product.color}</strong>
          </div>

          <div className="details-stock">
            <span className="stock-dot" />
            {product.stock} items available
          </div>

          <div className="details-purchase">
            <div className="details-quantity">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>

            <button className="details-add-button" onClick={addToCart}>
              <ShoppingBag size={18} />
              Add to Cart
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

      {/* DESCRIPTION & FEATURES */}
      <section className="details-description-section">
        <p className="details-section-eyebrow">GET TO KNOW YOUR PRODUCT</p>
        <h2>Designed for your everyday.</h2>
        <p className="details-long-description">
          {product.description}
        </p>

        <div className="details-feature-grid">
          {product.features.map((feature) => (
            <div className="details-feature" key={feature}>
              <span><Check size={16} /></span>
              {feature}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
