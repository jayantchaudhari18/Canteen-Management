import React from "react";
import { Modal, Button } from "react-bootstrap";

const CartModal = ({
  show,
  handleClose,
  cart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  calculateTotal,
  updateProducts,
}) => {
  const handleCashout = () => {
    updateProducts(cart);
    alert("Cashout successful!");
    clearCart();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Cart</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="list-group">
          {cart.map((product) => (
            <li
              key={product.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <h5>{product.name}</h5>
                <p>₹{product.price}</p>
              </div>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-secondary btn-sm me-2"
                  onClick={() => decrementQuantity(product.id)}
                >
                  -
                </button>
                <span>{product.quantity}</span>
                <button
                  className="btn btn-secondary btn-sm ms-2"
                  onClick={() => incrementQuantity(product.id)}
                >
                  +
                </button>
              </div>
              <button
                className="btn btn-danger btn-sm ms-3"
                onClick={() => removeFromCart(product)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <h4>Total: ₹{calculateTotal()}</h4>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="warning" onClick={clearCart}>
          Clear Cart
        </Button>
        <Button variant="success" onClick={handleCashout}>
          Cashout
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CartModal;
