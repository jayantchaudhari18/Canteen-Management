import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductList from "../ProductList/ProductList";
import CartModal from "../CartModal/CartModal";
import ProductDetailModal from "../ProductDetail/ProductDetailModal";
import Footer from "../Footer/Footer";
import AdminPanel from "../AdminPanel/AdminPanel";
import useProducts from "../../hooks/useProducts";
import { ref, update } from "firebase/database";
import { auth, database } from "../../firebase";
import { signOut } from "firebase/auth";
import {
  Toast,
  Form,
  InputGroup,
  Container,
  NavDropdown,
} from "react-bootstrap";
import { useAuth } from "../../AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { products, updateProductQuantity } = useProducts();
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [originalQuantities, setOriginalQuantities] = useState({});
  const [showCheckoutToast, setShowCheckoutToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (products && products.length > 0) {
      setOriginalQuantities((prevQuantities) => {
        const updatedQuantities = products.reduce((acc, product) => {
          acc[product.id] = product.quantity;
          return acc;
        }, {});
        // Only update state if there's a difference, preventing re-renders
        if (
          JSON.stringify(updatedQuantities) !== JSON.stringify(prevQuantities)
        ) {
          return updatedQuantities;
        }
        return prevQuantities;
      });
    }
  }, [products]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

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

    // Record sales data
    const checkoutDate = new Date().toISOString().split("T")[0];
    const saleRef = ref(database, `sales/${checkoutDate}`);
    const saleId = Date.now().toString();
    const saleData = {
      [saleId]: {
        total: calculateTotal(),
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        userId: currentUser?.uid,
        timestamp: Date.now(),
      },
    };
    update(saleRef, saleData);

    setCart([]);
    setShowCartModal(false);
    setShowCheckoutToast(true);
    setTimeout(() => setShowCheckoutToast(false), 3000);
  };

  const filteredProducts = products
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetailModal(true);
  };

  const handleLogout = async () => {
    try {
      setLogoutError("");
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      setLogoutError("Failed to log out. Please try again.");
    }
  };

  const handleAdminClick = () => {
    setShowAdmin((prev) => !prev);
  };

  const handleHomeClick = () => {
    setShowAdmin(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Container className="d-flex flex-column align-items-center my-3 py-3">
        <h1 className="fw-bold">
          <Link to="/" className="text-decoration-none text-dark">
            Canteen Management
          </Link>
        </h1>

        <div className="d-flex justify-content-center">
          <button onClick={handleHomeClick} className="btn btn-link text-decoration-none text-dark">
            Home
          </button>
          {currentUser && (
            <button onClick={handleAdminClick} className="btn btn-link text-decoration-none text-dark">
              Admin
            </button>
          )}
          {currentUser && (
            <NavDropdown
              title={`Hello, ${currentUser.displayName || currentUser.email}`}
              id="user-nav-dropdown"
              className="mt-2 fw-bold"
            >
              <NavDropdown.Item onClick={handleLogout} >Logout</NavDropdown.Item>
            </NavDropdown>
          )}
        </div>
      </Container>

      <Container className="mt-5 flex-grow-1">
        {logoutError && (
          <Toast
            show={!!logoutError}
            onClose={() => setLogoutError("")}
            className="position-fixed top-0 end-0 m-3"
            bg="danger"
            text="white"
          >
            <Toast.Body>{logoutError}</Toast.Body>
          </Toast>
        )}

        {showAdmin ? (
          <AdminPanel />
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4 row">
              <h1 className="fw-bold col">Today's items</h1>
              <Form.Group className="w-100 w-md-50 my-auto col">
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
              className="position-fixed bottom-0 end-0 m-3"
              delay={3000}
              autohide
            >
              <Toast.Body>Checkout successful!</Toast.Body>
            </Toast>
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
};

export default Home;
