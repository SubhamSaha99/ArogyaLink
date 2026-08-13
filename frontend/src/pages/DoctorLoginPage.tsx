import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Stethoscope,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { useAuth } from "@/context/AuthContext";

/**
 * Doctor Login Formik Validation Schema matching DoctorLoginDto:
 * - email (optional if mobile provided)
 * - mobile (optional if email provided, regex: /^\+[1-9]{1}[0-9]{3,14}$/)
 * - password: string min 6 chars
 */
const doctorLoginSchema = Yup.object().shape({
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

export interface DoctorLoginFormValues {
  emailOrMobile: string;
  password: string;
}

export const DoctorLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik<DoctorLoginFormValues>({
    initialValues: {
      emailOrMobile: "",
      password: "",
    },
    validationSchema: doctorLoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null);
      try {
        const identifier = values.emailOrMobile.trim();
        const isEmail = identifier.includes("@");

        // Construct DoctorLoginDto payload according to backend specification
        const payload = {
          ...(isEmail ? { email: identifier } : { mobile: identifier }),
          password: values.password,
        };

        const response = await callApi(API_ROUTES.doctorLogin, payload, "POST");

        if (response) {
          const data = response.data || response;

          // Pass API response to AuthContext:
          // - Access Token -> React Context state (in-memory)
          // - Refresh Token -> Browser Cookie
          if (data?.accessToken) {
            login({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              doctorId: data.doctorId,
              email: data.email,
              mobile: data.mobile,
            });
          }

          navigate("/doctor/profile");
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Doctor login failed. Please check your credentials and try again.";
        setApiError(Array.isArray(message) ? message.join(", ") : message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Arogya<span className="text-teal-700">Link</span>
            </span>
          </Link>
          <div className="flex justify-center">
            <Badge variant="teal" className="text-xs px-3 py-1 gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Doctor Portal
            </Badge>
          </div>
        </div>

        <Card className="shadow-xl border-slate-200/90 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-extrabold text-slate-900 text-center">
              Doctor Sign In
            </CardTitle>
            <CardDescription className="text-center text-slate-500">
              Enter your registered Email or Mobile number to access
              consolidated patient records.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={formik.handleSubmit} className="space-y-5">
              {/* API Error Alert */}
              {apiError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Field 1: Email or Mobile */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Email or Mobile Number *</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    e.g. doctor@hospital.org or +919876543210
                  </span>
                </label>
                <Input
                  type="text"
                  name="emailOrMobile"
                  placeholder="Enter email address or +919876543210"
                  value={formik.values.emailOrMobile}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.emailOrMobile && formik.errors.emailOrMobile
                      ? formik.errors.emailOrMobile
                      : undefined
                  }
                  icon={
                    formik.values.emailOrMobile.includes("@") ? (
                      <Mail className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Phone className="w-4 h-4 text-teal-600" />
                    )
                  }
                />
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Password *
                  </label>
                  <a
                    href="#"
                    className="text-xs text-teal-700 font-semibold hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••••••"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.password && formik.errors.password
                        ? formik.errors.password
                        : undefined
                    }
                    icon={<Lock className="w-4 h-4 text-teal-600" />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <span>Keep me logged in on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="emerald"
                size="lg"
                className="w-full text-base font-bold shadow-lg shadow-emerald-600/20 py-6"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Authenticating Doctor...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Sign In to Portal
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <div className="text-center text-xs text-slate-600">
              Not registered on ArogyaLink yet?{" "}
              <Link
                to="/register"
                className="font-bold text-teal-700 hover:underline"
              >
                Register Doctor Profile
              </Link>
            </div>

            <div className="text-[11px] text-center text-slate-400">
              Protected by National Medical Commission (NMC) verification
              protocol.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DoctorLoginPage;
