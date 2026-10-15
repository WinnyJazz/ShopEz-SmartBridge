
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Gift,
  Heart,
  Zap,
} from "lucide-react";
import "./Login.css";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (form.password.length < 8) {
      alert("Password harus minimal 8 karakter.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Password dan konfirmasi password tidak sama.");
      return;
    }

    if (!acceptedTerms) {
      alert("Silakan setujui Terms & Conditions terlebih dahulu.");
      return;
    }

    alert("Form valid! Registrasi backend belum terhubung.");
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-visual auth-visual-signup">
          <div className="auth-visual-glow" />
          <div className="auth-visual-copy">
            <span className="auth-eyebrow">
              <span className="auth-status-dot" />
              JOIN SHOPEZ
            </span>

            <h1>
              Create your
              <br />
              account.
            </h1>

            <p>
              Start your shopping journey with us and
              enjoy a smarter experience.
            </p>

            <div className="auth-visual-line" />

            <div className="auth-benefit">
              <span className="auth-benefit-icon"><Gift size={19} /></span>
              <div>
                <strong>Exclusive deals</strong>
                <span>Discover special offers.</span>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon"><Heart size={19} /></span>
              <div>
                <strong>Personalized finds</strong>
                <span>Products for your style.</span>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon"><Zap size={19} /></span>
              <div>
                <strong>A seamless experience</strong>
                <span>Shop anytime, anywhere.</span>
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
              <span className="auth-form-kicker">GET STARTED</span>
              <h2>Create your account</h2>
              <p>Join ShopEZ and start shopping!</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="signup-name">Full name</label>
                <div className="auth-input">
                  <UserRound size={18} />
                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-email">Email address</label>
                <div className="auth-input">
                  <Mail size={18} />
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-password">Password</label>
                <div className="auth-input">
                  <Lock size={18} />
                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
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

              <div className="auth-field">
                <label htmlFor="signup-confirm">Confirm password</label>
                <div className="auth-input">
                  <Lock size={18} />
                  <input
                    id="signup-confirm"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-button"
                    onClick={() => setShowConfirm((value) => !value)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="auth-terms">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />
                <span>
                  I agree to the <a href="/terms">Terms & Conditions</a> and{" "}
                  <a href="/privacy">Privacy Policy</a>.
                </span>
              </label>

              <button type="submit" className="auth-primary-button">
                Create account <ArrowRight size={17} />
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="auth-social-row">
              <button
                type="button"
                className="auth-social-button"
                onClick={() => alert("Google sign up belum terhubung.")}
              >
                <span className="auth-google-mark">G</span>
                Google
              </button>

              <button
                type="button"
                className="auth-social-button"
                onClick={() => alert("Apple sign up belum terhubung.")}
              >
                <span className="auth-apple-mark">●</span>
                Apple
              </button>

              <button
                type="button"
                className="auth-social-button auth-social-icon-only"
                aria-label="Email registration"
                onClick={() => alert("Registrasi melalui email belum terhubung.")}
              >
                <Mail size={17} />
              </button>
            </div>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
