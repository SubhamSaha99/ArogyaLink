import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { useAuth } from "@/context/AuthContext";

/**
 * Health Institute Login Validation Schema matching HealthInstituteLoginDto:
 * - email: valid email
 * - password: min 6 characters
 */
const healthInstituteLoginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Institute email address is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export interface HealthInstituteLoginFormValues {
  email: string;
  password: string;
}

export const HealthInstituteLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik<HealthInstituteLoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: healthInstituteLoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null);
      try {
        const payload = {
          email: values.email.trim(),
          password: values.password,
        };

        const response = await callApi(
          API_ROUTES.healthInstituteLogin,
          payload,
          "POST",
        );

        if (response) {
          const data = response.data || response;

          if (data?.accessToken) {
            login({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              healthInstitutePrimaryKey:
                data.healthInstitutePrimaryKey || data.userPrimaryKey,
              userPrimaryKey:
                data.userPrimaryKey || data.healthInstitutePrimaryKey,
              healthInstituteId: data.healthInstituteId,
              healthInstituteName: data.healthInstituteName,
              healthInstituteType: data.healthInstituteType,
              email: data.email,
            });
          }

          navigate("/health-institute/profile");
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Institute login failed. Please check your credentials and try again.";
        setApiError(Array.isArray(message) ? message.join(", ") : message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 overflow-hidden relative z-10">
        {/* Left Hero Column */}
        <div className="bg-linear-to-br from-slate-900 via-slate-900 to-cyan-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              Health Facility Registry
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Institute Access Terminal
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empower your healthcare facility to appoint verified doctors, synchronize clinical rosters, and streamline ABDM compliance.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Central Doctor Directory</span>
                  <span className="text-slate-400 text-[11px]">Instant credential & council verification</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Facility Department Manager</span>
                  <span className="text-slate-400 text-[11px]">OPD/IPD schedule and roster coordination</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span>ABDM National Health Network</span>
            <span className="font-mono text-cyan-400">ABDM & HFR Certified</span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="space-y-2 mb-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Sign In to Institute Terminal
            </h3>
            <p className="text-xs text-slate-500">
              Enter your registered health facility email to access the dashboard.
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
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Institute Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="contact@hospital.org"
                icon={<Mail className="w-4 h-4" />}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.email && formik.errors.email
                    ? formik.errors.email
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
                    alert("Please contact system administrator or support team.");
                  }}
                  className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800"
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
              variant="cyan"
              className="w-full h-11 text-xs font-bold shadow-md shadow-cyan-700/20 cursor-pointer mt-2"
              loading={formik.isSubmitting}
            >
              Sign In to Institute Terminal
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-600">
              Not registered on ArogyaLink?{" "}
              <Link
                to="/health-institute/register"
                className="font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
              >
                Register Health Institute
              </Link>
            </p>
            <p className="text-xs text-slate-500">
              Are you an individual doctor?{" "}
              <Link
                to="/login"
                className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
              >
                Doctor Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthInstituteLoginPage;
