import { useState, useEffect } from 'react';
import { initialProducts } from '../data/products';

const useProducts = () => {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const updateProductQuantity = (id, quantity) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, quantity: product.quantity - quantity } : product
      )
    );
  };

  return {
    products,
    updateProductQuantity,
  };
};

export default useProducts;
