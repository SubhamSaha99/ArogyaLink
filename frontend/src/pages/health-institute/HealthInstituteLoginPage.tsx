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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl pointer-events-none"></div>

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
              <Building2 className="w-3.5 h-3.5" />
              Health Institute Portal
            </Badge>
          </div>
        </div>

        <Card className="shadow-xl border-slate-200/90 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-extrabold text-slate-900 text-center">
              Institute Sign In
            </CardTitle>
            <CardDescription className="text-center text-slate-500">
              Sign in with your registered hospital or clinic email address.
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

              {/* Field 1: Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Institute Email Address *</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="contact@hospital.org"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.email && formik.errors.email
                      ? formik.errors.email
                      : undefined
                  }
                  icon={<Mail className="w-4 h-4 text-teal-600" />}
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
                    Authenticating Institute...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Sign In to Institute Portal
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <div className="text-center text-xs text-slate-600">
              Not registered your Institute on ArogyaLink yet?{" "}
              <Link
                to="/health-institute/register"
                className="font-bold text-teal-700 hover:underline"
              >
                Register Institute Account
              </Link>
            </div>

            <div className="text-[11px] text-center text-slate-400">
              Protected by Ayushman Bharat Digital Mission (ABDM) compliance protocol.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HealthInstituteLoginPage;
