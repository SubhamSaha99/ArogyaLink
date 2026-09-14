import { Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageLoader } from "@/components/common/PageLoader";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/common/RouteGuards";
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
  PatientMedicalRecordsPage,
  DoctorPatientClinicalHistoryPage,
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
          <Routes>
            {/* Public & Guest Only Routes: Redirect to Profile if already logged in */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<DoctorLoginPage />} />
              <Route path="/register" element={<DoctorRegisterPage />} />
              <Route path="/health-institute/login" element={<HealthInstituteLoginPage />} />
              <Route path="/health-institute/register" element={<HealthInstituteRegisterPage />} />
              <Route path="/patient/login" element={<PatientLoginPage />} />
              <Route path="/patient/register" element={<PatientRegisterPage />} />
            </Route>

            {/* Redirect /dashboard to /doctor/profile */}
            <Route path="/dashboard" element={<Navigate to="/doctor/profile" replace />} />

            {/* Protected Doctor Module Routes */}
            <Route element={<ProtectedRoute allowedRole="DOCTOR" />}>
              <Route path="/doctor" element={<DoctorLayout />}>
                <Route path="profile" element={<DoctorProfilePage />} />
                <Route path="patients" element={<DoctorPatientsPage />} />
                <Route path="clinical-history" element={<DoctorPatientClinicalHistoryPage />} />
                <Route path="patient-history" element={<DoctorPatientClinicalHistoryPage />} />
                <Route path="associated-institutes" element={<DoctorAssociatedInstitutesPage />} />
                <Route path="institutes" element={<DoctorAssociatedInstitutesPage />} />
                <Route path="dashboard" element={<DoctorDashboardPreview />} />
              </Route>
            </Route>

            {/* Protected Health Institute Module Routes */}
            <Route element={<ProtectedRoute allowedRole="HEALTH_INSTITUTE" />}>
              <Route path="/health-institute" element={<HealthInstituteLayout />}>
                <Route path="profile" element={<HealthInstituteProfilePage />} />
                <Route path="dashboard" element={<HealthInstituteDashboardPage />} />
                <Route path="appointed-doctors" element={<HealthInstituteAppointedDoctorsPage />} />
                <Route path="appoint-doctor" element={<HealthInstituteAppointDoctorPage />} />
                <Route path="appoint-doctor/:doctorId" element={<HealthInstituteDoctorDetailsPage />} />
                <Route path="doctors" element={<HealthInstituteAppointedDoctorsPage />} />
                <Route path="doctors/:doctorId" element={<HealthInstituteDoctorDetailsPage />} />
              </Route>
            </Route>

            {/* Protected Patient Module Routes */}
            <Route element={<ProtectedRoute allowedRole="PATIENT" />}>
              <Route path="/patient" element={<PatientLayout />}>
                <Route path="profile" element={<PatientProfilePage />} />
                <Route path="medical-records" element={<PatientMedicalRecordsPage />} />
              </Route>
            </Route>

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
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
