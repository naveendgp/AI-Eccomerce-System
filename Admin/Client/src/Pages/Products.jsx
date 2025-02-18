import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, ChevronDown, X } from "lucide-react";
import axios from "axios";

const ProductsPage = () => {
  const [products, setProducts] = useState([]); // State to store products
  const [showAddDialog, setShowAddDialog] = useState(false); // State to control add product dialog
  const [searchTerm, setSearchTerm] = useState(""); // State for search functionality
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productCategory: "",
    productPrice: "",
    productQuantity: "",
    productUnit: "kg",
    productLocation: "",
    HarvestDate: "",
    productFreshness: "Fresh",
  });

  const categories = ["vegetables", "grains", "fruits", "dairy"];
  const freshnessLevels = ["Fresh", "Very Fresh", "Day Old"];

  // Fetch products on component mount
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/getproduct");
        setProducts(response.data.data); // Update state with fetched products
        console.log("Fetched products:", response.data.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();

    // Listen for real-time updates from the server
  }, []);

  // Handle product deletion
  const handleDelete = async (productId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/deleteProduct/${productId}`
      );
      console.log("Product deleted successfully:", response.data);
    } catch (err) {
      console.error(
        "Error deleting product:",
        err.response?.data || err.message
      );
    }
  };

  // Handle form submission for adding a new product
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formattedProduct = {
        ...newProduct,
        productPrice: Number(newProduct.productPrice),
        productQuantity: Number(newProduct.productQuantity),
      };

      console.log("Sending product data:", formattedProduct);

      const response = await axios.post(
        "http://localhost:5000/addProduct",
        formattedProduct
      );

      if (response.status === 201) {
        console.log("Product added successfully:", response.data);
        // Clear the form
        setNewProduct({
          productName: "",
          productCategory: "",
          productPrice: "",
          productQuantity: "",
          productUnit: "kg",
          productLocation: "",
          HarvestDate: "",
          productFreshness: "Fresh",
        });
        // Close the dialog
        setShowAddDialog(false);
      }
    } catch (err) {
      console.error("Error adding product:", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen rounded-md">
      {/* Header section remains the same */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Products Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Table section remains the same */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Harvest Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                Freshness
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-gray-200">
                  {product.productName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-600">
                    {product.productCategory}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  ₹{product.productPrice}/{product.productUnit}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {product.productQuantity}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {product.productLocation}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {new Date(product.HarvestDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.productFreshness === "Fresh" || "fresh"
                        ? "bg-green-600"
                        : product.freshness === "Very Fresh"
                        ? "bg-emerald-600"
                        : "bg-yellow-600"
                    }`}
                  >
                    {product.productFreshness.charAt(0).toUpperCase() +
                      product.productFreshness.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-200 text-right">
                  <button className="p-1 bg-gray-600 rounded hover:bg-gray-500 mr-2">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1 bg-red-600 rounded hover:bg-red-700"
                    onClick={() => handleDelete(product.productName)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>{" "}
      </div>

      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[500px] mt-20 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Product</h2>
              <button onClick={() => setShowAddDialog(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Product Name
                </label>
                <input
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.productName}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      productName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Category
                </label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.productCategory}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      productCategory: e.target.value,
                    })
                  }
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Price
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                    value={newProduct.productPrice}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        productPrice: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Quantity
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                    value={newProduct.productQuantity}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        productQuantity: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Location
                </label>
                <input
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.productLocation}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      productLocation: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Harvest Date
                </label>
                <input
                  required
                  type="date"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.HarvestDate}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      HarvestDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Freshness
                </label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.productFreshness}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      productFreshness: e.target.value, // Fixed case here
                    })
                  }
                >
                  {freshnessLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                Add Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;