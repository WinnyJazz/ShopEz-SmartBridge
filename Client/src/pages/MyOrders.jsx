import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Package,
} from "lucide-react";
import {
  API_BASE,
  formatPrice,
  resolveImage,
} from "../utils/productHelpers";
import "./MyOrder.css";

const STATUS_LABELS = {
  pending_payment: "Awaiting payment",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusInfo(order) {
  if (order.status === "pending_payment") {
    return order.paymentStatus === "waiting_verification"
      ? { label: "Waiting for seller", className: "waiting" }
      : { label: "Awaiting payment", className: "pending_payment" };
  }

  return {
    label: STATUS_LABELS[order.status] || order.status,
    className: order.status,
  };
}

export default function MyOrders({ embedded = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const justPlaced = location.state?.justPlaced === true;
  const placedCount = location.state?.count || 0;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
        state: {
          from: embedded ? "/profile" : "/orders",
        },
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/orders/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        // Response is not JSON.
      }

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

  return (
    <div
      className={
        embedded ? "co-page my-orders-embedded" : "co-page"
      }
    >
      <div className="co-container">
        {justPlaced && (
          <div className="co-alert co-alert-success" role="status">
            <CheckCircle2 size={18} />
            <span>
              {placedCount > 1
                ? `Your ${placedCount} orders have been placed (one per shop). Open each one to pay and upload your proof.`
                : "Your order has been placed."}
            </span>
          </div>
        )}

        <div className="co-heading">
          <span className="co-eyebrow">YOUR PURCHASES</span>
          <h1>My Orders</h1>
          <p>Track your orders and payment status.</p>
        </div>

        {loading ? (
          <div className="co-center">
            <LoaderCircle size={32} className="co-spin" />
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="co-card co-empty">
            <p>{error}</p>
            <button
              type="button"
              className="co-primary"
              onClick={loadOrders}
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="co-card co-empty">
            <Package size={36} />
            <h2>No orders yet</h2>
            <p>When you place an order, it will show up here.</p>
            <Link to="/catalogue" className="co-primary">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="co-orders-list">
            {orders.map((order) => {
              const status = statusInfo(order);

              return (
                <Link
                  to={`/orders/${order._id}`}
                  className="co-card co-order-card"
                  key={order._id}
                >
                  <div className="co-order-top">
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <small>{formatDate(order.createdAt)}</small>
                    </div>

                    <span
                      className={`co-pill co-pill-${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="co-order-thumbs">
                    {order.items.slice(0, 4).map((item, index) => (
                      <div
                        className="co-thumb"
                        key={`${item.product || item.name}-${index}`}
                      >
                        {item.image && (
                          <img
                            src={resolveImage(item.image)}
                            alt={item.name || "Product"}
                          />
                        )}
                      </div>
                    ))}

                    {order.items.length > 4 && (
                      <span className="co-thumb-more">
                        +{order.items.length - 4}
                      </span>
                    )}

                    <span className="co-order-names">
                      {order.items[0]?.name}
                      {order.items.length > 1
                        ? ` and ${order.items.length - 1} more`
                        : ""}
                    </span>
                  </div>

                  <div className="co-order-bottom">
                    <span>
                      Total <strong>{formatPrice(order.total)}</strong>
                    </span>

                    <span className="co-order-link">
                      {order.status === "pending_payment" &&
                      order.paymentStatus === "unpaid"
                        ? "Pay now"
                        : "View details"}
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}