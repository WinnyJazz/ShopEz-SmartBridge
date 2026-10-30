import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Star,
} from "lucide-react";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = location.state?.expired === true;
  const rawFrom = location.state?.from || "/";
  const redirectTo =
    rawFrom === "/login" || rawFrom === "/signup" ? "/" : rawFrom;

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      // Simpan token dan data user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Beri tahu Navbar & AuthExpiryWatcher bahwa login berhasil
      window.dispatchEvent(new Event("authChanged"));

      // Balik ke halaman sebelum sesi habis
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, recoveryEmail }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to request a password reset.");
      }

      setNotice(data.message);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-visual auth-visual-login">
          <div className="auth-visual-glow" />
          <div className="auth-visual-copy">
            <span className="auth-eyebrow">
              <span className="auth-status-dot" />
              SHOP SMARTER
            </span>

            <h1>
              More than
              <br />
              just shopping.
            </h1>

            <p>
              Discover products you love with a seamless
              and modern shopping experience.
            </p>

            <div className="auth-visual-line" />

            <div className="auth-benefit">
              <span className="auth-benefit-icon"><Star size={19} /></span>
              <div>
                <strong>Curated products</strong>
                <span>Quality finds, all in one place.</span>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon"><Truck size={19} /></span>
              <div>
                <strong>Fast & secure shipping</strong>
                <span>Shop with confidence.</span>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon"><ShieldCheck size={19} /></span>
              <div>
                <strong>A smarter experience</strong>
                <span>Shopping made simple.</span>
              </div>
            </div>
          </div>

          <div className="auth-product-art" aria-hidden="true">
            <div className="auth-art-orbit auth-art-orbit-one" />
            <div className="auth-art-orbit auth-art-orbit-two" />
            <div className="auth-art-platform">
              <div className="auth-art-bag">
                <span className="auth-art-handle" />
                <span className="auth-art-logo">ShopEZ</span>
              </div>
            </div>
            <span className="auth-art-spark auth-art-spark-one" />
            <span className="auth-art-spark auth-art-spark-two" />
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-card">
            <div className="auth-form-heading">
              <span className="auth-form-kicker">
                {forgotPassword ? "PASSWORD HELP" : "WELCOME BACK"}
              </span>
              <h2>
                {forgotPassword ? "Reset your password" : "Log in to ShopEZ"}
              </h2>
              <p>
                {forgotPassword
                  ? "We will send a secure reset link to your email."
                  : "Continue where you left off."}
              </p>
              {sessionExpired && (
                <p className="auth-notice" role="status">
                  Sesi kamu sudah habis. Silakan log in lagi.
                </p>
              )}
            </div>

            {forgotPassword ? (
              <form onSubmit={handleForgotPassword} className="auth-form">
                {error && (
                  <p className="auth-error" role="alert">
                    {error}
                  </p>
                )}
                {notice && (
                  <p className="auth-success" role="status">
                    {notice}
                  </p>
                )}
                <p className="auth-form-description">
                  Enter the email on your ShopEZ account and the real email
                  address where you want to receive the reset link.
                </p>
                <div className="auth-field">
                  <label htmlFor="reset-email">ShopEZ account email</label>
                  <div className="auth-input">
                    <Mail size={18} />
                    <input
                      id="reset-email"
                      type="email"
                      placeholder="fake-account@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="recovery-email">Email to receive the link</label>
                  <div className="auth-input">
                    <Mail size={18} />
                    <input
                      id="recovery-email"
                      type="email"
                      placeholder="you@example.com"
                      value={recoveryEmail}
                      onChange={(event) => setRecoveryEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="auth-primary-button"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
                <button
                  type="button"
                  className="auth-link-button auth-back-button"
                  onClick={() => {
                    setForgotPassword(false);
                    setError("");
                    setNotice("");
                  }}
                >
                  Back to log in
                </button>
              </form>
            ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}
              <div className="auth-field">
                <label htmlFor="login-email">Email address</label>
                <div className="auth-input">
                  <Mail size={18} />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <div className="auth-input">
                  <Lock size={18} />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <label className="auth-check-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => {
                    setForgotPassword(true);
                    setError("");
                    setNotice("");
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="auth-primary-button"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>
            )}

            {!forgotPassword && <div className="auth-divider">
              <span>or continue with</span>
            </div>}

            {!forgotPassword && <div className="auth-social-row">
              <button
                type="button"
                className="auth-social-button"
                onClick={() => alert("Google login belum terhubung.")}
              >
                <span className="auth-google-mark">G</span>
                Google
              </button>

              <button
                type="button"
                className="auth-social-button"
                onClick={() => alert("Apple login belum terhubung.")}
              >
                <span className="auth-apple-mark">●</span>
                Apple
              </button>

              <button
                type="button"
                className="auth-social-button auth-social-icon-only"
                aria-label="Email login"
                onClick={() => alert("Login melalui email belum terhubung.")}
              >
                <Mail size={17} />
              </button>
            </div>}

            {!forgotPassword && <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>}
          </div>
        </div>
      </section>
    </main>
  );
}
