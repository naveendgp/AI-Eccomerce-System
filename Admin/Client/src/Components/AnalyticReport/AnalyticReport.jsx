import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, ShoppingBag, Users, DollarSign,IndianRupee } from "lucide-react";

const AnalyticsDashboard = () => {
  // Sample data - Replace with real data from your backend
  const priceData = [
    { month: "Jan", tomatoes: 2.5, potatoes: 1.8, onions: 1.2 },
    { month: "Feb", tomatoes: 2.8, potatoes: 1.9, onions: 1.3 },
    { month: "Mar", tomatoes: 2.3, potatoes: 2.0, onions: 1.4 },
    { month: "Apr", tomatoes: 2.6, potatoes: 1.7, onions: 1.6 },
    { month: "May", tomatoes: 3.0, potatoes: 1.6, onions: 1.8 },
    { month: "Jun", tomatoes: 2.7, potatoes: 1.8, onions: 1.5 },
  ];

  const bestSellers = [
    { name: "Tomatoes", value: 35 },
    { name: "Potatoes", value: 25 },
    { name: "Onions", value: 20 },
    { name: "Carrots", value: 15 },
    { name: "Cabbage", value: 5 },
  ];

  const buyerTrends = [
    { month: "Jan", individual: 65, bulk: 35 },
    { month: "Feb", individual: 60, bulk: 40 },
    { month: "Mar", individual: 55, bulk: 45 },
    { month: "Apr", individual: 50, bulk: 50 },
    { month: "May", individual: 45, bulk: 55 },
    { month: "Jun", individual: 40, bulk: 60 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-gray-900 p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-semibold text-white mt-1">{value}</p>
        </div>
        <div className="bg-blue-500/20 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
      </div>
      <div className="mt-4">
        <span
          className={`text-sm ${
            trend >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
        <span className="text-gray-400 text-sm ml-2">vs last month</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value="$12,426"
          icon={IndianRupee}
          trend={12.5}
        />
        <StatCard
          title="Active Products"
          value="164"
          icon={ShoppingBag}
          trend={-2.3}
        />
        <StatCard title="Active Buyers" value="46" icon={Users} trend={5.8} />
        <StatCard
          title="Avg Order Value"
          value="$286"
          icon={TrendingUp}
          trend={8.2}
        />
      </div>

      {/* Price Trends */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Price Trends</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: "#1F2937" }} />
              <Line type="monotone" dataKey="tomatoes" stroke="#0088FE" />
              <Line type="monotone" dataKey="potatoes" stroke="#00C49F" />
              <Line type="monotone" dataKey="onions" stroke="#FFBB28" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Sellers and Buyer Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Best Selling Products
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bestSellers}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bestSellers.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1F2937" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Buyer Purchase Trends */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Buyer Purchase Trends
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buyerTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: "#1F2937" }} />
                <Bar dataKey="individual" fill="#0088FE" stackId="a" />
                <Bar dataKey="bulk" fill="#00C49F" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
