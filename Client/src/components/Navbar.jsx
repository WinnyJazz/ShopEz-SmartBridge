import { Heart, ShoppingBag, User } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        ShopEZ
      </div>

      {/* Search Bar */}
      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search products..."
        />
      </div>

      {/* Right Side */}
      <div className="navbar-actions">
        <button className="nav-icon" aria-label="Favorites">
          <Heart size={22} strokeWidth={1.8} />
        </button>

        <button className="nav-icon" aria-label="Shopping Cart">
          <ShoppingBag size={22} strokeWidth={1.8} />
        </button>

        <button className="sign-in">
          <User size={18} strokeWidth={1.8} />
          <span>Sign In</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

