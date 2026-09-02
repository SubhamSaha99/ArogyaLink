import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Lock,
  Mail,
  Phone,
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
import { themeStyles } from "@/styles/themeStyles";

/**
 * Validation schema matching backend DoctorRegDto:
 * - email: valid email
 * - mobile: /^\+[1-9]{1}[0-9]{3,14}$/ (e.g. +919876543210)
 * - firstName: non-empty string
 * - middleName: optional string
 * - lastName: non-empty string
 * - password: min 6 characters
 */
const doctorRegistrationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Invalid email address")
    .required("Email address is required"),
  mobile: Yup.string()
    .trim()
    .matches(/^\+[1-9]{1}[0-9]{3,14}$/, "Invalid Mobile Number")
    .required("Mobile number is required"),
  firstName: Yup.string().trim().required("First name is required"),
  middleName: Yup.string().trim().optional(),
  lastName: Yup.string().trim().required("Last name is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    "You must agree to the medical data terms and privacy compliance.",
  ),
});

export interface DoctorRegFormValues {
  email: string;
  mobile: string;
  firstName: string;
  middleName: string;
  lastName: string;
  password: string;
  agreeTerms: boolean;
}

export const DoctorRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik<DoctorRegFormValues>({
    initialValues: {
      email: "",
      mobile: "+91",
      firstName: "",
      middleName: "",
      lastName: "",
      password: "",
      agreeTerms: true,
    },
    validationSchema: doctorRegistrationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setApiError(null);
      try {
        const payload = {
          email: values.email.trim(),
          mobile: values.mobile.trim(),
          firstName: values.firstName.trim(),
          middleName: values.middleName.trim() || undefined,
          lastName: values.lastName.trim(),
          password: values.password,
        };

        const response = await callApi(
          API_ROUTES.doctorRegistration,
          payload,
          "POST",
        );

        if (response) {
          setRegisterSuccess(true);
          const fullDoctorName = `Dr. ${payload.firstName} ${
            payload.middleName ? payload.middleName + " " : ""
          }${payload.lastName}`;
          localStorage.setItem("arogya_doctor_authenticated", "true");
          localStorage.setItem("arogya_doctor_name", fullDoctorName);
          localStorage.setItem("arogya_doctor_email", payload.email);
          localStorage.setItem("arogya_doctor_mobile", payload.mobile);
          if (response.data?.doctorId) {
            localStorage.setItem("arogya_doctor_id", response.data.doctorId);
          }
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Doctor registration failed. Please check your details and try again.";
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
    <div className={themeStyles.auth.container}>
      <div className={themeStyles.auth.card}>
        {/* Left Hero Column (5 cols) */}
        <div className={themeStyles.auth.heroCol}>
          <div className={themeStyles.layout.ambientGlowTeal} />

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              NMC Doctor Onboarding
            </div>

            <div className="space-y-2">
              <h2 className={themeStyles.typography.h2White}>
                Join the National Clinical Network
              </h2>
              <p className={themeStyles.typography.bodyWhite}>
                Register your medical practitioner credentials to access cross-facility
                health records, emergency lookups, and hospital clinical rosters.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className={themeStyles.iconBadge.teal}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Automated NMC Verification</span>
                  <span className="text-slate-400 text-[11px]">Seamless council license sync</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className={themeStyles.iconBadge.cyan}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Emergency Record Access</span>
                  <span className="text-slate-400 text-[11px]">Instant allergy and vitals history lookup</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
            <span>Verified Practitioner Access</span>
            <span className="font-mono text-teal-400 font-bold">HIPAA & ABDM Ready</span>
          </div>
        </div>

        {/* Right Form Column (7 cols) */}
        <div className={themeStyles.auth.formCol}>
          {registerSuccess ? (
            <div className="space-y-6 text-center py-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className={themeStyles.typography.h3}>
                  Registration Complete!
                </h3>
                <p className={themeStyles.typography.body}>
                  Welcome, <strong className="text-slate-900">Dr. {formik.values.firstName} {formik.values.lastName}</strong>! Your doctor account has been registered with mobile <span className={themeStyles.typography.monoTeal}>{formik.values.mobile}</span> and email <span className={themeStyles.typography.monoTeal}>{formik.values.email}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-1.5 max-w-md mx-auto">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Medical Credential Status:
                </div>
                <p className={themeStyles.typography.muted}>
                  NMC verification pending registry synchronization. Emergency history lookup enabled.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  variant="teal"
                  onClick={() => navigate("/dashboard")}
                  className="font-bold text-xs h-10 px-6 cursor-pointer shadow-md rounded-xl"
                >
                  Doctor Dashboard Demo
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="font-semibold text-xs h-10 px-6 cursor-pointer rounded-xl"
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-2 mb-6">
                <h3 className={themeStyles.typography.h2}>
                  Register Doctor Profile
                </h3>
                <p className={themeStyles.typography.subtext}>
                  Enter your official details to create a verified practitioner account.
                </p>
              </div>

              {apiError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Doctor Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Doctor's Full Name *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name *"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.firstName && formik.errors.firstName
                          ? formik.errors.firstName
                          : undefined
                      }
                    />
                    <Input
                      type="text"
                      name="middleName"
                      placeholder="Middle Name (Optional)"
                      value={formik.values.middleName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.middleName && formik.errors.middleName
                          ? formik.errors.middleName
                          : undefined
                      }
                    />
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name *"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.lastName && formik.errors.lastName
                          ? formik.errors.lastName
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Contact: Email & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="doctor@hospital.org"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile Number *
                    </label>
                    <Input
                      type="tel"
                      name="mobile"
                      placeholder="+919876543210"
                      icon={<Phone className="w-4 h-4" />}
                      value={formik.values.mobile}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.mobile && formik.errors.mobile
                          ? formik.errors.mobile
                          : undefined
                      }
                    />
                  </div>
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
                      className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4 shrink-0"
                    />
                    <span>
                      I verify that I am a certified medical practitioner under the National Medical Commission (NMC).
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
                  variant="teal"
                  className="w-full h-11 text-xs font-bold shadow-md shadow-teal-700/20 cursor-pointer mt-2"
                  loading={formik.isSubmitting}
                >
                  Create Doctor Account
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Already registered?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-teal-700 hover:text-teal-800 hover:underline"
                  >
                    Sign In to Portal
                  </Link>
                </p>
                <p className="text-xs text-slate-500">
                  Hospital or Clinic?{" "}
                  <Link
                    to="/health-institute/register"
                    className="font-semibold text-cyan-700 hover:text-cyan-800 hover:underline"
                  >
                    Register Health Institute
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

export default DoctorRegisterPage;
