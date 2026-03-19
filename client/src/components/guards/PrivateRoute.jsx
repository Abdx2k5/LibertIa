import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ROUTES } from "../../utils/constants";

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#09090b" }}>
        <div style={{ color: "#8b5cf6", fontSize: 14 }}>Chargement...</div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}