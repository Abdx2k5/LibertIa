import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { ROLES, ROUTES } from "../../utils/constants";

export default function AdminRoute() {
  const { isAuthenticated, role, loading } = useAuthStore();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#09090b" }}>
        <div style={{ color: "#8b5cf6", fontSize: 14 }}>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (role !== ROLES.ADMIN) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
}