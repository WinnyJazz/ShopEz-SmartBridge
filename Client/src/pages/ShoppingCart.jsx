import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Tag,
  ShieldCheck,
  Truck,
  MapPin,
  LoaderCircle,
} from "lucide-react";
import {
  PRODUCTS_API,
  formatPrice,
  normalizeProduct,
} from "../utils/productHelpers";
import { getCart, saveCart } from "../utils/cart";
import "./ShoppingCart.css";

const FREE_SHIPPING_MIN = 500000; // gratis ongkir di atas Rp 500.000
const SHIPPING_FEE = 15000;

export default function ShoppingCart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(() => getCart());
  const [syncing, setSyncing] = useState(() => getCart().length > 0);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");

  // Sinkronkan harga & stok dengan data terbaru dari server
  useEffect(() => {
    const stored = getCart();
    if (stored.length === 0) return;

    let cancelled = false;

    async function syncCart() {
      const updated = await Promise.all(
        stored.map(async (item) => {
          try {
            const response = await fetch(`${PRODUCTS_API}/${item.id}`);

            // Produk sudah dihapus / dinonaktifkan seller
            if (response.status === 404) {
              return { ...item, unavailable: true, stock: 0 };
            }

            if (!response.ok) return item;

            const data = await response.json();
            const product = normalizeProduct(data.product);

            return {
              ...item,
              name: product.name,
              category: product.category,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.image,
              stock: product.stock,
              shopName: product.shopName,
              location: product.location,
              unavailable: false,
              quantity:
                product.stock > 0
                  ? Math.min(item.quantity, product.stock)
                  : item.quantity,
            };
          } catch {
            // Server nggak terjangkau: pakai data yang tersimpan
            return item;
          }
        })
      );

      if (cancelled) return;

      setCartItems(updated);
      saveCart(updated);
      setSyncing(false);
    }

    syncCart();

    return () => {
      cancelled = true;
    };
  }, []);

  const commit = (items) => {
    setCartItems(items);
    saveCart(items);
  };

  const isAvailable = (item) => !item.unavailable && item.stock > 0;

  const availableItems = cartItems.filter(isAvailable);

  const subtotal = availableItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const originalTotal = availableItems.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );

  const discount = originalTotal - subtotal;
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - promoDiscount;

  const updateQuantity = (id, amount) => {
    commit(
      cartItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                Math.max(1, item.quantity + amount),
                item.stock > 0 ? item.stock : 1
              ),
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    commit(cartItems.filter((item) => item.id !== id));
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

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="cart-page">
      <div className="cart-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span>Shopping Cart</span>
      </div>

      <div className="cart-heading">
        <div>
          <p className="cart-eyebrow">YOUR SHOPPING SPACE</p>
          <h1>
            Shopping Cart<span>.</span>
          </h1>
          <p className="cart-subtitle">
            Review your selections before checking out.
          </p>
        </div>

        <div className="cart-count">
          <ShoppingBag size={18} />
          <span>{itemCount} items</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <section className="cart-empty">
          <div className="empty-cart-icon">
            <ShoppingBag size={37} strokeWidth={1.5} />
          </div>
          <h2>Your cart is looking a little empty.</h2>
          <p>Find something you love and make it yours.</p>
          <Link to="/catalogue" className="cart-primary-button">
            Explore Products <ArrowRight size={17} />
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-section">
            <div className="cart-list-heading">
              <h2>Your Items</h2>
              <span>
                {syncing ? (
                  <>
                    <LoaderCircle size={13} className="shop-spinner" /> Updating
                    prices...
                  </>
                ) : (
                  `${cartItems.length} products`
                )}
              </span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const available = isAvailable(item);

                return (
                  <article
                    className={`cart-item ${
                      available ? "" : "cart-item-unavailable"
                    }`}
                    key={item.id}
                  >
                    <Link
                      to={`/product/${item.id}`}
                      className="cart-item-image"
                    >
                      {item.image && <img src={item.image} alt={item.name} />}
                    </Link>

                    <div className="cart-item-details">
                      <p className="cart-item-category">{item.category}</p>
                      <h3>
                        <Link
                          to={`/product/${item.id}`}
                          className="cart-item-name-link"
                        >
                          {item.name}
                        </Link>
                      </h3>

                      {(item.shopName || item.location) && (
                        <p className="cart-item-shop">
                          <MapPin size={13} />
                          {item.shopName}
                          {item.shopName && item.location ? " · " : ""}
                          {item.location}
                        </p>
                      )}

                      {!available && (
                        <p className="cart-item-warning">
                          {item.unavailable
                            ? "This product is no longer available."
                            : "Out of stock."}{" "}
                          It won't be included in your total.
                        </p>
                      )}

                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={!available || item.quantity <= 1}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={14} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={!available || item.quantity >= item.stock}
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
                      {item.originalPrice > item.price && (
                        <span>
                          {formatPrice(item.originalPrice * item.quantity)}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <Link to="/catalogue" className="continue-shopping">
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>

            <div className="cart-benefits">
              <div>
                <Truck size={19} />
                <span>Free shipping over {formatPrice(FREE_SHIPPING_MIN)}</span>
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
              <strong>{shipping === 0 ? "FREE" : formatPrice(shipping)}</strong>
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
              type="button"
              className="checkout-button"
              disabled={availableItems.length === 0 || syncing}
              onClick={() =>
                navigate("/checkout", {
                  state: {
                    promoCode: promoApplied
                      ? promoCode.trim().toUpperCase()
                      : "",
                  },
                })
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

        <Link to="/catalogue" className="recommendation-link">
          Discover More <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}