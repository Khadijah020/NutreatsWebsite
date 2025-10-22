import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) fetchMyOrders();
  }, [user]);

  return (
    <div className="mt-16 pb-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">
          My <span className="text-primary">Orders</span>
        </h1>
        {/* <div className="w-24 h-1 bg-primary mx-auto mt-2 rounded-full"></div> */}
      </div>

      {myOrders.length === 0 ? (
        <p className="text-gray-500 text-center mt-12 text-lg">
          You haven’t placed any orders yet.
        </p>
      ) : (
        <div className="flex flex-col items-center space-y-8">
          {myOrders.map((order, index) => (
            <div
              key={index}
              className="w-full max-w-4xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] 
                         rounded-xl border border-gray-200 overflow-hidden transition-transform hover:-translate-y-1"
            >
              {/* Order Summary */}
              <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex flex-col md:flex-row justify-between md:items-center text-gray-700">
                <p>
                  <span className="font-semibold text-gray-800">Order ID:</span>{" "}
                  {order._id}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Payment:</span>{" "}
                  {order.paymentType}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Total:</span>{" "}
                  {currency}
                  {order.amount}
                </p>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-gray-200">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 gap-4 hover:bg-gray-50 transition"
                  >
                    {/* Product Info */}
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <img
                          src={item.product.image[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <div className="ml-4">
                        <h2 className="text-lg font-medium text-gray-800">
                          {item.product.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {item.product.category}
                        </p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex flex-col md:items-end text-sm text-gray-600">
                      <p>
                        <span className="font-medium text-gray-700">Qty:</span>{" "}
                        {item.quantity || "1"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Status:</span>{" "}
                        <span
                          className={`${
                            order.status === "Delivered"
                              ? "text-green-600 font-semibold"
                              : "text-yellow-600 font-medium"
                          }`}
                        >
                          {order.status}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Date:</span>{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-primary font-semibold text-base mt-1">
                        {currency} {item.product.offerPrice * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
