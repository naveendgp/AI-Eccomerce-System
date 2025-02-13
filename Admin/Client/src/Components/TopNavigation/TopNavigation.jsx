import React from "react";
import { Bell, Search, Settings, User, Menu, Moon, Sun } from "lucide-react";
import { useAuth } from "../../Context/AuthProvider";

const TopNavigation = () => {
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const {user} = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-700 fixed w-full top-0 z-30">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and hamburger */}
          <div className="flex items-center">
            <button
              className="p-2 rounded-lg hover:bg-gray-800 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6 text-gray-400" />
            </button>
            <span className="text-xl font-semibold ml-2 text-gray-100">
              AdminPanel
            </span>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-4 outline-none">
            <div
              className={`relative ${
                isSearchFocused ? "ring-2 ring-transparent" : ""
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full outline-none focus-none pl-10 pr-3 py-2 border border-gray-600 rounded-lg 
                         focus:outline-none 
                         bg-gray-800 text-gray-100 placeholder-gray-400"
                placeholder="Search..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Right side - Icons */}
          <div className="flex items-center space-x-3">
            <button
              className="p-2 rounded-lg hover:bg-gray-800"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-gray-400" />
              ) : (
                <Moon className="h-6 w-6 text-gray-400" />
              )}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-800 relative">
              <Bell className="h-6 w-6 text-gray-400" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-800">
              <Settings className="h-6 w-6 text-gray-400" />
            </button>
            <div className="h-8 w-px bg-gray-700"></div>
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-300" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-300">
                {user.email||"Admin User"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search - Visible on small screens */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg 
                     focus:outline-none focus:border-blue-500 
                     bg-gray-800 text-gray-100 placeholder-gray-400"
            placeholder="Search..."
          />
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
