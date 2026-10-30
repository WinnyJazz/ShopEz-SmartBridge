import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  User,
  LogOut,
  Settings,
  Store,
  ClipboardList,
} from "lucide-react";
import { resolveImage } from "../utils/productHelpers";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

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

  function handleSearch(event) {
    event.preventDefault();
    const query = String(
      new FormData(event.currentTarget).get("search") || ""
    ).trim();
    navigate(
      query ? `/catalogue?search=${encodeURIComponent(query)}` : "/catalogue"
    );
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsProfileOpen(false);

    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  }

  const isSeller = user?.role === "seller";

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        ShopEZ
      </Link>

      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          key={location.search}
          name="search"
          type="text"
          defaultValue={new URLSearchParams(location.search).get("search") || ""}
          placeholder="Search products and shops..."
          aria-label="Search products"
        />
      </form>

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
                <span className="navbar-avatar">
                  {user.profileImage ? (
                    <>
                      {isSeller ? (
                        <Store
                          className="navbar-avatar-fallback"
                          size={18}
                          strokeWidth={1.8}
                        />
                      ) : (
                        <User
                          className="navbar-avatar-fallback"
                          size={18}
                          strokeWidth={1.8}
                        />
                      )}
                      <img
                        className="navbar-avatar-image"
                        src={resolveImage(user.profileImage)}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.hidden = true;
                        }}
                      />
                    </>
                  ) : isSeller ? (
                    <Store size={18} strokeWidth={1.8} />
                  ) : (
                    <User size={18} strokeWidth={1.8} />
                  )}
                </span>
                <span>{user.name || "My Account"}</span>
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <strong>Hi, {user.name}!</strong>
                    <span>{user.email}</span>
                    <small className="profile-role">
                      {isSeller ? "Seller Account" : "Buyer Account"}
                    </small>
                  </div>

                  <Link
                    to="/profile"
                    className="profile-dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings size={18} />
                    <span>My Account</span>
                  </Link>

                  <Link
                    to="/profile?tab=purchase"
                    className="profile-dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <ShoppingBag size={18} />
                    <span>My Orders</span>
                  </Link>

                  {isSeller && (
                    <>
                      <Link
                        to="/seller/orders"
                        className="profile-dropdown-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <ClipboardList size={18} />
                        <span>My Sales</span>
                      </Link>

                      <Link
                        to="/seller/shop"
                        className="profile-dropdown-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Store size={18} />
                        <span>View My Shop</span>
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
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
