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
  DoctorPatientsPage,
  DoctorAssociatedInstitutesPage,
  DoctorLayout,
  HealthInstituteLoginPage,
  HealthInstituteRegisterPage,
  HealthInstituteLayout,
  HealthInstituteProfilePage,
  HealthInstituteDashboardPage,
  HealthInstituteAppointDoctorPage,
  HealthInstituteAppointedDoctorsPage,
  HealthInstituteDoctorDetailsPage,
  PatientLoginPage,
  PatientRegisterPage,
  PatientLayout,
  PatientProfilePage,
} from "@/pages/lazyPages";

function AppLayout() {
  const location = useLocation();
  const isDoctorRoute =
    location.pathname.startsWith("/doctor") || location.pathname === "/dashboard";
  const isHealthInstituteTerminalRoute =
    location.pathname.startsWith("/health-institute/profile") ||
    location.pathname.startsWith("/health-institute/dashboard") ||
    location.pathname.startsWith("/health-institute/appointed-doctors") ||
    location.pathname.startsWith("/health-institute/appoint-doctor") ||
    location.pathname.startsWith("/health-institute/doctors");
  const isPatientTerminalRoute = location.pathname.startsWith("/patient/profile");
  const hidePublicNavAndFooter =
    isDoctorRoute || isHealthInstituteTerminalRoute || isPatientTerminalRoute;

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
            <Route path="/patient/login" element={<PatientLoginPage />} />
            <Route path="/patient/register" element={<PatientRegisterPage />} />

            {/* Redirect /dashboard to /doctor/profile */}
            <Route path="/dashboard" element={<Navigate to="/doctor/profile" replace />} />

            {/* Common Doctor Side Navbar Layout & Separate Route Views */}
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route path="profile" element={<DoctorProfilePage />} />
              <Route path="patients" element={<DoctorPatientsPage />} />
              <Route path="associated-institutes" element={<DoctorAssociatedInstitutesPage />} />
              <Route path="institutes" element={<DoctorAssociatedInstitutesPage />} />
              <Route path="dashboard" element={<DoctorDashboardPreview />} />
            </Route>

            {/* Common Health Institute Side Navbar Layout & Separate Route Views */}
            <Route path="/health-institute" element={<HealthInstituteLayout />}>
              <Route path="profile" element={<HealthInstituteProfilePage />} />
              <Route path="dashboard" element={<HealthInstituteDashboardPage />} />
              <Route path="appointed-doctors" element={<HealthInstituteAppointedDoctorsPage />} />
              <Route path="appoint-doctor" element={<HealthInstituteAppointDoctorPage />} />
              <Route path="appoint-doctor/:doctorId" element={<HealthInstituteDoctorDetailsPage />} />
              <Route path="doctors" element={<HealthInstituteAppointedDoctorsPage />} />
              <Route path="doctors/:doctorId" element={<HealthInstituteDoctorDetailsPage />} />
            </Route>

            {/* Common Patient Side Navbar Layout & Separate Route Views */}
            <Route path="/patient" element={<PatientLayout />}>
              <Route path="profile" element={<PatientProfilePage />} />
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
