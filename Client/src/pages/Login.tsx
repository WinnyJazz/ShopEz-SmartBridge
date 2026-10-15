
import { useState } from "react";
import { Link } from "react-router-dom";
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
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    alert("Login UI siap! Hubungkan ke backend untuk login sungguhan.");
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
              <span className="auth-form-kicker">WELCOME BACK</span>
              <h2>Log in to ShopEZ</h2>
              <p>Continue where you left off.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
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
                  onClick={() => alert("Fitur reset password belum tersedia.")}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="auth-primary-button">
                Log In <ArrowRight size={17} />
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="auth-social-row">
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
            </div>

            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
