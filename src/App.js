import React, { useState, useEffect } from 'react';
import './App.css';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import useProducts from './hooks/useProducts';

const App = () => {
  const { products, updateProductQuantity } = useProducts();
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    updateProductQuantity(product.id, 1);
  };

  const removeFromCart = (id) => {
    const product = cart.find((item) => item.id === id);
    setCart(cart.filter((item) => item.id !== id));
    updateProductQuantity(id, -product.quantity);
  };

  const cashOut = () => {
    alert(`Total Bill: ₹${total}`);
    setCart([]);
    localStorage.removeItem('cart'); // Clear the cart from localStorage on cash out
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container">
      <h1 className="my-4 text-center">Canteen Management System</h1>
      <div className="row">
        <div className="col-md-8">
          <ProductList products={products} addToCart={addToCart} />
        </div>
        <div className="col-md-4">
          <Cart cart={cart} removeFromCart={removeFromCart} total={total} />
          <Checkout cashOut={cashOut} />
        </div>
      </div>
    </div>
  );
};

export default App;
