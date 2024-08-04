import React from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const CartModal = ({
  show,
  handleClose,
  cart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  calculateTotal,
  checkout,
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Cart</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {cart.map((product) => (
              <div
                key={product.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="row">
                  <div className="col">
                    <img
                      className="img-fluid rounded-3 w-60"
                      src={product.image}
                      alt={product.name}
                    ></img>
                  </div>
                  <div className="col">
                    <h5>{product.name}</h5>
                    <p>₹{product.price}</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-sm btn-secondary mx-1 rounded-5"
                    onClick={() => decrementQuantity(product.id)}
                  >
                    -
                  </button>
                  <button
                    className="btn btn-sm btn-secondary mx-1 rounded-5"
                    onClick={() => incrementQuantity(product.id)}
                  >
                    +
                  </button>
                  <button
                    className="btn btn-sm btn-danger mx-1"
                    onClick={() => removeFromCart(product)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <h4 className="monospace fw-bold">Total: ₹{calculateTotal()}</h4>
        {/* <Button variant="secondary" onClick={handleClose}>
          Close
        </Button> */}
        <Button variant="btn btn-danger" onClick={clearCart}>
          Clear Cart
        </Button>
        <Button variant="btn btn-success" onClick={checkout}>
          Checkout
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CartModal;
