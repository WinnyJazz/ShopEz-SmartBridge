
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, User, LogOut } from "lucide-react";
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
  const [profileOpen, setProfileOpen] = useState(false);

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
    setProfileOpen(false);
    navigate("/");

    window.dispatchEvent(new Event("authChanged"));
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
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                <User size={18} strokeWidth={1.8} />
                <span>{user.name || "My Account"}</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <p className="profile-name">
                    {user.name}
                  </p>
                  <p className="profile-email">
                    {user.email}
                  </p>

                  <button
                    type="button"
                    className="profile-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
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
