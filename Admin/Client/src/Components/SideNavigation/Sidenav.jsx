import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Users,
  ShoppingCart,
  BarChart2,
  Settings,
  HelpCircle,
  Calendar,
  FileText,
  ChevronRight,
  ChevronLeft,
  ListOrdered,
  MessageCircle
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import { use } from "react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState("dashboard");

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard",path:"/dashboard" },
    { id: "Orders", icon: ListOrdered, label: "Orders",path:"/orders" },
    { id: "products", icon: ShoppingCart, label: "Products",path:"/products" },
    { id: "messages", icon: MessageCircle, label: "ChatBot", badge: 3,path:"/chatbot" },
    { id: "analytics", icon: BarChart2, label: "Analytics",path:"/analytics" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "documents", icon: FileText, label: "Documents" },
  ];

  const bottomMenuItems = [
    { id: "settings", icon: Settings, label: "Settings" },
    { id: "help", icon: HelpCircle, label: "Help & Support" },
  ];

  const navigate = useNavigate();

  const handleClick = ({item}) => {
    setActiveItem(item.id);
   
  }
  const MenuItem = ({ item, isBottom = false }) => (
    <button
      onClick={() => setActiveItem(item.id)}
      className={`
        w-full flex items-center px-3 py-2 rounded-lg mb-1 
        ${
          activeItem === item.id
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:bg-gray-800"
        }
        ${isCollapsed ? "justify-center" : ""}
        transition-colors duration-200
      `}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && (
        <div className="flex items-center justify-between flex-1 ml-3">
            <Link to={item.path}>
          <span className="text-sm font-medium">{item.label}</span></Link>
          {item.badge && (
            <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </div>
      )}
    </button>
  );

  return (
    <aside
      className={`
        fixed left-0 top-16 h-[calc(100vh-64px)] bg-gray-900 border-r border-gray-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="flex flex-col h-full px-3 py-4">
        {/* Collapse Button */}
        <button
          onClick={() => handleClick({item})}
          className="mb-6 p-2 rounded-lg hover:bg-gray-800 text-gray-400 self-end"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>

        {/* Main Menu */}
        <div className="flex-1">
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>

        {/* Bottom Menu */}
        <div className="pt-4 border-t border-gray-700">
          {bottomMenuItems.map((item) => (
            <MenuItem key={item.id} item={item} isBottom />
          ))}
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="mt-4 flex items-center p-3 rounded-lg bg-gray-800">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Users className="h-5 w-5 text-gray-300" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-200">Admin User</p>
              <p className="text-xs text-gray-400">admin@example.com</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
