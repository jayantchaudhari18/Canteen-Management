import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import ProductList from "./components/ProductList";
import CartModal from "./components/CartModal";
import { initialProducts } from "./data/products";

const App = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);

  useEffect(() => {
    const savedProducts =
      JSON.parse(localStorage.getItem("products")) || initialProducts;
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setProducts(savedProducts);
    setCart(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
    setProducts(
      products.map((p) =>
        p.id === product.id ? { ...p, quantity: p.quantity - 1 } : p
      )
    );
    setShowCartModal(true);
  };

  const incrementQuantity = (productId) => {
    const updatedCart = cart.map((p) => {
      if (p.id === productId) {
        const product = products.find((prod) => prod.id === productId);
        if (product.quantity > 0) {
          return { ...p, quantity: p.quantity + 1 };
        }
      }
      return p;
    });
    setCart(updatedCart);
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
      )
    );
  };

  const decrementQuantity = (productId) => {
    const updatedCart = cart
      .map((p) => {
        if (p.id === productId && p.quantity > 1) {
          return { ...p, quantity: p.quantity - 1 };
        }
        return p;
      })
      .filter((p) => p.quantity > 0);
    setCart(updatedCart);
    setProducts(
      products.map((p) =>
        p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
      )
    );
  };

  const removeFromCart = (product) => {
    setCart(cart.filter((p) => p.id !== product.id));
    setProducts(
      products.map((p) =>
        p.id === product.id
          ? { ...p, quantity: p.quantity + product.quantity }
          : p
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  const updateProducts = (cartItems) => {
    const updatedProducts = products.map((product) => {
      const cartItem = cartItems.find((item) => item.id === product.id);
      if (cartItem) {
        return { ...product, quantity: product.quantity - cartItem.quantity };
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  return (
    <div className="container mt-5">
      <h1 className="fw-bold">Canteen Management</h1>
      <div className="d-flex justify-content-end mb-4">
        {cart.length > 0 && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCartModal(true)}
          >
            <i className="fas fa-shopping-cart"></i> View Cart ({cart.length})
          </button>
        )}
      </div>
      <ProductList products={products} addToCart={addToCart} />
      <CartModal
        show={showCartModal}
        handleClose={() => setShowCartModal(false)}
        cart={cart}
        incrementQuantity={incrementQuantity}
        decrementQuantity={decrementQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        calculateTotal={calculateTotal}
        updateProducts={updateProducts}
      />
    </div>
  );
};

export default App;
