// saathi-bazaar-frontend/src/pages/MandiDetail.jsx
// Basic functional page for Mandi Shop Details, including "Add to Cart" functionality with quantity selection.

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Hook to get parameters from the URL (e.g., mandi ID)
import api from '../api'; // Your configured Axios API instance
import Header from '../components/Header'; // Your Header component

// Helper functions to get/save cart items from/to browser's session storage.
// These are defined here for direct use within this component for cart functionality.
const getCartItemsFromSession = () => {
    const items = sessionStorage.getItem('cartItems');
    return items ? JSON.parse(items) : [];
};
const saveCartItemsToSession = (items) => {
    sessionStorage.setItem('cartItems', JSON.stringify(items));
};

function MandiDetail() {
  const { id } = useParams(); // Gets the 'id' parameter from the URL
  const [mandi, setMandi] = useState(null); // State to store fetched mandi details
  const [loading, setLoading] = useState(true); // Loading indicator
  const [error, setError] = useState(null); // Error message state
  const [quantityInputs, setQuantityInputs] = useState({}); // New state to manage quantity input for each product

  // useEffect to fetch specific mandi details when the page loads or ID changes
  useEffect(() => {
    const fetchMandi = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/mandi/${id}`);
        setMandi(res.data);
        // Initialize quantity inputs to 1 for all products
        const initialQuantities = {};
        res.data.products_offered.forEach(p => {
          initialQuantities[p.name] = 1; // Default to 1
        });
        setQuantityInputs(initialQuantities);
      } catch (err) {
        setError('Failed to load mandi details. Please try again or check if the ID is valid.');
        console.error('Error fetching mandi details:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMandi();
  }, [id]);

  // Handle quantity input changes for a specific product
  const handleQuantityChange = (productName, value) => {
    setQuantityInputs(prev => ({
      ...prev,
      [productName]: Math.max(1, parseInt(value, 10) || 1) // Ensure quantity is at least 1
    }));
  };

  // Function to handle adding an item to cart (in-memory using session storage)
  const handleAddToCart = (product) => {
    const selectedQuantity = quantityInputs[product.name]; // Get quantity from state
    if (!selectedQuantity || selectedQuantity < 1) {
      alert('Please select a valid quantity (at least 1) before adding to cart.');
      return;
    }

    const existingCartItems = getCartItemsFromSession();
    const cartItemId = `${product.name}-${mandi.id}`; // Simpler unique ID: product name + mandi ID

    // Check if item already exists in cart, if so, update quantity or add new
    const existingItemIndex = existingCartItems.findIndex(item => item.id === cartItemId);

    if (existingItemIndex > -1) {
        // If item exists, update its quantity in the cart
        const updatedCart = [...existingCartItems];
        updatedCart[existingItemIndex].quantity += selectedQuantity; // Increment quantity
        updatedCart[existingItemIndex].totalItemPrice = updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].price; // Update total
        saveCartItemsToSession(updatedCart);
        alert(`Updated quantity for ${product.name} in cart to ${updatedCart[existingItemIndex].quantity} ${product.unit}.`);
    } else {
        // Add new item to cart
        const newCartItem = {
            id: cartItemId, // Unique ID for this specific cart entry
            productId: product._id, // Store MongoDB _id of the product
            name: product.name,
            quantity: selectedQuantity,
            unit: product.unit,
            price: product.wholesale_price, // Use wholesale price
            totalItemPrice: selectedQuantity * product.wholesale_price, // Total for this item
            listedByShop: mandi.shopName, // For display in cart
            type: 'mandi', // Indicate item source type (mandi)
            sourceId: mandi.id // Store the mandi's ID for later order processing
        };
        const updatedCart = [...existingCartItems, newCartItem];
        saveCartItemsToSession(updatedCart);
        alert(`${product.name} added to cart! Quantity: ${selectedQuantity} ${product.unit}.`);
    }
  };


  if (loading) return <div style={{ textAlign: 'center', paddingTop: '80px', color: '#4b5563' }}>Loading mandi details...</div>;
  if (error) return <div style={{ textAlign: 'center', paddingTop: '80px', color: '#ef4444' }}>{error}</div>;
  if (!mandi) return <div style={{ textAlign: 'center', paddingTop: '80px', color: '#4b5563' }}>Mandi not found.</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px', flexGrow: 1, width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#16a34a' }}>{mandi.shopName}</h1>
        <div className="card" style={{ marginBottom: '32px' }}>
          <p style={{ color: '#374151', marginBottom: '8px' }}><strong>Owner:</strong> {mandi.ownerName || 'N/A'}</p>
          <p style={{ color: '#374151', marginBottom: '8px' }}><strong>Address/Description:</strong> {mandi.description || `Lat: ${mandi.location.lat.toFixed(4)}, Long: ${mandi.location.long.toFixed(4)}`}</p>
          <p style={{ color: '#374151', marginBottom: '16px' }}><strong>Contact:</strong> {mandi.contact || 'N/A'}</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>Available Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {mandi.products_offered.map((product, index) => (
              <div key={index} className="card" style={{ border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>{product.name}</h3>
                <p style={{ color: '#4b5563' }}>Price: ₹{product.wholesale_price} / {product.unit}</p>
                {product.min_bulk_qty && product.bulk_price && (
                  <p style={{ color: '#16a34a' }}>Bulk Offer: ₹{product.bulk_price} / {product.unit} for {product.min_bulk_qty}+ {product.unit}</p>
                )}
                {/* Quantity Input */}
                <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Quantity ({product.unit}):</label>
                    <input
                        type="number"
                        value={quantityInputs[product.name] || 1} // Default to 1
                        onChange={(e) => handleQuantityChange(product.name, e.target.value)}
                        min="1"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>
                {/* Add to Cart Button */}
                <button onClick={() => handleAddToCart(product)}
                        style={{ background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '8px' }}>
                  Add to Cart
                </button>

                {/* Conceptual "Call & Order" button (still useful for direct contact) */}
                <button
                  onClick={() => alert(`Please call ${mandi.contact || 'the shop'} to place an order for ${product.name}.`)}
                  style={{ background: '#22c55e', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '0.875rem' }}>
                  Call & Order (Direct)
                </button>
                {/* Conceptual "Request Delivery Partner" button (optional for direct orders) */}
                <button
                  onClick={() => alert('Delivery partner requested for this item from Mandi! (Mock confirmation)')}
                  style={{ background: '#6366f1', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '0.875rem' }}>
                  Request Delivery (Optional)
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MandiDetail;