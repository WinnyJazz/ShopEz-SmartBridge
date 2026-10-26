
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Landmark,
  LoaderCircle,
  MapPin,
  QrCode,
  Upload,
} from "lucide-react";
import PaymentProofImage from "../components/PaymentProofImage";
import { API_BASE, formatPrice, resolveImage } from "../utils/productHelpers";
import "./Checkout.css";

const STATUS_LABELS = {
  pending_payment: "Awaiting payment",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS = {
  cod: "Cash on Delivery",
  qris: "QRIS",
  bank_transfer: "Bank Transfer",
};

const PAYMENT_STATUS_LABELS = {
  unpaid: "Unpaid",
  waiting_verification: "Waiting for confirmation",
  paid: "Paid",
};

function formatDateTime(value) {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced === true;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  // Load order details
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
        state: { from: `/orders/${id}` },
      });
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE}/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readJson(response);

        if (!response.ok) {
          throw new Error(data.message || "Order not found.");
        }

        if (!cancelled) {
          setOrder(data.order);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load order.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  // Clean up image preview URL
  useEffect(() => {
    return () => {
      if (proofPreview) {
        URL.revokeObjectURL(proofPreview);
      }
    };
  }, [proofPreview]);

  function handleProofChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    setError("");
    setNotice("");

    if (!file) return;

    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Payment proof must be 5 MB or smaller.");
      return;
    }

    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  }

  // Upload payment proof
  async function handleUploadProof() {
    if (!proofFile) return;

    setUploading(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("proof", proofFile);

      const response = await fetch(`${API_BASE}/api/orders/${id}/proof`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to upload payment proof (${response.status}).`
        );
      }

      setOrder((previous) => ({
        ...previous,
        ...data.order,
      }));

      setProofFile(null);
      setProofPreview("");

      // Show a clear success message after upload succeeds.
      setNotice(
        "Thank you! Your payment proof has been submitted and is waiting for verification."
      );
    } catch (err) {
      setError(err.message || "Failed to upload payment proof.");
    } finally {
      setUploading(false);
    }
  }

  // Cancel order
  async function handleCancel() {
    if (
      !window.confirm(
        "Cancel this order? This action cannot be undone."
      )
    ) {
      return;
    }

    setCancelling(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_BASE}/api/orders/${id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel this order."
        );
      }

      setOrder((previous) => ({
        ...previous,
        ...data.order,
      }));

      setNotice("Your order has been cancelled.");
    } catch (err) {
      setError(err.message || "Unable to cancel this order.");
    } finally {
      setCancelling(false);
    }
  }

  // Navigate to Profile with My Orders selected
  function goToMyOrders() {
    navigate("/profile", {
      state: {
        activeMenu: "orders",
      },
    });
  }

  if (loading) {
    return (
      <main className="co-page">
        <div className="co-container co-center">
          <LoaderCircle size={32} className="co-spin" />
          <p>Loading order...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="co-page">
        <div className="co-container">
          <div className="co-card co-empty">
            <h1>Order not found</h1>
            <p>{error || "This order may not exist."}</p>

            <button
              type="button"
              className="co-primary"
              onClick={goToMyOrders}
            >
              View My Orders
            </button>
          </div>
        </div>
      </main>
    );
  }

  const info = order.paymentInfo;
  const address = order.shippingAddress;
  const waiting = order.paymentStatus === "waiting_verification";

  const needsPayment =
    order.paymentMethod !== "cod" &&
    order.status === "pending_payment" &&
    order.paymentStatus !== "paid";

  const canCancel =
    order.paymentStatus !== "paid" &&
    ["pending_payment", "processing"].includes(order.status);

  const statusLabel =
    order.status === "pending_payment" && waiting
      ? "Waiting for seller"
      : STATUS_LABELS[order.status] || order.status;

  return (
    <main className="co-page">
      <div className="co-container">
        <button
          type="button"
          className="co-back"
          onClick={goToMyOrders}
        >
          <ArrowLeft size={15} />
          Back to My Orders
        </button>

        {justPlaced && (
          <div className="co-alert co-alert-success" role="status">
            <CheckCircle2 size={18} />
            <span>
              Thank you! Your order has been placed.
              {order.paymentMethod === "cod"
                ? " Please prepare the exact amount for the courier."
                : " Please complete your payment and upload your payment proof below."}
            </span>
          </div>
        )}

        <div className="co-heading">
          <span className="co-eyebrow">ORDER DETAILS</span>
          <h1>{order.orderNumber}</h1>
          <p>
            Placed on {formatDateTime(order.createdAt)}
            {info?.shopName ? ` · ${info.shopName}` : ""}
          </p>
        </div>

        <div className="co-layout">
          <div>
            {/* Order status and payment information */}
            <section className="co-card">
              <div className="co-status-row">
                <h2>Status</h2>

                <span
                  className={`co-pill co-pill-${
                    order.status === "pending_payment" && waiting
                      ? "waiting"
                      : order.status
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="co-meta">
                <div>
                  <small>Payment method</small>
                  <strong>
                    {PAYMENT_LABELS[order.paymentMethod] ||
                      order.paymentMethod}
                  </strong>
                </div>

                <div>
                  <small>Payment status</small>
                  <strong>
                    {PAYMENT_STATUS_LABELS[order.paymentStatus] ||
                      order.paymentStatus}
                  </strong>
                </div>
              </div>

              {error && (
                <div className="co-alert co-alert-error" role="alert">
                  {error}
                </div>
              )}

              {notice && (
                <div className="co-alert co-alert-success" role="status">
                  <CheckCircle2 size={18} />
                  <span>{notice}</span>
                </div>
              )}

              {/* Show the button after payment proof has been submitted */}
              {waiting && (
                <button
                  type="button"
                  className="co-primary"
                  onClick={goToMyOrders}
                >
                  View My Orders
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  className="co-secondary co-danger"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel order"}
                </button>
              )}
            </section>

            {/* Payment instructions and payment proof upload */}
            {needsPayment && (
              <section className="co-card">
                <h2>
                  {order.paymentMethod === "qris" ? (
                    <QrCode size={18} />
                  ) : (
                    <Landmark size={18} />
                  )}
                  Pay {formatPrice(order.total)}
                </h2>

                {order.paymentNote &&
                  order.paymentStatus === "unpaid" && (
                    <div className="co-alert co-alert-error">
                      Your last payment proof was rejected:{" "}
                      {order.paymentNote}
                    </div>
                  )}

                {/* QRIS payment */}
                {order.paymentMethod === "qris" &&
                  (info?.qris ? (
                    <div className="co-qris-box">
                      <img src={info.qris} alt="Shop QRIS" />
                      <p>
                        Scan this QR code with any e-wallet or banking
                        app and pay exactly{" "}
                        <b>{formatPrice(order.total)}</b>.
                      </p>
                    </div>
                  ) : (
                    <p className="co-note-text">
                      This shop hasn&apos;t set up QRIS. Please cancel
                      and choose another payment method.
                    </p>
                  ))}

                {/* Bank transfer payment */}
                {order.paymentMethod === "bank_transfer" &&
                  (info?.bankAccount ? (
                    <div className="co-bank-box">
                      <Landmark size={20} />

                      <div>
                        <strong>Transfer to</strong>
                        <p>
                          {info.bankName} ·{" "}
                          <b>{info.bankAccount}</b>
                          <br />
                          a.n. {info.bankHolder}
                        </p>

                        <p>
                          Amount: <b>{formatPrice(order.total)}</b>
                        </p>

                        <small>
                          Include <b>{order.orderNumber}</b> in the
                          transfer note.
                        </small>
                      </div>
                    </div>
                  ) : (
                    <p className="co-note-text">
                      This shop hasn&apos;t set up a bank account.
                      Please cancel and choose another payment method.
                    </p>
                  ))}

                <div className="co-proof-section">
                  <h3>Payment proof</h3>

                  {waiting && (
                    <div className="co-alert co-alert-success">
                      <Clock3 size={17} />
                      <span>
                        Your payment proof has been uploaded and is
                        waiting for the seller to verify your payment.
                      </span>
                    </div>
                  )}

                  {order.hasPaymentProof && !proofPreview && (
                    <PaymentProofImage
                      orderId={order._id}
                      version={order.paymentProofAt}
                    />
                  )}

                  {proofPreview && (
                    <img
                      src={proofPreview}
                      alt="Selected payment proof"
                      className="co-proof-img"
                    />
                  )}

                  <div className="co-upload-row">
                    <label className="co-secondary co-file-btn">
                      <Upload size={16} />
                      {order.hasPaymentProof || proofFile
                        ? "Choose another image"
                        : "Choose payment proof"}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleProofChange}
                      />
                    </label>

                    {proofFile && (
                      <button
                        type="button"
                        className="co-primary"
                        onClick={handleUploadProof}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <>
                            <LoaderCircle
                              size={17}
                              className="co-spin"
                            />{" "}
                            Uploading...
                          </>
                        ) : waiting ? (
                          "Replace proof"
                        ) : (
                          "Upload proof"
                        )}
                      </button>
                    )}
                  </div>

                  <small className="co-note-text">
                    JPG, PNG, or WebP · max 5 MB. Only you and the
                    seller can see this image.
                  </small>
                </div>
              </section>
            )}

            {/* Shipping address */}
            <section className="co-card">
              <h2>
                <MapPin size={18} />
                Shipping Address
              </h2>

              {address ? (
                <p className="co-address">
                  <strong>{address.fullName}</strong>
                  <br />
                  {address.phone}
                  <br />
                  {address.address}
                  <br />
                  {address.city} {address.postalCode}
                </p>
              ) : (
                <p className="co-note-text">
                  Shipping address is not available.
                </p>
              )}

              {address?.notes && (
                <p className="co-note-text">
                  Note: {address.notes}
                </p>
              )}
            </section>
          </div>

          {/* Order items and price summary */}
          <aside className="co-card co-summary">
            <h2>Items</h2>

            <div className="co-items">
              {(order.items || []).map((item, index) => (
                <Link
                  to={`/product/${item.product}`}
                  className="co-item co-item-link"
                  key={item.product || item._id || index}
                >
                  <div className="co-item-image">
                    {item.image && (
                      <img
                        src={resolveImage(item.image)}
                        alt={item.name || "Product"}
                      />
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
                </Link>
              ))}
            </div>

            <div className="co-line">
              <span>Subtotal</span>
              <strong>{formatPrice(order.subtotal)}</strong>
            </div>

            <div className="co-line">
              <span>Shipping</span>
              <strong>
                {order.shippingFee === 0
                  ? "FREE"
                  : formatPrice(order.shippingFee)}
              </strong>
            </div>

            {order.discountAmount > 0 && (
              <div className="co-line co-discount">
                <span>Promo discount</span>
                <strong>
                  −{formatPrice(order.discountAmount)}
                </strong>
              </div>
            )}

            <div className="co-total">
              <span>Total</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>

            <button
              type="button"
              className="co-secondary"
              onClick={goToMyOrders}
            >
              <ArrowLeft size={15} />
              Back to My Orders
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
