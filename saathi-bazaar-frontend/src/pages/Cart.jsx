// saathi-bazaar-frontend/src/pages/Cart.jsx
// Basic functional page for My Cart.
// This cart is in-memory for the hackathon MVP (not persistent across page loads or logins).
// Your frontend team will enhance its design and persistent storage.

import React, { useState, useEffect } from 'react';
import Header from '../components/Header'; // Your Header component
import api from '../api'; // Your configured Axios API instance (for conceptual future checkout API)

// Helper functions to get/save cart items from/to browser's session storage.
// This is a simple way to make cart items persist for the current session/tab.
const getCartItemsFromSession = () => {
    const items = sessionStorage.getItem('cartItems');
    return items ? JSON.parse(items) : [];
};
const saveCartItemsToSession = (items) => {
    sessionStorage.setItem('cartItems', JSON.stringify(items));
};


function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    const items = getCartItemsFromSession();
    setCartItems(items);
    calculateTotal(items);
    setLoadingCart(false);
  }, []);

  // Calculates total price of items in cart
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
  };

  // Handles removing an item from the cart (in-memory)
  const handleRemoveFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    saveCartItemsToSession(updatedCart); // Update session storage
    calculateTotal(updatedCart);
    alert(`${itemId} removed from cart.`);
  };

  // Handles the "Checkout" process (conceptual for hackathon)
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Please add items before checking out.'); // Alert if cart is empty
      return;
    }

    // In a real application, you would send these cartItems to a backend API
    // (e.g., POST /api/orders/place) for processing, actual payment, and order creation in the database.
    // For the hackathon, this is a conceptual "checkout" for demonstration purposes only.

    alert(`Proceeding to conceptual checkout for total: ₹${totalPrice}. Your order will be placed! (Future feature: actual payment & order processing.)`);

    // After conceptual checkout, clear the cart
    setCartItems([]);
    saveCartItemsToSession([]);
    setTotalPrice(0);
    // In a real app, you'd navigate to an order confirmation page here
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px', flexGrow: 1, width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#007bff' }}>My Cart</h1>

        {loadingCart ? (
            <p style={{ textAlign: 'center', color: '#4b5563' }}>Loading cart...</p>
        ) : cartItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '1.125rem' }}>Your cart is empty. Add items from Mandis or Bulk Buy offers!</p>
        ) : (
            <div className="card" style={{ marginBottom: '32px' }}>
                {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '12px 0' }}>
                        <div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{item.name}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                {item.quantity} {item.unit} @ ₹{item.price} each
                                {item.type === 'bulk' && <span style={{ marginLeft: '8px', backgroundColor: '#9333ea', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Bulk Offer</span>}
                                {item.type === 'mandi' && <span style={{ marginLeft: '8px', backgroundColor: '#16a34a', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Mandi</span>}
                            </p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.125rem', fontWeight: 'bold', marginRight: '12px' }}>₹{item.quantity * item.price}</span>
                            <button onClick={() => handleRemoveFromCart(item.id)}
                                    style={{ background: '#ef4444', color: 'white', padding: '6px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', width: 'auto' }}>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '1.25rem', fontWeight: 'bold' }}>
                    Total: ₹{totalPrice}
                </div>
                <button onClick={handleCheckout}
                        style={{ background: '#007bff', color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '20px', fontSize: '1.125rem' }}>
                    Proceed to Checkout (Conceptual)
                </button>
            </div>
        )}

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginTop: '20px' }}>
            Note: For this hackathon, the cart is simple and in-memory (or uses session storage). Actual persistent cart, advanced payment gateway, and detailed order creation are future features.
        </p>
      </div>
    </div>
  );
}

export default Cart;