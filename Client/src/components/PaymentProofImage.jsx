import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { API_BASE } from "../utils/productHelpers";

export default function PaymentProofImage({ orderId, version }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    setUrl("");
    setError("");

    (async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/orders/${orderId}/proof`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Payment proof is not available.");

        const blob = await response.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load payment proof.");
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orderId, version]);

  if (error) return <p className="co-note-text">{error}</p>;

  if (!url) {
    return (
      <div className="co-proof-loading">
        <LoaderCircle size={20} className="co-spin" />
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" title="Open full size">
      <img src={url} alt="Payment proof" className="co-proof-img" />
    </a>
  );
}