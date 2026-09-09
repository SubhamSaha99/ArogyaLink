import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Activity,
  AlertCircle,
  FileText,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { useAuth } from "@/context/AuthContext";
import { themeStyles } from "@/styles/themeStyles";

/**
 * Patient Login Formik Validation Schema matching PatientLoginDto:
 * - email (optional if mobile provided)
 * - mobile (optional if email provided, regex: /^\+[1-9]{1}[0-9]{3,14}$/)
 * - password: string min 6 chars
 */
const patientLoginSchema = Yup.object().shape({
  emailOrMobile: Yup.string()
    .trim()
    .required("Email address or Mobile number is required")
    .test(
      "is-email-or-mobile",
      "Must be a valid email or mobile number with country code (e.g. +919876543210)",
      (value) => {
        if (!value) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^\+[1-9]{1}[0-9]{3,14}$/;
        return emailRegex.test(value) || mobileRegex.test(value);
      },
    ),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export interface PatientLoginFormValues {
  emailOrMobile: string;
  password: string;
}

export const PatientLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik<PatientLoginFormValues>({
    initialValues: {
      emailOrMobile: "",
      password: "",
    },
    validationSchema: patientLoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null);
      try {
        const identifier = values.emailOrMobile.trim();
        const isEmail = identifier.includes("@");

        // Construct PatientLoginDto payload according to backend specification
        const payload = {
          ...(isEmail ? { email: identifier } : { mobile: identifier }),
          password: values.password,
        };

        const response = await callApi(API_ROUTES.patientLogin, payload, "POST");

        if (response) {
          const data = response.data || response;

          // Pass API response to AuthContext:
          // - Access Token -> React Context state (in-memory)
          // - Refresh Token -> Browser Cookie
          if (data?.accessToken) {
            login({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              patientId: data.patientId,
              email: data.email,
              mobile: data.mobile,
            });
          }

          navigate("/patient/profile");
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Patient login failed. Please check your credentials and try again.";
        setApiError(Array.isArray(message) ? message.join(", ") : message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className={themeStyles.auth.container}>
      {/* Ambient background glows */}
      <div className={themeStyles.layout.ambientGlowTeal} />
      <div className={themeStyles.layout.ambientGlow} />

      <div className={themeStyles.auth.card}>
        {/* Left Hero Column */}
        <div className={themeStyles.auth.heroCol}>
          <div className={themeStyles.layout.ambientGlowTeal} />

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ABHA Digital Health Vault
            </div>

            <div className="space-y-2">
              <h2 className={themeStyles.typography.h2White}>
                Your Personal Health Record Vault
              </h2>
              <p className={themeStyles.typography.bodyWhite}>
                Access all your medical histories, active prescriptions, lab test
                results, and doctor consultations across hospitals nationwide in one place.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Consolidated Medical Records</span>
                  <span className="text-slate-400 text-[11px]">Instant access to past diagnoses and lab reports</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Emergency Allergy Safety</span>
                  <span className="text-slate-400 text-[11px]">Prevent critical adverse drug interactions</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Seamless Consent Controls</span>
                  <span className="text-slate-400 text-[11px]">Grant or revoke doctor access on demand</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span>256-Bit Encrypted Vault</span>
            <span className="font-mono text-emerald-400 font-bold">ABDM & HIPAA Compliant</span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className={themeStyles.auth.formCol}>
          <div className="space-y-2 mb-6">
            <h3 className={themeStyles.typography.h2}>
              Sign In to Patient Portal
            </h3>
            <p className={themeStyles.typography.subtext}>
              Enter your registered mobile number or email address to access your health vault.
            </p>
          </div>

          {apiError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="emailOrMobile"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email Address or Mobile Number
              </label>
              <Input
                id="emailOrMobile"
                name="emailOrMobile"
                type="text"
                placeholder="patient@email.com or +919876543210"
                icon={<Mail className="w-4 h-4" />}
                value={formik.values.emailOrMobile}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.emailOrMobile && formik.errors.emailOrMobile
                    ? formik.errors.emailOrMobile
                    : undefined
                }
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Please contact ArogyaLink support or use reset password flow.");
                  }}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && formik.errors.password
                    ? formik.errors.password
                    : undefined
                }
              />
            </div>

            <Button
              type="submit"
              variant="emerald"
              className="w-full h-11 text-xs font-bold shadow-md shadow-emerald-700/20 cursor-pointer mt-2"
              loading={formik.isSubmitting}
            >
              Sign In to Patient Portal
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-600">
              New to ArogyaLink?{" "}
              <Link
                to="/patient/register"
                className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Create Free Patient Account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
              <Link
                to="/login"
                className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
              >
                Doctor Sign In
              </Link>
              <span>•</span>
              <Link
                to="/health-institute/login"
                className="font-semibold text-cyan-700 hover:text-cyan-800 hover:underline"
              >
                Hospital / Institute Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLoginPage;

