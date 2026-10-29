import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Package,
  Store,
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
      className={`my-orders-view${embedded ? " my-orders-embedded" : ""}`}
    >
      <div className="my-orders-container">
        {justPlaced && (
          <div className="my-orders-alert" role="status">
            <CheckCircle2 size={18} />
            <span>
              {placedCount > 1
                ? `Your ${placedCount} orders have been placed (one per shop). Open each one to pay and upload your proof.`
                : "Your order has been placed."}
            </span>
          </div>
        )}

        <div className="my-orders-heading">
          <span className="my-orders-eyebrow">YOUR PURCHASES</span>
          <h1>My Orders</h1>
          <p>Track your orders and payment status.</p>
        </div>

        {loading ? (
          <div className="my-orders-state" role="status">
            <LoaderCircle size={28} className="my-orders-spinner" />
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="my-orders-state my-orders-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="my-orders-primary"
              onClick={loadOrders}
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="my-orders-state">
            <Package size={36} />
            <h2>No orders yet</h2>
            <p>When you place an order, it will show up here.</p>
            <Link to="/catalogue" className="my-orders-primary">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="my-orders-list">
            {orders.map((order) => {
              const status = statusInfo(order);
              const items = Array.isArray(order.items) ? order.items : [];
              const seller =
                order.seller && typeof order.seller === "object"
                  ? order.seller
                  : null;
              const sellerId = seller?._id || seller?.id;
              const shopName = seller?.name || seller?.shopName || "ShopEZ Store";
              const shopImage = seller?.profileImage || seller?.shopImage;
              const shopContent = (
                <>
                  <span className="my-orders-shop-avatar">
                    {shopImage ? (
                      <img src={resolveImage(shopImage)} alt="" />
                    ) : (
                      <Store size={18} />
                    )}
                  </span>
                  <span className="my-orders-shop-info">
                    <small>Sold by</small>
                    <strong>{shopName}</strong>
                    {seller?.shopLocation && (
                      <small className="my-orders-shop-location">
                        <MapPin size={12} />
                        {seller.shopLocation}
                      </small>
                    )}
                  </span>
                  {sellerId && <ArrowRight size={16} className="my-orders-shop-arrow" />}
                </>
              );

              return (
                <article className="my-orders-card" key={order._id}>
                  <div className="my-orders-card-top">
                    <div className="my-orders-reference">
                      <strong>{order.orderNumber}</strong>
                      <small>{formatDate(order.createdAt)}</small>
                    </div>

                    <span
                      className={`my-orders-status my-orders-status-${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {sellerId ? (
                    <Link
                      to={`/shop/${sellerId}`}
                      className="my-orders-shop-link"
                      aria-label={`Visit ${shopName}`}
                    >
                      {shopContent}
                    </Link>
                  ) : (
                    <div className="my-orders-shop-link is-unlinked">
                      {shopContent}
                    </div>
                  )}

                  <div className="my-orders-items">
                    {items.slice(0, 3).map((item, index) => (
                      <div
                        className="my-orders-item"
                        key={`${item.product || item.name}-${index}`}
                      >
                        <span className="my-orders-item-image">
                          {item.image ? (
                            <img
                              src={resolveImage(item.image)}
                              alt={item.name || "Product"}
                            />
                          ) : (
                            <Package size={18} />
                          )}
                        </span>
                        <span className="my-orders-item-name">
                          <strong>{item.name || "Product"}</strong>
                          <small>Qty {item.quantity || 1}</small>
                        </span>
                        <strong className="my-orders-item-price">
                          {formatPrice(item.price)}
                        </strong>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <span className="my-orders-more-items">
                        +{items.length - 3} more{" "}
                        {items.length - 3 === 1 ? "item" : "items"}
                      </span>
                    )}
                  </div>

                  <div className="my-orders-card-bottom">
                    <span>
                      Total payment <strong>{formatPrice(order.total)}</strong>
                    </span>
                    <Link
                      to={`/orders/${order._id}`}
                      className="my-orders-details-link"
                    >
                      {order.status === "pending_payment" &&
                      order.paymentStatus === "unpaid"
                        ? "Pay now"
                        : "Order details"}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}