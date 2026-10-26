import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Package } from "lucide-react";
import PaymentProofImage from "../components/PaymentProofImage";
import { API_BASE, formatPrice, resolveImage } from "../utils/productHelpers";
import "./SellerOrders.css";

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  qris: "QRIS",
  bank_transfer: "Bank Transfer",
};

const TABS = [
  {
    id: "review",
    label: "To review",
    match: (o) =>
      o.status === "pending_payment" && o.paymentStatus === "waiting_verification",
  },
  { id: "ship", label: "To ship", match: (o) => o.status === "processing" },
  { id: "shipped", label: "Shipped", match: (o) => o.status === "shipped" },
  {
    id: "done",
    label: "Done",
    match: (o) => ["completed", "cancelled"].includes(o.status),
  },
  { id: "all", label: "All", match: () => true },
];

function formatDateTime(value) {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusInfo(order) {
  if (order.status === "pending_payment") {
    return order.paymentStatus === "waiting_verification"
      ? { label: "Needs your review", className: "waiting" }
      : { label: "Awaiting buyer payment", className: "pending_payment" };
  }

  const labels = {
    processing: "To ship",
    shipped: "Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return { label: labels[order.status] || order.status, className: order.status };
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function SellerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [openProofs, setOpenProofs] = useState(() => new Set());

  async function loadOrders() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true, state: { from: "/seller/orders" } });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/orders/seller/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map((item) => [item.id, orders.filter(item.match).length])
      ),
    [orders]
  );

  const visibleOrders = orders.filter(
    (order) => TABS.find((item) => item.id === tab).match(order)
  );

  function toggleProof(orderId) {
    setOpenProofs((previous) => {
      const next = new Set(previous);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  async function updateOrder(orderId, path, body) {
    setBusyId(orderId);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/${path}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status}).`);
      }

      // Pertahankan data buyer yang sudah di-populate
      setOrders((previous) =>
        previous.map((order) =>
          order._id === orderId
            ? { ...order, ...data.order, buyer: order.buyer }
            : order
        )
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId("");
    }
  }

  function approvePayment(order) {
    if (!window.confirm(`Confirm that you received ${formatPrice(order.total)}?`)) {
      return;
    }
    updateOrder(order._id, "payment", { decision: "approve" });
  }

  function rejectPayment(order) {
    const note = window.prompt(
      "Why are you rejecting this payment? The buyer will see this message."
    );

    if (note === null) return;

    if (!note.trim()) {
      setError("Please enter a reason so the buyer knows what to fix.");
      return;
    }

    updateOrder(order._id, "payment", { decision: "reject", note: note.trim() });
  }

  return (
    <main className="co-page seller-orders-page">
      <div className="co-container">
        <Link to="/seller/shop" className="co-back">
          <ArrowLeft size={15} /> Back to My Shop
        </Link>

        <div className="co-heading">
          <span className="co-eyebrow">SELLER CENTER</span>
          <h1>Incoming Orders</h1>
          <p>Confirm payments and update the status of your orders.</p>
        </div>

        <div className="co-tabs">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`co-tab ${tab === item.id ? "active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              <span>{counts[item.id]}</span>
            </button>
          ))}
        </div>

        {error && <div className="co-alert co-alert-error">{error}</div>}

        {loading ? (
          <div className="co-center">
            <LoaderCircle size={32} className="co-spin" />
            <p>Loading orders...</p>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="co-card co-empty">
            <Package size={36} />
            <h2>No orders here</h2>
            <p>Orders in this tab will show up here.</p>
          </div>
        ) : (
          <div className="co-orders-list">
            {visibleOrders.map((order) => {
              const status = statusInfo(order);
              const busy = busyId === order._id;
              const needsReview =
                order.status === "pending_payment" &&
                order.paymentStatus === "waiting_verification";
              const address = order.shippingAddress;

              return (
                <article className="co-card" key={order._id}>
                  <div className="co-order-top">
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <small>
                        {formatDateTime(order.createdAt)} ·{" "}
                        {PAYMENT_LABELS[order.paymentMethod]}
                      </small>
                    </div>
                    <span className={`co-pill co-pill-${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="co-seller-items">
                    {order.items.map((item) => (
                      <div className="co-item" key={String(item.product)}>
                        <div className="co-item-image">
                          {item.image && (
                            <img src={resolveImage(item.image)} alt="" />
                          )}
                          <span>{item.quantity}</span>
                        </div>
                        <div className="co-item-info">
                          <strong>{item.name}</strong>
                          <small>{formatPrice(item.price)} each</small>
                        </div>
                        <span className="co-item-price">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="co-seller-meta">
                    <div>
                      <small>Buyer</small>
                      <strong>{order.buyer?.name || "—"}</strong>
                    </div>
                    <div>
                      <small>Ship to</small>
                      <p className="co-address">
                        {address.fullName} · {address.phone}
                        <br />
                        {address.address}, {address.city} {address.postalCode}
                        {address.notes ? (
                          <>
                            <br />
                            <em>Note: {address.notes}</em>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <div>
                      <small>Total</small>
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                  </div>

                  {order.hasPaymentProof && (
                    <div className="co-proof-section">
                      <button
                        type="button"
                        className="co-secondary"
                        onClick={() => toggleProof(order._id)}
                      >
                        {openProofs.has(order._id)
                          ? "Hide payment proof"
                          : "View payment proof"}
                      </button>

                      {openProofs.has(order._id) && (
                        <PaymentProofImage
                          orderId={order._id}
                          version={order.paymentProofAt}
                        />
                      )}
                    </div>
                  )}

                  <div className="co-seller-actions">
                    {needsReview && (
                      <>
                        <button
                          type="button"
                          className="co-primary"
                          onClick={() => approvePayment(order)}
                          disabled={busy}
                        >
                          {busy ? "Saving..." : "Approve payment"}
                        </button>
                        <button
                          type="button"
                          className="co-secondary co-danger"
                          onClick={() => rejectPayment(order)}
                          disabled={busy}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {order.status === "processing" && (
                      <button
                        type="button"
                        className="co-primary"
                        onClick={() =>
                          updateOrder(order._id, "status", { status: "shipped" })
                        }
                        disabled={busy}
                      >
                        {busy ? "Saving..." : "Mark as shipped"}
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button
                        type="button"
                        className="co-primary"
                        onClick={() =>
                          updateOrder(order._id, "status", { status: "completed" })
                        }
                        disabled={busy}
                      >
                        {busy ? "Saving..." : "Mark as completed"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}