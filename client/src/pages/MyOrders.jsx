import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    // Your API call
    setLoading(false);
  };

  return (
    <>
      <SEO
        title="My Orders | NuTreats"
        description="View and track your order history"
        url="http://localhost:5173/my-orders"
        canonicalUrl="http://localhost:5173/my-orders"
        noindex={true}  // User-specific pages should not be indexed
        nofollow={true}
      />

      <div className="my-orders-container">
        <h1>My Orders</h1>
        
        {loading ? (
          <div>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet</p>
            <a href="/products">Start Shopping</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <h3>Order #{order.orderNumber}</h3>
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                {/* Rest of order details */}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;