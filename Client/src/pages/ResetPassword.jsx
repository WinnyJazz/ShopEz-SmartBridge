import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock } from "lucide-react";
import "./Login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, newPassword, confirmPassword }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset your password.");
      }

      setSuccess(data.message);
      setNewPassword("");
      setConfirmPassword("");
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
      <section className="auth-shell reset-password-shell">
        <div className="auth-visual auth-visual-login">
          <div className="auth-visual-glow" />
          <div className="auth-visual-copy">
            <span className="auth-eyebrow">
              <span className="auth-status-dot" />
              ACCOUNT SECURITY
            </span>
            <h1>
              A fresh start
              <br />
              for your account.
            </h1>
            <p>Choose a new password to get back to shopping with ShopEZ.</p>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-card">
            <div className="auth-form-heading">
              <span className="auth-form-kicker">PASSWORD RESET</span>
              <h2>Choose a new password</h2>
              <p>Your new password must be at least 8 characters.</p>
            </div>

            {token ? (
              <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                  <p className="auth-error" role="alert">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="auth-success" role="status">
                    {success}
                  </p>
                )}

                <div className="auth-field">
                  <label htmlFor="new-password">New password</label>
                  <div className="auth-input">
                    <Lock size={18} />
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-button"
                      onClick={() => setShowNewPassword((visible) => !visible)}
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirm-password">Confirm new password</label>
                  <div className="auth-input">
                    <Lock size={18} />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      required
                    />
                    <button
                      type="button"
                      className="auth-eye-button"
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-primary-button"
                  disabled={loading || Boolean(success)}
                >
                  {loading ? "Saving..." : "Reset password"}
                </button>
              </form>
            ) : (
              <p className="auth-error" role="alert">
                This password reset link is invalid or has expired.
              </p>
            )}

            <p className="auth-switch">
              Remember your password? <Link to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
