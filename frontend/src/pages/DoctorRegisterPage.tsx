import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  UserCheck,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Activity,
  User,
  CheckCircle2,
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
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl space-y-6 relative z-10">
        {/* Top Header */}
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
              NMC Interoperable Medical Network Registration
            </Badge>
          </div>
        </div>

        {/* Success Alert View */}
        {registerSuccess ? (
          <Card className="shadow-2xl border-emerald-200 bg-white p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Registration Successful!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Welcome to ArogyaLink,{" "}
                <strong className="text-slate-900">
                  Dr. {formik.values.firstName} {formik.values.lastName}
                </strong>
                ! Your doctor account has been registered with mobile{" "}
                <span className="font-mono text-teal-700">
                  {formik.values.mobile}
                </span>{" "}
                and email{" "}
                <span className="font-mono text-teal-700">
                  {formik.values.email}
                </span>
                .
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-2 max-w-md mx-auto">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Medical Credential Verification Status:
              </div>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                <li>
                  National Medical Commission (NMC) verification pending sync.
                </li>
                <li>
                  Emergency patient record lookup enabled for demo session.
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="emerald"
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto font-bold py-6 px-8 shadow-lg"
              >
                Launch Doctor Dashboard Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto font-semibold py-6 px-6"
              >
                Proceed to Sign In
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="shadow-xl border-slate-200/90 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-extrabold text-slate-900 text-center">
                Doctor Profile Registration
              </CardTitle>
              <CardDescription className="text-center text-slate-500">
                Fill in your details to get registered and gain access to
                consolidated patient history.
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

                {/* Section 1: Doctor Full Name (First, Middle, Last) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    Doctor's Full Name *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* First Name */}
                    <div>
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
                    </div>

                    {/* Middle Name (Optional) */}
                    <div>
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
                    </div>

                    {/* Last Name */}
                    <div>
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
                </div>

                {/* Section 2: Contact Information (Email & Mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                      <span>Email Address *</span>
                    </label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="doctor@hospital.org"
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

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                      <span>Mobile Number *</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Format: +919876543210
                      </span>
                    </label>
                    <Input
                      type="tel"
                      name="mobile"
                      placeholder="+919876543210"
                      value={formik.values.mobile}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.mobile && formik.errors.mobile
                          ? formik.errors.mobile
                          : undefined
                      }
                      icon={<Phone className="w-4 h-4 text-teal-600" />}
                    />
                  </div>
                </div>

                {/* Section 3: Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Password *</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Min. 6 characters
                    </span>
                  </label>

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create secure password"
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
                      aria-label="Toggle password view"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formik.values.password && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-600">
                        <span>Password Strength:</span>
                        <span className="font-bold">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formik.values.agreeTerms}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4 shrink-0"
                    />
                    <span>
                      I verify that I am a licensed medical practitioner under
                      the National Medical Commission (NMC). I agree to
                      ArogyaLink's{" "}
                      <a
                        href="#"
                        className="text-teal-700 underline font-semibold"
                      >
                        Terms of Use
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-teal-700 underline font-semibold"
                      >
                        ABDM Patient Data Privacy Guidelines
                      </a>
                      .
                    </span>
                  </label>
                  {formik.touched.agreeTerms && formik.errors.agreeTerms && (
                    <p className="text-xs text-red-600 font-medium pl-6">
                      {formik.errors.agreeTerms}
                    </p>
                  )}
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
                      Registering Doctor Profile...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Complete Doctor Registration
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-slate-100 bg-slate-50/50 py-4 rounded-b-2xl">
              <div className="text-xs text-slate-600">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-bold text-teal-700 hover:underline"
                >
                  Doctor Login Here
                </Link>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DoctorRegisterPage;
