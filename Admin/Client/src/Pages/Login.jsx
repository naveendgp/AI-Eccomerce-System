import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const date = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await login(email, password);
      console.log(success)
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError("Login failed");
      console.log(error)
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg w-96">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
        {error && (
          <div className="bg-red-600 text-white p-3 rounded mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-gray-700 text-white p-3 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-700 text-white p-3 rounded mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Login
          </button>
          <Link to="/register" className="block text-center text-blue-400 mt-4">Create account</Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
