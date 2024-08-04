import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ProductList.css";

const ProductList = ({ products, addToCart }) => {
  return (
    <div className="row">
      <h1 className="fw-bold">Products</h1>
      {products.map((product) => (
        <div key={product.id} className="col-md-4 mb-4">
          <div className="card">
            <img
              src={product.image}
              className="card-img-top product-image"
              alt={product.name}
            />
            <div className="card-body">
              <h4 className="card-title">{product.name}</h4>
              <p className="card-text">Price: ₹{product.price}</p>
              <p className="card-text">Quantity: {product.quantity}</p>
              <button
                className="btn btn-primary"
                onClick={() => addToCart(product)}
                disabled={product.quantity === 0}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
