import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import ProductList from "./components/ProductList";
import CartModal from "./components/CartModal";
import useProducts from "./hooks/useProducts";
import { ref, update } from "firebase/database";
import { database } from "./firebase";

const App = () => {
  const { products, updateProductQuantity } = useProducts();
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  // New state to keep track of original quantities
  const [originalQuantities, setOriginalQuantities] = useState({});

  // Initialize originalQuantities when products are loaded
  useEffect(() => {
    setOriginalQuantities(
      products.reduce((acc, product) => {
        acc[product.id] = product.quantity;
        return acc;
      }, {})
    );
  }, [products]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const productInCart = prevCart.find((p) => p.id === product.id);
      if (productInCart) {
        return prevCart.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    // Removed updateProductQuantity call
    setShowCartModal(true);
  };

  const incrementQuantity = (productId) => {
    const availableQuantity = originalQuantities[productId] - (cart.find(p => p.id === productId)?.quantity || 0);
    if (availableQuantity > 0) {
      setCart((prevCart) =>
        prevCart.map((p) =>
          p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    }
  };

  const decrementQuantity = (productId) => {
    const productInCart = cart.find((p) => p.id === productId);
    if (productInCart && productInCart.quantity > 1) {
      setCart((prevCart) =>
        prevCart.map((p) =>
          p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
        )
      );
    }
  };

  const removeFromCart = (product) => {
    setCart((prevCart) => prevCart.filter((p) => p.id !== product.id));
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

  const checkout = () => {
    cart.forEach((product) => {
      const originalQuantity = originalQuantities[product.id];
      const updatedQuantity = originalQuantity - product.quantity;

      // Update the quantity in Firebase
      const productRef = ref(database, `products/${product.id}`);
      update(productRef, { quantity: updatedQuantity })
        .then(() => {
          console.log("Product quantity updated successfully.");
          // Update the local state
          updateProductQuantity(product.id, updatedQuantity);
          // Update originalQuantities
          setOriginalQuantities(prev => ({...prev, [product.id]: updatedQuantity}));
        })
        .catch((error) => {
          console.error("Error updating product quantity:", error);
        });
    });
    setCart([]);
    setShowCartModal(false);
    alert("Checkout successful!");
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
      <ProductList 
        products={products.map(p => ({...p, quantity: originalQuantities[p.id] - (cart.find(cp => cp.id === p.id)?.quantity || 0)}))} 
        addToCart={addToCart} 
      />
      <CartModal
        show={showCartModal}
        handleClose={() => setShowCartModal(false)}
        cart={cart}
        incrementQuantity={incrementQuantity}
        decrementQuantity={decrementQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        calculateTotal={calculateTotal}
        checkout={checkout}
      />
    </div>
  );
};

export default App;