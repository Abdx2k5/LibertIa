import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./store/authStore";
import { UIProvider } from "./store/uiStore";

// Guards
import PrivateRoute from "./components/guards/PrivateRoute";
import AdminRoute   from "./components/guards/AdminRoute";

// Layouts
import PublicLayout    from "./components/layout/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages publiques
import Landing  from "./pages/landing/Landing";
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Pages privées (à créer)
import Dashboard  from "./pages/dashboard/Dashboard";
import Profile    from "./pages/profile/Profile";
import Settings   from "./pages/settings/Settings";
import AdminPanel from "./pages/admin/AdminPanel";
import NotFound   from "./pages/NotFound";

import { ROUTES } from "./utils/constants";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <Routes>

            {/* ── Pages publiques ────────────────────────── */}
            <Route element={<PublicLayout />}>
              <Route path={ROUTES.HOME}     element={<Landing />} />
              <Route path={ROUTES.LOGIN}    element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.FORGOT_PASSWORD}  element={<ForgotPassword />} />
            </Route>

            {/* ── Pages privées (user connecté) ──────────── */}
            <Route element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.PROFILE}   element={<Profile />} />
                <Route path={ROUTES.SETTINGS}  element={<Settings />} />
              </Route>
            </Route>

            {/* ── Pages admin uniquement ─────────────────── */}
            <Route element={<AdminRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path={ROUTES.ADMIN} element={<AdminPanel />} />
              </Route>
            </Route>

            {/* ── 404 ───────────────────────────────────── */}
            <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />

          </Routes>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}