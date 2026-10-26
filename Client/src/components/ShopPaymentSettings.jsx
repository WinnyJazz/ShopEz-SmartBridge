import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Landmark, LoaderCircle, QrCode, ArrowRight, X } from "lucide-react";
import { API_BASE } from "../utils/productHelpers";
import "./ShopPaymentSettings.css";

const PAYMENT_API_URL = `${API_BASE}/api/shop/payment`;
const MAX_QRIS_SIZE = 1024 * 1024; // 1 MB

const emptyPayment = { qris: "", bankName: "", bankAccount: "", bankHolder: "" };

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default function ShopPaymentSettings() {
  const [form, setForm] = useState(emptyPayment);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(PAYMENT_API_URL, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await readJson(response);

        if (!response.ok) {
          throw new Error(data.message || "Failed to load payment settings.");
        }

        if (!cancelled) setForm({ ...emptyPayment, ...data.payment });
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  }

  async function handleQrisChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setMessage("");

    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError("QRIS image must be JPG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_QRIS_SIZE) {
      setError("QRIS image must be 1 MB or smaller.");
      return;
    }

    try {
      const data = await fileToBase64(file);
      setForm((previous) => ({ ...previous, qris: data }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(PAYMENT_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to save payment settings (${response.status}).`
        );
      }

      setForm({ ...emptyPayment, ...data.payment });
      setMessage("Payment settings saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="sps-card">
      <div className="sps-heading">
        <div>
          <span className="sps-eyebrow">PAYMENTS</span>
          <h2>Payment & Orders</h2>
          <p>
            Buyers pay you directly via QRIS or bank transfer, then upload their
            payment proof for you to confirm.
          </p>
        </div>

        <Link to="/seller/orders" className="sps-link">
          Incoming Orders <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="sps-loading">
          <LoaderCircle size={22} className="sps-spin" />
        </div>
      ) : (
        <form className="sps-form" onSubmit={handleSave}>
          {error && <div className="sps-alert sps-alert-error">{error}</div>}
          {message && <div className="sps-alert sps-alert-success">{message}</div>}

          <div className="sps-grid">
            <div className="sps-block">
              <h3>
                <QrCode size={17} /> QRIS
              </h3>

              {form.qris ? (
                <div className="sps-qris-preview">
                  <img src={form.qris} alt="QRIS preview" />
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, qris: "" }))}
                    aria-label="Remove QRIS"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="sps-dropzone">
                  <QrCode size={22} />
                  <strong>Upload your QRIS</strong>
                  <small>Screenshot from your e-wallet or bank app · JPG, PNG, WebP · max 1 MB</small>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleQrisChange}
                  />
                </label>
              )}
            </div>

            <div className="sps-block">
              <h3>
                <Landmark size={17} /> Bank transfer
              </h3>

              <label className="sps-field">
                Bank name
                <input
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  maxLength={50}
                  placeholder="e.g. BCA"
                />
              </label>

              <label className="sps-field">
                Account number
                <input
                  name="bankAccount"
                  value={form.bankAccount}
                  onChange={handleChange}
                  maxLength={40}
                  inputMode="numeric"
                  placeholder="1234567890"
                />
              </label>

              <label className="sps-field">
                Account holder
                <input
                  name="bankHolder"
                  value={form.bankHolder}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Name on the account"
                />
              </label>
            </div>
          </div>

          <p className="sps-hint">
            Buyers can only choose a payment method you've set up. Leave a
            method empty to turn it off.
          </p>

          <button type="submit" className="sps-save" disabled={saving}>
            {saving ? (
              <>
                <LoaderCircle size={17} className="sps-spin" /> Saving...
              </>
            ) : (
              "Save payment settings"
            )}
          </button>
        </form>
      )}
    </section>
  );
}