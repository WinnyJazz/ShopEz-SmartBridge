import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Landmark,
  LoaderCircle,
  MapPin,
  QrCode,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { API_BASE, formatPrice, resolveImage } from "../utils/productHelpers";
import { getCart, saveCart } from "../utils/cart";
import "./Checkout.css";

const FREE_SHIPPING_MIN = 500000; // harus sama dengan server
const SHIPPING_FEE = 15000;

const PAYMENT_OPTIONS = [
  {
    id: "qris",
    title: "QRIS",
    description: "Scan the shop's QR code with any e-wallet or banking app, then upload your payment proof.",
    icon: QrCode,
  },
  {
    id: "bank_transfer",
    title: "Bank Transfer",
    description: "Transfer to the shop's bank account, then upload your payment proof.",
    icon: Landmark,
  },
];

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const promoCode = location.state?.promoCode || "";
  const selectedItemIds = location.state?.selectedItemIds;

  // Only the cart items selected for checkout are ordered.
  const [items] = useState(() =>
    getCart().filter(
      (item) =>
        !item.unavailable &&
        item.stock > 0 &&
        (Array.isArray(selectedItemIds)
          ? selectedItemIds.includes(item.id)
          : item.selectedForCheckout !== false)
    )
  );

  const [form, setForm] = useState(() => ({
    fullName: readStoredUser()?.name || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  }));
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true, state: { from: "/checkout" } });
    }
  }, [navigate]);

  // Ongkir dan promo dihitung per toko (tiap toko = satu order)
  const totals = useMemo(() => {
    const groups = new Map();

    for (const item of items) {
      const key = item.sellerId || item.shopName || "unknown";
      groups.set(key, (groups.get(key) || 0) + item.price * item.quantity);
    }

    const promoActive = promoCode.trim().toUpperCase() === "SHOP10";
    let subtotal = 0;
    let shipping = 0;
    let discount = 0;

    for (const groupSubtotal of groups.values()) {
      subtotal += groupSubtotal;
      shipping += groupSubtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
      if (promoActive) discount += Math.round(groupSubtotal * 0.1);
    }

    return {
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount,
      shopCount: groups.size,
    };
  }, [items, promoCode]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true, state: { from: "/checkout" } });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: form,
          paymentMethod,
          promoCode,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        // server membalas non-JSON
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to place order (${response.status}).`
        );
      }

      // Hapus hanya produk yang sudah dibeli dari keranjang
      const purchasedIds = new Set(items.map((item) => item.id));
      saveCart(getCart().filter((item) => !purchasedIds.has(item.id)));

      const placed = data.orders || [];

      if (placed.length === 1) {
        navigate(`/orders/${placed[0]._id}`, {
          replace: true,
          state: { justPlaced: true },
        });
      } else {
        navigate("/orders", {
          replace: true,
          state: { justPlaced: true, count: placed.length },
        });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="co-page">
        <div className="co-container">
          <div className="co-card co-empty">
            <h1>Nothing to check out</h1>
            <p>Your cart has no available items.</p>
            <Link to="/catalogue" className="co-primary">
              Explore Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="co-page">
      <div className="co-container">
        <Link to="/cart" className="co-back">
          <ArrowLeft size={15} /> Back to cart
        </Link>

        <div className="co-heading">
          <span className="co-eyebrow">ALMOST THERE</span>
          <h1>Checkout</h1>
          <p>Enter your shipping details and choose how you'd like to pay.</p>
        </div>

        <form className="co-layout" onSubmit={handleSubmit}>
          <div>
            <section className="co-card">
              <h2>
                <MapPin size={18} /> Shipping Address
              </h2>

              <div className="co-form">
                <label className="co-field">
                  Recipient name *
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="co-field">
                  Phone number *
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="08123456789"
                    pattern="[0-9+\-\s]{8,20}"
                    title="8–20 characters: digits, +, - or spaces"
                    required
                  />
                </label>

                <label className="co-field">
                  Full address *
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    maxLength={300}
                    rows={3}
                    autoComplete="street-address"
                    placeholder="Street, house number, district"
                    required
                  />
                </label>

                <div className="co-row">
                  <label className="co-field">
                    City *
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      maxLength={100}
                      autoComplete="address-level2"
                      required
                    />
                  </label>

                  <label className="co-field">
                    Postal code *
                    <input
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      inputMode="numeric"
                      pattern="\d{5}"
                      maxLength={5}
                      title="5 digits"
                      autoComplete="postal-code"
                      required
                    />
                  </label>
                </div>

                <label className="co-field">
                  Notes for the seller (optional)
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    maxLength={300}
                    rows={2}
                    placeholder="e.g. Please leave it with the security guard"
                  />
                </label>
              </div>
            </section>

            <section className="co-card">
              <h2>
                <ShieldCheck size={18} /> Payment Method
              </h2>

              <div className="co-pay-list">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;

                  return (
                    <label
                      key={option.id}
                      className={`co-pay-option ${
                        paymentMethod === option.id ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={paymentMethod === option.id}
                        onChange={() => setPaymentMethod(option.id)}
                      />
                      <span className="co-pay-icon">
                        <Icon size={20} />
                      </span>
                      <span className="co-pay-copy">
                        <strong>{option.title}</strong>
                        <small>{option.description}</small>
                      </span>
                    </label>
                  );
                })}
              </div>

              {totals.shopCount > 1 && (
                <p className="co-note-text">
                  Your items come from {totals.shopCount} shops, so they'll be
                  placed as {totals.shopCount} separate orders. Each one is paid
                  to its own shop.
                </p>
              )}
            </section>
          </div>

          <aside className="co-card co-summary">
            <h2>Order Summary</h2>

            <div className="co-items">
              {items.map((item) => (
                <div className="co-item" key={item.id}>
                  <div className="co-item-image">
                    {item.image && <img src={resolveImage(item.image)} alt="" />}
                    <span>{item.quantity}</span>
                  </div>
                  <div className="co-item-info">
                    <strong>{item.name}</strong>
                    <small>{item.shopName || item.category}</small>
                  </div>
                  <span className="co-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="co-line">
              <span>Subtotal</span>
              <strong>{formatPrice(totals.subtotal)}</strong>
            </div>
            <div className="co-line">
              <span>Shipping</span>
              <strong>
                {totals.shipping === 0 ? "FREE" : formatPrice(totals.shipping)}
              </strong>
            </div>
            {totals.discount > 0 && (
              <div className="co-line co-discount">
                <span>Promo discount</span>
                <strong>−{formatPrice(totals.discount)}</strong>
              </div>
            )}

            <div className="co-total">
              <span>Total</span>
              <strong>{formatPrice(totals.total)}</strong>
            </div>

            {error && (
              <div className="co-alert co-alert-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="co-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="co-spin" /> Placing order...
                </>
              ) : (
                "Place Order"
              )}
            </button>

            <p className="co-note">
              <Truck size={14} /> Final prices and stock are confirmed when you
              place the order. You'll upload your payment proof on the next
              page.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}