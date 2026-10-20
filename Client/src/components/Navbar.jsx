
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  User,
  LogOut,
  Settings,
  ChevronRight,
} from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    function updateUser() {
      try {
        const savedUser = localStorage.getItem("user");
        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch {
        setUser(null);
      }
    }

    window.addEventListener("authChanged", updateUser);

    return () => {
      window.removeEventListener("authChanged", updateUser);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsProfileOpen(false);

    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  }

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        ShopEZ
      </Link>

      {/* Search Bar */}
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search products..."
          aria-label="Search products"
        />
      </div>

      {/* Right Side */}
      <div className="navbar-actions">
        <Link
          to="/favorites"
          className="nav-icon"
          aria-label="Favorites"
        >
          <Heart size={22} strokeWidth={1.8} />
        </Link>

        <Link
          to="/cart"
          className="nav-icon"
          aria-label="Shopping Cart"
        >
          <ShoppingBag size={22} strokeWidth={1.8} />
        </Link>

        <div className="navbar-profile">
          {user ? (
            <>
              <button
                className="sign-in"
                type="button"
                onClick={() => setIsProfileOpen((open) => !open)}
                aria-expanded={isProfileOpen}
              >
                <User size={18} strokeWidth={1.8} />
                <span>{user.name || "My Account"}</span>
              </button>

              {user && isProfileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <strong>Hi, {user.name}!</strong>
                    <span>{user.email}</span>
                  </div>

                  <Link
                    to="/profile"
                    className="profile-dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={18} />
                    <span>My Account</span>
                  </Link>

                  <Link
                    to="/profile?tab=purchase"
                    className="profile-dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <ShoppingBag size={18} />
                    <span>My Purchase</span>
                  </Link>

                  <button
                    className="profile-dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              className="sign-in"
              type="button"
              onClick={() => navigate("/login")}
            >
              <User size={18} strokeWidth={1.8} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
