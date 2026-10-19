
import {
  Heart,
  Mail,
  Globe,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand Section */}
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            ShopEZ
          </a>

          <p className="footer-description">
            Your one-stop shop for everyday essentials.
            Discover products you love and enjoy a simpler
            shopping experience.
          </p>

          <div className="footer-socials">
            <a href="#" aria-label="Website">
              <Globe size={19} strokeWidth={1.8} />
            </a>

            <a href="mailto:hello@shopez.com" aria-label="Email">
              <Mail size={19} strokeWidth={1.8} />
            </a>

            <a href="#" aria-label="Community">
              <MessageCircle size={19} strokeWidth={1.8} />
            </a>
          </div>
        </div>

        {/* Shop Links */}
        <div className="footer-column">
          <h4>Shop</h4>

          <ul>
            <li>
              <a href="/catalogue">
                All Products
                <ArrowUpRight size={13} />
              </a>
            </li>
            <li>
              <a href="/catalogue">New Arrivals</a>
            </li>
            <li>
              <a href="/catalogue">Best Sellers</a>
            </li>
            <li>
              <a href="/catalogue">Special Offers</a>
            </li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="footer-column">
          <h4>Help & Support</h4>

          <ul>
            <li>
              <a href="/orders">Track Your Order</a>
            </li>
            <li>
              <a href="/help">FAQs</a>
            </li>
            <li>
              <a href="/help">Shipping Information</a>
            </li>
            <li>
              <a href="/help">Returns & Refunds</a>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div className="footer-column">
          <h4>Company</h4>

          <ul>
            <li>
              <a href="/about">About ShopEZ</a>
            </li>
            <li>
              <a href="/contact">Contact Us</a>
            </li>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms">Terms & Conditions</a>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} ShopEZ.
          All rights reserved.
        </p>

        <p className="footer-made">
          Made with
          <Heart size={14} fill="currentColor" />
          for better shopping.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
