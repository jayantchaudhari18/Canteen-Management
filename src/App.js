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
    setProducts(initialProducts);
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  return (
    <div className="container mt-5">
      <h1 className="fw-bold m-4 display-2">Canteen Management</h1>
      <ProductList products={products} addToCart={addToCart} />
      {cart.length > 0 && (
        <button
          className="btn btn-primary mt-3"
          onClick={() => setShowCartModal(true)}
        >
          View Cart ({cart.length} items)
        </button>
      )}
      <CartModal
        show={showCartModal}
        handleClose={() => setShowCartModal(false)}
        cart={cart}
        incrementQuantity={incrementQuantity}
        decrementQuantity={decrementQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        calculateTotal={calculateTotal}
      />
    </div>
  );
};

export default App;
