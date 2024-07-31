import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductList = ({ products, addToCart }) => {
  return (
    <div className="container-fluid row">
      {products.map((product) => (
        <div key={product.id} className="col-md-4 mb-4">
          <div className="card">
            <img
              src={product.image}
              className="card-img-top rounded-4 p-2 img-fluid"
              alt={product.name}
            />
            <div className="card-body">
              <h5 className="card-title fw-bold">{product.name}</h5>
              <p className="card-text fw-bold">Price: ₹{product.price}</p>
              <p className="card-text fw-bold">Quantity: {product.quantity}</p>
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
