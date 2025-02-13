import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import Layout from "./Layout";
import ChatBot from "./Pages/ChatBot";
import ProductsPage from "./Pages/Products";
import OrdersPage from "./Pages/Orders";
import Chat from "./Pages/Chat";
import { AuthProvider } from "./Context/AuthProvider";
import { ProtectedRoute } from "./Context/ProtectedRoutes";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrdersPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChatBot />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
            
                <Layout>
                  <Chat />
                </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
