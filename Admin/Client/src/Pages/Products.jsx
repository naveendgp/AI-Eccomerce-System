import React, { useState } from "react";
import { Plus, Pencil, Trash2, Search, ChevronDown, X } from "lucide-react";

const ProductsPage = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Organic Tomatoes",
      category: "vegetables",
      price: 25,
      unit: "kg",
      quantity: 100,
      location: "Nashik, Maharashtra",
      harvestDate: "2025-02-01",
      freshness: "Fresh",
    },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    unit: "kg",
    quantity: "",
    location: "",
    harvestDate: "",
    freshness: "Fresh",
  });

  const categories = ["vegetables", "grains", "fruits", "dairy"];
  const freshnessLevels = ["Fresh", "Very Fresh", "Day Old"];

  const handleAddProduct = () => {
    setProducts([...products, { ...newProduct, id: products.length + 1 }]);
    setShowAddDialog(false);
    setNewProduct({
      name: "",
      category: "",
      price: "",
      unit: "kg",
      quantity: "",
      location: "",
      harvestDate: "",
      freshness: "Fresh",
    });
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen rounded-md">
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
              <tr key={product.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-gray-200">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-600">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  ₹{product.price}/{product.unit}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {product.quantity} {product.unit}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {product.location}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  {new Date(product.harvestDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-200">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.freshness === "Fresh"
                        ? "bg-green-600"
                        : product.freshness === "Very Fresh"
                        ? "bg-emerald-600"
                        : "bg-yellow-600"
                    }`}
                  >
                    {product.freshness}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-200 text-right">
                  <button className="p-1 bg-gray-600 rounded hover:bg-gray-500 mr-2">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="p-1 bg-red-600 rounded hover:bg-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[500px] mt-20  max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Product</h2>
              <button onClick={() => setShowAddDialog(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Product Name
                </label>
                <input
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Category
                </label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
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
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                    value={newProduct.quantity}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, quantity: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Location
                </label>
                <input
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.location}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, location: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Harvest Date
                </label>
                <input
                  type="date"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.harvestDate}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      harvestDate: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Freshness
                </label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200"
                  value={newProduct.freshness}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, freshness: e.target.value })
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
                onClick={handleAddProduct}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
