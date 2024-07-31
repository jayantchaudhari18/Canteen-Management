import React from 'react';

const ProductList = ({ products, addToCart }) => {
  return (
    <div>
      <h2>Products</h2>
      <ul className="list-group">
        {products.map((product) => (
          <li key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
            {product.name} - ₹{product.price} (Quantity: {product.quantity})
            {product.quantity > 0 && (
              <button className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>Add to Cart</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
