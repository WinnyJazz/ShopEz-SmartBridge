
import { useState } from "react";
import {
  UserRound,
  Package,
  History,
  Star,
  Settings,
  LogOut,
  ChevronRight,
  Mail,
  ShieldCheck,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const menuItems = [
  { id: "profile", label: "My Profile", icon: UserRound },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "history", label: "Purchase History", icon: History },
  { id: "reviews", label: "My Reviews", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Profile() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("profile");

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  }

  function renderContent() {
    switch (activeMenu) {
      case "profile":
        return (
          <>
            <div className="profile-content-heading">
              <div>
                <span className="profile-eyebrow">ACCOUNT OVERVIEW</span>
                <h2>My Profile</h2>
                <p>Manage your personal information.</p>
              </div>
            </div>

            <div className="profile-identity">
              <div className="profile-avatar">
                <UserRound size={34} strokeWidth={1.5} />
              </div>
              <div>
                <h3>{user?.name || "ShopEZ User"}</h3>
                <p>{user?.email || "No email available"}</p>
                <span className="profile-member-badge">
                  <ShieldCheck size={14} />
                  ShopEZ Member
                </span>
              </div>
            </div>

            <div className="profile-section-card">
              <div className="profile-section-title">
                <h3>Personal Information</h3>
              </div>

              <div className="profile-detail-grid">
                <div className="profile-detail">
                  <span>Full Name</span>
                  <strong>{user?.name || "Not provided"}</strong>
                </div>
                <div className="profile-detail">
                  <span>Email Address</span>
                  <strong>{user?.email || "Not provided"}</strong>
                </div>
              </div>

              <p className="profile-note">
                Your information is based on the account you used to sign in.
                Profile editing will be available after account updates are
                connected to the backend.
              </p>
            </div>
          </>
        );

      case "orders":
        return (
          <div className="profile-empty-state">
            <div className="profile-empty-icon">
              <Package size={30} />
            </div>
            <span className="profile-eyebrow">ORDER MANAGEMENT</span>
            <h2>My Orders</h2>
            <p>
              Your ongoing orders will appear here once you start shopping
              and complete checkout.
            </p>
            <button
              className="profile-primary-button"
              onClick={() => navigate("/catalogue")}
            >
              Explore Products <ArrowUpRight size={17} />
            </button>
          </div>
        );

      case "history":
        return (
          <div className="profile-empty-state">
            <div className="profile-empty-icon">
              <History size={30} />
            </div>
            <span className="profile-eyebrow">YOUR TRANSACTIONS</span>
            <h2>Purchase History</h2>
            <p>
              Completed and cancelled transactions will be listed here.
              Your purchase history is not connected yet.
            </p>
            <button
              className="profile-secondary-button"
              onClick={() => setActiveMenu("orders")}
            >
              View My Orders <ChevronRight size={17} />
            </button>
          </div>
        );

      case "reviews":
        return (
          <div className="profile-empty-state">
            <div className="profile-empty-icon">
              <Star size={30} />
            </div>
            <span className="profile-eyebrow">YOUR FEEDBACK</span>
            <h2>My Reviews</h2>
            <p>
              Your product ratings and written reviews will appear here
              after the review feature is connected.
            </p>
            <button
              className="profile-secondary-button"
              onClick={() => navigate("/catalogue")}
            >
              Browse Products <ChevronRight size={17} />
            </button>
          </div>
        );

      case "settings":
        return (
          <>
            <div className="profile-content-heading">
              <div>
                <span className="profile-eyebrow">PREFERENCES & SECURITY</span>
                <h2>Settings</h2>
                <p>Manage your account preferences.</p>
              </div>
            </div>

            <div className="profile-setting-card">
              <div className="profile-setting-icon">
                <Mail size={21} />
              </div>
              <div className="profile-setting-info">
                <h3>Email Address</h3>
                <p>{user?.email || "No email available"}</p>
                <span>Email changes are not available yet.</span>
              </div>
            </div>

            <div className="profile-setting-card">
              <div className="profile-setting-icon">
                <ShieldCheck size={21} />
              </div>
              <div className="profile-setting-info">
                <h3>Password & Security</h3>
                <p>Keep your account secure.</p>
                <span>
                  Password changes will be available when the feature is
                  connected to the backend.
                </span>
              </div>
            </div>

            <div className="profile-setting-card">
              <div className="profile-setting-icon">
                <ShoppingBag size={21} />
              </div>
              <div className="profile-setting-info">
                <h3>Shopping Preferences</h3>
                <p>Personalize your shopping experience.</p>
                <span>More preferences will be available in a future update.</span>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-login-prompt">
          <div className="profile-empty-icon">
            <UserRound size={30} />
          </div>
          <h1>Sign in to your account</h1>
          <p>Log in to view your profile and shopping activity.</p>
          <button
            className="profile-primary-button"
            onClick={() => navigate("/login")}
          >
            Sign In <ChevronRight size={17} />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-page-container">
        <div className="profile-page-heading">
          <span className="profile-eyebrow">YOUR SHOPEZ SPACE</span>
          <h1>My Account</h1>
          <p>Everything you need to manage your shopping experience.</p>
        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-sidebar-user">
              <div className="profile-avatar profile-avatar-small">
                <UserRound size={25} />
              </div>
              <div>
                <strong>{user.name || "ShopEZ User"}</strong>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="profile-menu-label">ACCOUNT MENU</div>

            <nav className="profile-menu">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`profile-menu-item ${
                      activeMenu === item.id ? "active" : ""
                    }`}
                    onClick={() => setActiveMenu(item.id)}
                    aria-current={
                      activeMenu === item.id ? "page" : undefined
                    }
                  >
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>
                    <ChevronRight className="profile-menu-chevron" size={16} />
                  </button>
                );
              })}
            </nav>

            <div className="profile-sidebar-bottom">
              <button
                type="button"
                className="profile-logout-button"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          <section className="profile-main-content">
            {renderContent()}
          </section>
        </div>
      </div>
    </main>
  );
}
