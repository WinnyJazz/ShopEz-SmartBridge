import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearSession, getToken, getTokenRemainingMs } from "../utils/api";

// setTimeout maksimal sekitar 24.8 hari
const MAX_TIMEOUT = 2 ** 31 - 1;

export default function AuthExpiryWatcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    let timer;

    const goToLogin = () => {
      clearSession();
      navigate("/login", {
        replace: true,
        state: { expired: true, from: locationRef.current.pathname },
      });
    };

    const schedule = () => {
      clearTimeout(timer);

      const token = getToken();
      if (!token) return;

      const remaining = getTokenRemainingMs(token);

      if (remaining <= 0) {
        goToLogin();
        return;
      }

      timer = setTimeout(goToLogin, Math.min(remaining, MAX_TIMEOUT));
    };

    schedule();

    window.addEventListener("authChanged", schedule); // setelah login / logout
    window.addEventListener("sessionExpired", goToLogin); // dari apiFetch
    window.addEventListener("focus", schedule); // cek ulang pas balik ke tab

    return () => {
      clearTimeout(timer);
      window.removeEventListener("authChanged", schedule);
      window.removeEventListener("sessionExpired", goToLogin);
      window.removeEventListener("focus", schedule);
    };
  }, [navigate]);

  return null;
}