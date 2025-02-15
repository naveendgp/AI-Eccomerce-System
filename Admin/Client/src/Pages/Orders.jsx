import React, { useEffect, useState } from "react";
import { Search, Filter, Eye, Truck, X, Check } from "lucide-react";
import axios from "axios";

const OrdersPage = () => {
  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      customerName: "Rahul Kumar",
      products: ["Organic Tomatoes", "Fresh Potatoes"],
      total: 2500,
      status: "Pending",
      paymentStatus: "Paid",
      orderDate: "2025-02-05",
      deliveryDate: "2025-02-07",
      location: "Mumbai, Maharashtra",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/getOrder");
        setOrders(response.data); // Update state with fetched products
        console.log("Fetched orders:", response.data);
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };

    fetchOrderDetails();

    // Listen for real-time updates from the server
  }, []);


  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-600",
      Processing: "bg-blue-600",
      Shipped: "bg-purple-600",
      Delivered: "bg-green-600",
      Cancelled: "bg-red-600",
    };
    return colors[status] || "bg-gray-600";
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen rounded-md">
      <div className="flex justify-between items-center mb-6 rouned-md">
        <h1 className="text-2xl font-bold text-white">Orders Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Order Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Delivery Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-gray-200">{order.orderId}</td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {order.customerName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  <div className="flex flex-col">
                    {order.products.map((product, idx) => (
                      <span key={idx}>{product}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  ₹{order.total}
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    className={`${getStatusColor(
                      order.status
                    )} text-white px-2 py-1 rounded-full text-xs`}
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      order.paymentStatus === "Paid" || "paid"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {order.payment}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {new Date(order.deliveryDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200 text-right">
                  <button className="p-1 bg-gray-600 rounded hover:bg-gray-500 mr-2">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-1 bg-blue-600 rounded hover:bg-blue-700">
                    <Truck className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
