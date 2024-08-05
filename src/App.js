import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import ProductList from "./components/ProductList";
import CartModal from "./components/CartModal";
import ProductDetailModal from "./components/ProductDetailModal";
import useProducts from "./hooks/useProducts";
import { ref, update } from "firebase/database";
import { database } from "./firebase";
import { Toast, Form, InputGroup } from "react-bootstrap";

const App = () => {
  const { products, updateProductQuantity } = useProducts();
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [originalQuantities, setOriginalQuantities] = useState({});
  const [showCheckoutToast, setShowCheckoutToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);

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
    setShowCartModal(true);
  };

  const incrementQuantity = (productId) => {
    const availableQuantity =
      originalQuantities[productId] -
      (cart.find((p) => p.id === productId)?.quantity || 0);
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

      const productRef = ref(database, `products/${product.id}`);
      update(productRef, { quantity: updatedQuantity })
        .then(() => {
          console.log("Product quantity updated successfully.");
          updateProductQuantity(product.id, updatedQuantity);
          setOriginalQuantities((prev) => ({
            ...prev,
            [product.id]: updatedQuantity,
          }));
        })
        .catch((error) => {
          console.error("Error updating product quantity:", error);
        });
    });
    setCart([]);
    setShowCartModal(false);
    setShowCheckoutToast(true);
    setTimeout(() => setShowCheckoutToast(false), 3000);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetailModal(true);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4 row">
        <h1 className="fw-bold col">Canteen Management</h1>
        <Form.Group className="w-50 my-auto col">
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Form.Group>
      </div>
        {cart.length > 0 && (
          <button
            className="btn btn-primary rounded-3"
            onClick={() => setShowCartModal(true)}
          >
            <i className="fas fa-shopping-cart me-2"></i>
            View Cart ({cart.length})
          </button>
        )}
      <ProductList
        products={filteredProducts.map((p) => ({
          ...p,
          quantity:
            originalQuantities[p.id] -
            (cart.find((cp) => cp.id === p.id)?.quantity || 0),
        }))}
        addToCart={addToCart}
        onProductClick={handleProductClick}
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
      <ProductDetailModal
        show={showProductDetailModal}
        handleClose={() => setShowProductDetailModal(false)}
        product={selectedProduct}
        addToCart={addToCart}
      />
      <Toast
        show={showCheckoutToast}
        onClose={() => setShowCheckoutToast(false)}
        delay={3000}
        autohide
        className="position-fixed top-50 start-50 translate-middle m-4 rounded-4"
        style={{ minWidth: "250px" }}
      >
        <Toast.Header closeButton={false}>
          <strong className="me-auto">Checkout Successful</strong>
        </Toast.Header>
        <Toast.Body>Your order has been placed successfully!</Toast.Body>
      </Toast>
    </div>
  );
};

export default App;
