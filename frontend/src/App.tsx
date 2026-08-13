import { Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageLoader } from "@/components/common/PageLoader";
import { AuthProvider } from "@/context/AuthContext";
import {
  LandingPage,
  DoctorLoginPage,
  DoctorRegisterPage,
  DoctorDashboardPreview,
  DoctorProfilePage,
  DoctorLayout,
} from "@/pages/lazyPages";

function AppLayout() {
  const location = useLocation();
  const isDoctorRoute =
    location.pathname.startsWith("/doctor") || location.pathname === "/dashboard";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      {!isDoctorRoute && <Navbar />}
      <div className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<DoctorLoginPage />} />
            <Route path="/register" element={<DoctorRegisterPage />} />

            {/* Redirect /dashboard to /doctor/profile */}
            <Route path="/dashboard" element={<Navigate to="/doctor/profile" replace />} />

            {/* Common Doctor Side Navbar Layout & Separate Route Views */}
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route path="profile" element={<DoctorProfilePage />} />
              <Route path="dashboard" element={<DoctorDashboardPreview />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
      {!isDoctorRoute && <Footer />}
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
