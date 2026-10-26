import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import useFavorites from "../hooks/useFavorites";
import { formatPrice } from "../utils/productHelpers";
import "./Favorites.css";

export default function Favorites() {
  const { products, loading, error, isLoggedIn, toggleFavorite } =
    useFavorites({ withProducts: true });

  return (
    <main className="favorites-page">
      <section className="favorites-container">
        <div className="favorites-heading">
          <span className="favorites-eyebrow">YOUR COLLECTION</span>
          <h1>My Favorites</h1>
          <p>Keep the products you love in one place.</p>
        </div>

        <div className="favorites-toolbar">
          <span>
            {products.length} {products.length === 1 ? "item" : "items"} saved
          </span>
        </div>

        {error && <p className="favorites-error">{error}</p>}

        {!isLoggedIn ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">
              <Heart size={32} strokeWidth={1.5} />
            </div>

            <h2>Please log in</h2>
            <p>Log in to see the products you have saved.</p>

            <Link to="/login" className="favorites-shop-button">
              Log In
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : loading ? (
          <p className="favorites-loading">Loading your favorites...</p>
        ) : products.length === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">
              <Heart size={32} strokeWidth={1.5} />
            </div>

            <h2>Your favorites list is empty</h2>
            <p>
              Explore our collection and save products you would love to have.
            </p>

            <Link to="/catalogue" className="favorites-shop-button">
              Explore Products
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {products.map((product) => (
              <article className="favorite-card" key={product.id}>
                <div className="favorite-image-wrapper">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="favorite-image"
                    />
                  </Link>

                  <button
                    type="button"
                    className="favorite-remove"
                    onClick={() => toggleFavorite(product.id)}
                    aria-label={`Remove ${product.name} from favorites`}
                    title="Remove from favorites"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="favorite-info">
                  <h3>{product.name}</h3>
                  <p className="favorite-price">{formatPrice(product.price)}</p>

                  <Link
                    to={`/product/${product.id}`}
                    className="favorite-view-button"
                  >
                    <ShoppingBag size={16} />
                    View Product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}