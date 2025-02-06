import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useEffect, useState } from "react";

export const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Only perform verification if loading is complete
    if (!loading) {
      if (!admin) {
        // Store the intended destination
        const currentPath = window.location.pathname;
        navigate("/", { state: { from: currentPath } });
      } else {
        setVerified(true);
      }
    }
  }, [admin, loading, navigate]);


  if (loading || !verified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Only render children when auth is verified
  return children;
};
