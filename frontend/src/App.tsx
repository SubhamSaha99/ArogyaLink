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
  HealthInstituteLoginPage,
  HealthInstituteRegisterPage,
  HealthInstituteLayout,
  HealthInstituteProfilePage,
  HealthInstituteDashboardPage,
  HealthInstituteAppointDoctorPage,
  HealthInstituteDoctorDetailsPage,
} from "@/pages/lazyPages";

function AppLayout() {
  const location = useLocation();
  const isDoctorRoute =
    location.pathname.startsWith("/doctor") || location.pathname === "/dashboard";
  const isHealthInstituteTerminalRoute =
    location.pathname.startsWith("/health-institute/profile") ||
    location.pathname.startsWith("/health-institute/dashboard") ||
    location.pathname.startsWith("/health-institute/appoint-doctor") ||
    location.pathname.startsWith("/health-institute/doctors");
  const hidePublicNavAndFooter = isDoctorRoute || isHealthInstituteTerminalRoute;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      {!hidePublicNavAndFooter && <Navbar />}
      <div className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<DoctorLoginPage />} />
            <Route path="/register" element={<DoctorRegisterPage />} />
            <Route path="/health-institute/login" element={<HealthInstituteLoginPage />} />
            <Route path="/health-institute/register" element={<HealthInstituteRegisterPage />} />

            {/* Redirect /dashboard to /doctor/profile */}
            <Route path="/dashboard" element={<Navigate to="/doctor/profile" replace />} />

            {/* Common Doctor Side Navbar Layout & Separate Route Views */}
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route path="profile" element={<DoctorProfilePage />} />
              <Route path="dashboard" element={<DoctorDashboardPreview />} />
            </Route>

            {/* Common Health Institute Side Navbar Layout & Separate Route Views */}
            <Route path="/health-institute" element={<HealthInstituteLayout />}>
              <Route path="profile" element={<HealthInstituteProfilePage />} />
              <Route path="dashboard" element={<HealthInstituteDashboardPage />} />
              <Route path="appoint-doctor" element={<HealthInstituteAppointDoctorPage />} />
              <Route path="appoint-doctor/:doctorId" element={<HealthInstituteDoctorDetailsPage />} />
              <Route path="doctors" element={<HealthInstituteAppointDoctorPage />} />
              <Route path="doctors/:doctorId" element={<HealthInstituteDoctorDetailsPage />} />
            </Route>
          </Routes>
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
