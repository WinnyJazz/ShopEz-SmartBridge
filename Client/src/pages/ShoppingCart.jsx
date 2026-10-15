
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Tag,
  ShieldCheck,
  Truck,
} from "lucide-react";
import "./ShoppingCart.css";

const initialCart = [
  {
    id: 1,
    name: "Nova X Wireless Headphones",
    category: "Audio",
    color: "Silver",
    price: 129,
    originalPrice: 159,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 2,
    name: "EZ Watch Series 4",
    category: "Wearables",
    color: "Midnight Black",
    price: 249,
    originalPrice: 299,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&q=85",
  },
];

const formatPrice = (price) =>
  `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState(initialCart);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const originalTotal = cartItems.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );

  const discount = originalTotal - subtotal;
  const shipping = subtotal === 0 || subtotal >= 200 ? 0 : 8.99;
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - promoDiscount;

  const updateQuantity = (id, amount) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "SHOP10") {
      setPromoApplied(true);
      setPromoMessage("Promo code applied! You saved 10%.");
    } else {
      setPromoApplied(false);
      setPromoMessage("Invalid code. Try SHOP10.");
    }
  };

  return (
    <main className="cart-page">
      <div className="cart-breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <span>Shopping Cart</span>
      </div>

      <div className="cart-heading">
        <div>
          <p className="cart-eyebrow">YOUR SHOPPING SPACE</p>
          <h1>Shopping Cart<span>.</span></h1>
          <p className="cart-subtitle">
            Review your selections before checking out.
          </p>
        </div>

        <div className="cart-count">
          <ShoppingBag size={18} />
          <span>
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
          </span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <section className="cart-empty">
          <div className="empty-cart-icon">
            <ShoppingBag size={37} strokeWidth={1.5} />
          </div>
          <h2>Your cart is looking a little empty.</h2>
          <p>
            Find something you love and make it yours.
          </p>
          <a href="/catalogue" className="cart-primary-button">
            Explore Products <ArrowRight size={17} />
          </a>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-section">
            <div className="cart-list-heading">
              <h2>Your Items</h2>
              <span>{cartItems.length} products</span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="cart-item-details">
                    <p className="cart-item-category">{item.category}</p>
                    <h3>{item.name}</h3>
                    <p className="cart-item-variant">
                      Color: <strong>{item.color}</strong>
                    </p>

                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <Minus size={14} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        className="remove-item-button"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-prices">
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                    <span>
                      {formatPrice(item.originalPrice * item.quantity)}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <a href="/catalogue" className="continue-shopping">
              <ArrowLeft size={16} />
              Continue Shopping
            </a>

            <div className="cart-benefits">
              <div>
                <Truck size={19} />
                <span>Free shipping over $200</span>
              </div>
              <div>
                <ShieldCheck size={19} />
                <span>Secure checkout</span>
              </div>
            </div>
          </section>

          <aside className="order-summary">
            <div className="summary-heading">
              <h2>Order Summary</h2>
              <span>ESTIMATE</span>
            </div>

            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="summary-line">
              <span>Product savings</span>
              <strong className="summary-savings">
                −{formatPrice(discount)}
              </strong>
            </div>

            <div className="summary-line">
              <span>Shipping</span>
              <strong>
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </strong>
            </div>

            {promoApplied && (
              <div className="summary-line">
                <span>Promo discount</span>
                <strong className="summary-savings">
                  −{formatPrice(promoDiscount)}
                </strong>
              </div>
            )}

            <div className="promo-form">
              <label htmlFor="promo-code">
                <Tag size={15} />
                Have a promo code?
              </label>

              <div className="promo-input-row">
                <input
                  id="promo-code"
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                />
                <button onClick={applyPromo}>Apply</button>
              </div>

              {promoMessage && (
                <p
                  className={`promo-message ${
                    promoApplied ? "success" : "error"
                  }`}
                >
                  {promoMessage}
                </p>
              )}
            </div>

            <div className="summary-total">
              <div>
                <span>Estimated Total</span>
                <p>Taxes included where applicable</p>
              </div>
              <strong>{formatPrice(total)}</strong>
            </div>

            <button
              className="checkout-button"
              onClick={() =>
                alert("Checkout page will be available in the next step!")
              }
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <p className="checkout-note">
              <ShieldCheck size={15} />
              Your information is protected.
            </p>
          </aside>
        </div>
      )}

      <section className="cart-recommendation">
        <div>
          <p className="cart-eyebrow">A LITTLE SOMETHING EXTRA</p>
          <h2>Complete your setup.</h2>
          <p>Discover more essentials selected for your everyday.</p>
        </div>

        <a href="/catalogue" className="recommendation-link">
          Discover More <ArrowRight size={16} />
        </a>
      </section>
    </main>
  );
}
