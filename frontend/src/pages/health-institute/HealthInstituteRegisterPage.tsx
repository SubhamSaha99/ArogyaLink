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
  Building,
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
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl space-y-6 relative z-10">
        {/* Top Header Branding */}
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
              Health Institute Network Registration
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
                Institute Registered Successfully!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                <strong className="text-slate-900">
                  {formik.values.healthInstituteName}
                </strong>{" "}
                has been registered on ArogyaLink with email{" "}
                <span className="font-mono text-teal-700">
                  {formik.values.email}
                </span>
                .
              </p>
              {registeredInstituteId && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg inline-block text-xs text-teal-800 font-mono font-semibold">
                  Health Institute ID: {registeredInstituteId}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left space-y-2 max-w-md mx-auto">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Hospital & Facility Verification Protocol:
              </div>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                <li>ABDM Health Repository Gateway sync initiated.</li>
                <li>You can now log in to update your facility profile.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="emerald"
                size="lg"
                onClick={() => navigate("/health-institute/login")}
                className="w-full sm:w-auto font-bold py-6 px-8 shadow-lg"
              >
                Proceed to Institute Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="shadow-xl border-slate-200/90 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-extrabold text-slate-900 text-center">
                Register Health Institute
              </CardTitle>
              <CardDescription className="text-center text-slate-500">
                Create an official account for your Hospital, Clinic, or
                Diagnostic Center to integrate with ArogyaLink.
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

                {/* Field 1: Health Institute Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Institute / Hospital Name *</span>
                  </label>
                  <Input
                    type="text"
                    name="healthInstituteName"
                    placeholder="e.g. City Care Multispecialty Hospital"
                    value={formik.values.healthInstituteName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.healthInstituteName &&
                      formik.errors.healthInstituteName
                        ? formik.errors.healthInstituteName
                        : undefined
                    }
                    icon={<Building2 className="w-4 h-4 text-teal-600" />}
                  />
                </div>

                {/* Field 2: Institute Type Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Institute Category / Type *</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-teal-600">
                      <Building className="w-4 h-4" />
                    </div>
                    <select
                      name="healthInstituteType"
                      value={formik.values.healthInstituteType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-xs"
                    >
                      {HEALTH_INSTITUTE_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formik.touched.healthInstituteType &&
                    formik.errors.healthInstituteType && (
                      <p className="text-xs text-red-600 font-medium pt-0.5">
                        {formik.errors.healthInstituteType}
                      </p>
                    )}
                </div>

                {/* Field 3: Institute Official Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Official Email Address *</span>
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

                {/* Field 4: Password */}
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
                      placeholder="Create secure portal password"
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
                      I verify that I am an authorized representative of this
                      health facility. I agree to ArogyaLink's{" "}
                      <a
                        href="#"
                        className="text-teal-700 underline font-semibold"
                      >
                        Institutional Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-teal-700 underline font-semibold"
                      >
                        ABDM Data Privacy Standards
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
                      Registering Health Institute...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Register Institute Account
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-slate-100 bg-slate-50/50 py-4 rounded-b-2xl">
              <div className="text-xs text-slate-600">
                Already have an institute account?{" "}
                <Link
                  to="/health-institute/login"
                  className="font-bold text-teal-700 hover:underline"
                >
                  Institute Sign In Here
                </Link>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HealthInstituteRegisterPage;
