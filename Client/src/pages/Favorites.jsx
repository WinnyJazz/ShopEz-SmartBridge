
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import "./Favorites.css";

export default function Favorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  function removeFavorite(id) {
    setFavorites((previous) =>
      previous.filter((product) => product.id !== id)
    );
  }

  return (
    <main className="favorites-page">
      <section className="favorites-container">
        <div className="favorites-heading">
          <span className="favorites-eyebrow">YOUR COLLECTION</span>
          <h1>My Favorites</h1>
          <p>
            Keep the products you love in one place.
          </p>
        </div>

        <div className="favorites-toolbar">
          <span>
            {favorites.length}{" "}
            {favorites.length === 1 ? "item" : "items"} saved
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <div className="favorites-empty-icon">
              <Heart size={32} strokeWidth={1.5} />
            </div>

            <h2>Your favorites list is empty</h2>
            <p>
              Explore our collection and save products
              you would love to have.
            </p>

            <Link to="/catalogue" className="favorites-shop-button">
              Explore Products
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((product) => (
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
                    onClick={() => removeFavorite(product.id)}
                    aria-label={`Remove ${product.name} from favorites`}
                    title="Remove from favorites"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="favorite-info">
                  <h3>{product.name}</h3>
                  <p className="favorite-price">
                    {typeof product.price === "number"
                      ? `Rp ${product.price.toLocaleString("id-ID")}`
                      : product.price}
                  </p>

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
