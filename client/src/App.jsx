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
import ResetPassword  from "./pages/auth/ResetPassword";
import Community from "./pages/community/Community";
import Groups   from "./pages/community/Groups";
import Forums   from "./pages/community/Forums";

// Pages privées (à créer)
import Dashboard    from "./pages/dashboard/Dashboard";
import Profile      from "./pages/profile/Profile";
import VoyageDetail from "./pages/dashboard/VoyageDetail";
import Settings     from "./pages/settings/Settings";
import Subscription from "./pages/subscription/Subscription";
import AgencyDetail from "./pages/agency/AgencyDetail";
import AgencyDirectory from "./pages/agency/AgencyDirectory";
import MesVoyages   from "./pages/voyages/MesVoyages";
import MesSouvenirs from "./pages/souvenirs/MesSouvenirs";
import BoitesCollaboratives from "./pages/collaboration/BoitesCollaboratives";
import AdminPanel   from "./pages/admin/AdminPanel";
import AgencesAdmin    from "./pages/admin/AgencesAdmin";
import ModerationAdmin from "./pages/admin/ModerationAdmin";
import NotFound     from "./pages/NotFound";

// Pages publiques (marketing)
import Pricing      from "./pages/pricing/Pricing";

// Pages publiques (outils internes)
import DesignSystem from "./pages/design-system/DesignSystem";

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
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
              <Route path={ROUTES.RESET_PASSWORD}  element={<ResetPassword />} />
              <Route path={ROUTES.COMMUNITY} element={<Community />} />
              <Route path={ROUTES.GROUPS}    element={<Groups />} />
              <Route path={ROUTES.FORUMS}    element={<Forums />} />
              <Route path={ROUTES.PRICING}   element={<Pricing />} />
              <Route path={ROUTES.DESIGN_SYSTEM} element={<DesignSystem />} />
            </Route>

            {/* ── Pages privées (user connecté) ──────────── */}
            <Route element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path={ROUTES.DASHBOARD}    element={<Dashboard />} />
                <Route path={ROUTES.VOYAGE_DETAIL} element={<VoyageDetail />} />
                <Route path={ROUTES.PROFILE}      element={<Profile />} />
                <Route path={ROUTES.SETTINGS}     element={<Settings />} />
                <Route path={ROUTES.SUBSCRIPTION} element={<Subscription />} />
                <Route path={ROUTES.AGENCIES} element={<AgencyDirectory />} />
                <Route path={ROUTES.AGENCY_DETAIL} element={<AgencyDetail />} />
                <Route path={ROUTES.MY_TRIPS} element={<MesVoyages />} />
                <Route path={ROUTES.MEMORIES} element={<MesSouvenirs />} />
                <Route path={ROUTES.COLLAB_BOXES} element={<BoitesCollaboratives />} />
              </Route>
            </Route>

            {/* ── Pages admin uniquement ─────────────────── */}
            <Route element={<AdminRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path={ROUTES.ADMIN} element={<AdminPanel />} />
              <Route path={ROUTES.ADMIN_AGENCIES}   element={<AgencesAdmin />} />
              <Route path={ROUTES.ADMIN_MODERATION} element={<ModerationAdmin />} />
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