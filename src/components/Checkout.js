import React from 'react';

const Checkout = ({ cashOut }) => {
  return (
    <div>
      <button className="btn btn-success btn-block" onClick={cashOut}>Cash Out</button>
    </div>
  );
};

export default Checkout;
