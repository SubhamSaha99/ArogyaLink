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
  ShieldCheck,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

/**
 * Health Institute Type Options
 */
export const HEALTH_INSTITUTE_TYPES = [
  { id: 1, label: "General / Multispecialty Hospital" },
  { id: 2, label: "Nursing Home & Care Center" },
  { id: 3, label: "Specialty & Dental Clinic" },
];

/**
 * Validation schema matching backend HealthInstituteRegDto:
 * - email: valid email address
 * - healthInstituteName: non-empty string
 * - healthInstituteType: positive integer number
 * - password: min 6 characters
 * - agreeTerms: boolean true
 */
const healthInstituteRegistrationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Invalid email address")
    .required("Institute email address is required"),
  healthInstituteName: Yup.string()
    .trim()
    .required("Health Institute / Hospital name is required"),
  healthInstituteType: Yup.number()
    .required("Please select an institute category")
    .min(1, "Please select a valid institute type"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    "You must agree to ABDM Health Data Regulations & Compliance.",
  ),
});

export interface HealthInstituteRegFormValues {
  email: string;
  healthInstituteName: string;
  healthInstituteType: number;
  password: string;
  agreeTerms: boolean;
}

export const HealthInstituteRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registeredInstituteId, setRegisteredInstituteId] = useState<
    string | null
  >(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik<HealthInstituteRegFormValues>({
    initialValues: {
      email: "",
      healthInstituteName: "",
      healthInstituteType: 1,
      password: "",
      agreeTerms: true,
    },
    validationSchema: healthInstituteRegistrationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null);
      try {
        const payload = {
          email: values.email.trim(),
          healthInstituteName: values.healthInstituteName.trim(),
          healthInstituteType: Number(values.healthInstituteType),
          password: values.password,
        };

        const response = await callApi(
          API_ROUTES.healthInstituteRegistration,
          payload,
          "POST",
        );

        if (response) {
          const data = response.data || response;
          if (data?.healthInstituteId) {
            setRegisteredInstituteId(data.healthInstituteId);
          }
          setRegisterSuccess(true);
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Health Institute registration failed. Please try again.";
        setApiError(Array.isArray(message) ? message.join(", ") : message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const getPasswordStrength = () => {
    const pwd = formik.values.password;
    if (!pwd) return { label: "Empty", color: "bg-slate-200", percent: 0 };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { label: "Weak", color: "bg-red-500", percent: 25 };
      case 2:
        return { label: "Fair", color: "bg-amber-500", percent: 50 };
      case 3:
        return { label: "Good", color: "bg-teal-500", percent: 75 };
      case 4:
        return { label: "Strong", color: "bg-emerald-600", percent: 100 };
      default:
        return { label: "Too Short", color: "bg-red-400", percent: 15 };
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 overflow-hidden relative z-10">
        {/* Left Hero Column (5 cols) */}
        <div className="lg:col-span-5 bg-linear-to-br from-slate-900 via-slate-900 to-cyan-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              Health Facility Registry
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Register Your Healthcare Institution
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your hospital, medical center, or clinic to the national health grid. Manage doctor appointments and roster schedules in real-time.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Fast Doctor Appointment</span>
                  <span className="text-slate-400 text-[11px]">Instant credential lookup from national registry</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">ABDM & HFR Certified</span>
                  <span className="text-slate-400 text-[11px]">National Digital Health Mission compliance</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span>Institutional Healthcare Gate</span>
            <span className="font-mono text-cyan-400">ABDM Registry Ready</span>
          </div>
        </div>

        {/* Right Form Column (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          {registerSuccess ? (
            <div className="space-y-6 text-center py-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">
                  Institute Registered Successfully!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  <strong className="text-slate-900">{formik.values.healthInstituteName}</strong> has been registered on ArogyaLink with email <span className="font-mono font-semibold text-cyan-700">{formik.values.email}</span>.
                </p>
                {registeredInstituteId && (
                  <div className="mt-2 inline-block px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-xs font-mono font-bold text-cyan-800">
                    Institute ID: {registeredInstituteId}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5 max-w-md mx-auto">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Facility Onboarding Status:
                </div>
                <p className="text-[11px] text-slate-500">
                  ABDM Health Facility Registry gateway sync initialized. You can now sign in to complete your hospital location and department details.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="cyan"
                  onClick={() => navigate("/health-institute/login")}
                  className="font-bold text-xs h-10 px-6 cursor-pointer shadow-md"
                >
                  Proceed to Institute Sign In
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-2 mb-6">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Register Health Institute
                </h3>
                <p className="text-xs text-slate-500">
                  Create an official portal account for your Hospital, Clinic, or Diagnostic Facility.
                </p>
              </div>

              {apiError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Institute Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Hospital / Institute Name *
                  </label>
                  <Input
                    type="text"
                    name="healthInstituteName"
                    placeholder="e.g. Apollo Multispecialty Hospital"
                    icon={<Building2 className="w-4 h-4" />}
                    value={formik.values.healthInstituteName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.healthInstituteName && formik.errors.healthInstituteName
                        ? formik.errors.healthInstituteName
                        : undefined
                    }
                  />
                </div>

                {/* Institute Category Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Facility Category *
                  </label>
                  <select
                    name="healthInstituteType"
                    value={formik.values.healthInstituteType}
                    onChange={(e) =>
                      formik.setFieldValue("healthInstituteType", Number(e.target.value))
                    }
                    onBlur={formik.handleBlur}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    {HEALTH_INSTITUTE_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official Institute Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
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

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password *
                  </label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create secure password (min 6 chars)"
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
                  {formik.values.password && (
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Strength: {passwordStrength.label}</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div>
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formik.values.agreeTerms}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 h-4 w-4 shrink-0"
                    />
                    <span>
                      I verify that I represent an authorized healthcare institution and agree to ABDM Health Data Regulations & Compliance.
                    </span>
                  </label>
                  {formik.touched.agreeTerms && formik.errors.agreeTerms && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">
                      {formik.errors.agreeTerms}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="cyan"
                  className="w-full h-11 text-xs font-bold shadow-md shadow-cyan-700/20 cursor-pointer mt-2"
                  loading={formik.isSubmitting}
                >
                  Register Health Institute
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Already registered?{" "}
                  <Link
                    to="/health-institute/login"
                    className="font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
                  >
                    Sign In to Institute Terminal
                  </Link>
                </p>
                <p className="text-xs text-slate-500">
                  Are you an individual doctor?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                  >
                    Doctor Registration
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthInstituteRegisterPage;
