import React from 'react';

const Cart = ({ cart, removeFromCart, total }) => {
  return (
    <div>
      <h2>Cart</h2>
      <ul className="list-group mb-3">
        {cart.map((item) => (
          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
            {item.name} - ₹{item.price} x {item.quantity}
            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <h3>Total: ₹{total}</h3>
    </div>
  );
};

export default Cart;
