import { Suspense } from "react";
import { BrowserRouter, useRoutes, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageLoader } from "@/components/common/PageLoader";
import { AuthProvider } from "@/context/AuthContext";
import { appRoutes } from "@/pages/lazyPages";

function AppRoutes() {
  const routes = useRoutes(appRoutes);
  return routes;
}

function AppLayout() {
  const location = useLocation();
  const isDoctorRoute =
    location.pathname.startsWith("/doctor") ||
    location.pathname === "/dashboard";
  const isHealthInstituteTerminalRoute =
    location.pathname.startsWith("/health-institute/profile") ||
    location.pathname.startsWith("/health-institute/dashboard") ||
    location.pathname.startsWith("/health-institute/appointed-doctors") ||
    location.pathname.startsWith("/health-institute/appoint-doctor") ||
    location.pathname.startsWith("/health-institute/doctors");
  const isPatientTerminalRoute =
    location.pathname.startsWith("/patient/profile") ||
    location.pathname.startsWith("/patient/medical-records");
  const hidePublicNavAndFooter =
    isDoctorRoute || isHealthInstituteTerminalRoute || isPatientTerminalRoute;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      {!hidePublicNavAndFooter && <Navbar />}
      <div className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <AppRoutes />
        </Suspense>
      </div>
      {!hidePublicNavAndFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
