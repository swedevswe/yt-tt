// src/components/Payment.js
import React, { useEffect } from 'react';

function Payment({ onSuccess }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_SANDBOX_CLIENT_ID&currency=USD";
    script.async = true;
    script.onload = () => {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: '1.00' // Can reference a variable or state for dynamic amount
              }
            }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            onSuccess("Payment successful.");
          });
        },
        onError: (err) => {
          console.error("PayPal Checkout onError", err);
        }
      }).render('#paypal-button-container');
    };
    document.body.appendChild(script);
  }, [onSuccess]);

  return <div id="paypal-button-container"></div>;
}

export default Payment;
