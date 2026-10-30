const CART_KEY = "shopez-cart";

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // storage penuh / diblokir: abaikan
  }
  // Supaya Navbar (badge jumlah item) bisa ikut update
  window.dispatchEvent(new Event("cartChanged"));
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function clearCart() {
  saveCart([]);
}

// product = hasil normalizeProduct()
export function addToCart(product, quantity = 1) {
  const items = getCart();
  const existing = items.find((item) => item.id === product.id);

  const maxQty = product.stock > 0 ? product.stock : 1;

  let updated;

  if (existing) {
    updated = items.map((item) =>
      item.id === product.id
        ? {
            ...item,
            stock: product.stock,
            selectedForCheckout: true,
            quantity: Math.min(item.quantity + quantity, maxQty),
          }
        : item
    );
  } else {
    updated = [
      ...items,
      {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        stock: product.stock,
        shopName: product.shopName,
        location: product.location,
        quantity: Math.min(quantity, maxQty),
        sellerId: product.sellerId,
        selectedForCheckout: true,
      },
    ];
  }

  saveCart(updated);
  return updated;
}