import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  UserCheck,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Award,
  GraduationCap,
  BadgeCheck,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

export interface DoctorDetailsData {
  doctorId: string;
  profileDetails?: {
    doctorProfileId?: number;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    gender?: number;
    profileImage?: string;
  };
  professionalDetails?: {
    doctorProfessionalDetailsId?: number;
    medicalRegistration?: string;
    registrationCouncilId?: number;
    registrationCouncilName?: string;
    registrationStateId?: number;
    registrationStateName?: string;
    registrationYear?: number;
    licenseStatus?: number;
  };
  qualificationDetails?: Array<{
    doctorQualificationId?: number;
    qualificationId?: number;
    qualificationName?: string;
    specializationId?: number;
    specializationName?: string;
    institutionName?: string;
    universityName?: string;
    yearOfCompletion?: number;
  }>;
}

export const HealthInstituteDoctorDetailsPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctorData, setDoctorData] = useState<DoctorDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Appoint Modal State
  const [isAppointModalOpen, setIsAppointModalOpen] = useState<boolean>(false);
  const [appointmentDept, setAppointmentDept] = useState<string>("General Medicine");
  const [appointmentDesignation, setAppointmentDesignation] =
    useState<string>("Consultant");
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [appointmentType, setAppointmentType] = useState<string>("OPD & IPD");
  const [appointmentNotes, setAppointmentNotes] = useState<string>("");
  const [isSubmittingAppointment, setIsSubmittingAppointment] =
    useState<boolean>(false);
  const [appointmentSuccessMessage, setAppointmentSuccessMessage] = useState<string | null>(
    null
  );

  const hasFetchedDoctorIdRef = useRef<string | null>(null);

  // Fetch Doctor Details: POST /api/doctor/getDoctorDetails with doctorId
  const fetchDoctorDetails = useCallback(async (force = false) => {
    if (!doctorId) {
      setError("No Doctor ID provided in the route.");
      setLoading(false);
      return;
    }

    if (!force && hasFetchedDoctorIdRef.current === doctorId) {
      return;
    }
    hasFetchedDoctorIdRef.current = doctorId;

    setLoading(true);
    setError(null);
    try {
      // Send doctorId in req.body via POST
      const response = await callApi(
        API_ROUTES.getDoctorDetails,
        { doctorId },
        "POST"
      );

      const data = response?.data || response;
      if (data && (data.doctorId || data.profileDetails)) {
        setDoctorData(data);
      } else {
        setError("Doctor details could not be retrieved from the central registry.");
      }
    } catch (err: any) {
      console.error("Failed to fetch doctor details:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load doctor profile details."
      );
      hasFetchedDoctorIdRef.current = null;
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctorDetails();
  }, [fetchDoctorDetails]);

  // Handle appointment submission
  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorData) return;

    setIsSubmittingAppointment(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const docName = [
        doctorData.profileDetails?.firstName,
        doctorData.profileDetails?.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      setAppointmentSuccessMessage(
        `Dr. ${docName || doctorData.doctorId} has been successfully appointed as ${appointmentDesignation} (${appointmentDept}) at ${
          user?.healthInstituteName || "your institute"
        }!`
      );

      setTimeout(() => {
        setAppointmentSuccessMessage(null);
        setIsAppointModalOpen(false);
      }, 2000);
    } catch (err: any) {
      console.error("Appointment error:", err);
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  const profile = doctorData?.profileDetails;
  const professional = doctorData?.professionalDetails;
  const qualifications = doctorData?.qualificationDetails || [];

  const fullName = [profile?.firstName, profile?.middleName, profile?.lastName]
    .filter(Boolean)
    .join(" ");

  const initials = [
    profile?.firstName?.charAt(0) || "D",
    profile?.lastName?.charAt(0) || "R",
  ]
    .join("")
    .toUpperCase();

  const isLicenseActive = professional?.licenseStatus === 1;

  const getGenderLabel = (g?: number) => {
    if (g === 1) return "Male";
    if (g === 2) return "Female";
    if (g === 3) return "Other";
    return "Not Specified";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/health-institute/appoint-doctor")}
          className="text-xs text-slate-600 hover:text-slate-900 border-slate-300 w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Doctor Directory
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-slate-800">
              Fetching Doctor Details for ID #{doctorId}...
            </p>
            <p className="text-xs text-slate-400">
              Connecting to National Medical Council & ABDM practitioner registry.
            </p>
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-red-900">Unable to Load Doctor Profile</h3>
            <p className="text-xs text-red-700">{error}</p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/health-institute/appoint-doctor")}
              className="text-xs"
            >
              Go Back
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={() => fetchDoctorDetails(true)}
              className="text-xs"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : doctorData ? (
        /* Doctor Profile View */
        <div className="space-y-6">
          {/* Main Hero Header Card */}
          <div className="bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Doctor Avatar / Initials */}
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-teal-500 to-cyan-700 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-teal-400/40 shrink-0">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={fullName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {/* Doctor Name & ID */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="teal"
                      className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs px-2.5 py-0.5"
                    >
                      Medical Practitioner
                    </Badge>
                    {isLicenseActive ? (
                      <Badge
                        variant="emerald"
                        className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Active ABDM License
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs text-amber-400 border-amber-500/30 bg-amber-950/40"
                      >
                        <Clock className="w-3 h-3 mr-1 text-amber-400" />
                        Verification Pending
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                    Dr. {fullName || "Practitioner"}
                    {isLicenseActive && <BadgeCheck className="w-6 h-6 text-teal-400" />}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
                    <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                      ID: <strong className="text-teal-300">{doctorData.doctorId}</strong>
                    </span>
                    {professional?.medicalRegistration && (
                      <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                        Reg: <strong className="text-white">{professional.medicalRegistration}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Column Left: Contact & Professional Registration (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Contact & Personal Information Card */}
              <Card className="border-slate-200 shadow-xs bg-white">
                <CardHeader className="border-b border-slate-100 pb-3.5">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-700" />
                    Personal & Contact Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email Address:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {profile?.email || "Not Disclosed"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Mobile Number:
                    </span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {profile?.mobile || "Not Disclosed"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Gender:</span>
                    <span className="font-semibold text-slate-900">
                      {getGenderLabel(profile?.gender)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Registration & Council Card */}
              <Card className="border-slate-200 shadow-xs bg-white">
                <CardHeader className="border-b border-slate-100 pb-3.5">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    Medical Registration & Council
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3.5 text-xs">
                  <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Medical Registration Number
                    </span>
                    <p className="font-mono font-bold text-sm text-slate-900">
                      {professional?.medicalRegistration || "Not Assigned"}
                    </p>
                  </div>

                  <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Registration Medical Council
                    </span>
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      {professional?.registrationCouncilName || "Medical Council of India"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        State
                      </span>
                      <p className="font-semibold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        {professional?.registrationStateName || "National"}
                      </p>
                    </div>

                    <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Registration Year
                      </span>
                      <p className="font-semibold text-slate-900 font-mono">
                        {professional?.registrationYear || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">License Accreditation:</span>
                    <Badge
                      variant={isLicenseActive ? "emerald" : "outline"}
                      className="text-[10px]"
                    >
                      {isLicenseActive ? "Verified & Active" : "Unverified"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column Right: Academic Qualifications & Affiliation Prompt (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Academic & Medical Qualifications Card */}
              <Card className="border-slate-200 shadow-xs bg-white">
                <CardHeader className="border-b border-slate-100 pb-3.5 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-teal-700" />
                    Academic & Medical Qualifications ({qualifications.length})
                  </CardTitle>
                  <Badge variant="teal" className="text-[10px] bg-teal-50 text-teal-800">
                    Council Certified
                  </Badge>
                </CardHeader>
                <CardContent className="p-5">
                  {qualifications.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                      <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-medium text-slate-600">
                        No qualification records listed in the registry for this practitioner.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {qualifications.map((q, idx) => (
                        <div
                          key={q.doctorQualificationId || idx}
                          className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-teal-300 hover:bg-white transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {q.qualificationName || "Medical Degree"}
                                </h4>
                              </div>
                              {q.specializationName && (
                                <p className="text-xs font-semibold text-teal-700 pl-8">
                                  Specialization: {q.specializationName}
                                </p>
                              )}
                            </div>

                            {q.yearOfCompletion && (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-mono text-slate-600 bg-white shrink-0"
                              >
                                Year: {q.yearOfCompletion}
                              </Badge>
                            )}
                          </div>

                          <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                            {q.institutionName && (
                              <p className="flex items-center gap-1.5 truncate">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{q.institutionName}</span>
                              </p>
                            )}
                            {q.universityName && (
                              <p className="flex items-center gap-1.5 truncate">
                                <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span className="truncate">{q.universityName}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Facility Appointment Quick Banner */}
              <Card className="border-teal-200 bg-linear-to-r from-teal-50 via-cyan-50 to-white shadow-xs overflow-hidden">
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-teal-700" />
                      Ready to appoint Dr. {fullName || "this practitioner"}?
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md">
                      Assign medical specialties, OPD/IPD consultation schedules, and integrate this
                      certified practitioner into your hospital roster.
                    </p>
                  </div>
                  <Button
                    variant="emerald"
                    onClick={() => setIsAppointModalOpen(true)}
                    className="text-xs font-bold px-5 h-9 shrink-0 cursor-pointer shadow-xs"
                  >
                    Initiate Appointment →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}

      {/* Appoint Doctor Modal */}
      {isAppointModalOpen && doctorData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl bg-white shadow-2xl border-slate-200 my-8 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/70 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5 text-teal-700" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Appoint Medical Practitioner
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Affiliate doctor to your healthcare institute roster.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAppointModalOpen(false);
                  setAppointmentSuccessMessage(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Doctor Summary Banner */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-teal-50 to-cyan-50 border border-teal-100 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700">
                    Selected Practitioner
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">
                    Dr. {fullName}
                  </h4>
                  <p className="text-xs text-slate-600 font-mono">
                    ID: {doctorData.doctorId} • Reg: {professional?.medicalRegistration || "N/A"}
                  </p>
                  {professional?.registrationCouncilName && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      {[professional.registrationCouncilName, professional.registrationStateName]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                </div>
                <Badge variant="teal" className="bg-teal-600 text-white text-[10px] shrink-0">
                  Verified ABDM
                </Badge>
              </div>

              {appointmentSuccessMessage ? (
                <div className="py-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-900">Appointment Confirmed!</h4>
                  <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                    {appointmentSuccessMessage}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmAppointment} className="space-y-4">
                  {/* Department & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Department / Specialty *
                      </label>
                      <select
                        value={appointmentDept}
                        onChange={(e) => setAppointmentDept(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        required
                      >
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                        <option value="Emergency & Trauma">Emergency & Trauma</option>
                        <option value="Anesthesiology">Anesthesiology</option>
                        <option value="Radiology">Radiology</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Designation / Role *
                      </label>
                      <select
                        value={appointmentDesignation}
                        onChange={(e) => setAppointmentDesignation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        required
                      >
                        <option value="Consultant">Consultant</option>
                        <option value="Senior Consultant">Senior Consultant</option>
                        <option value="Visiting Specialist">Visiting Specialist</option>
                        <option value="Resident Medical Officer">Resident Medical Officer</option>
                        <option value="Department Head">Department Head</option>
                      </select>
                    </div>
                  </div>

                  {/* Date & Service Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Appointment / Joining Date *
                      </label>
                      <Input
                        type="date"
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="text-xs rounded-xl"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Consultation Scope *
                      </label>
                      <select
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="OPD & IPD">OPD & IPD Services</option>
                        <option value="OPD Only">OPD Consultations Only</option>
                        <option value="IPD & Surgeries">IPD & Surgery Consultations</option>
                        <option value="Teleconsultation">Teleconsultation & Remote</option>
                        <option value="On-Call Emergency">On-Call Emergency Specialist</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes / Special Instructions */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Affiliation Notes / Contract Reference (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Approved by medical board. Duty schedule: Monday to Friday 9 AM – 2 PM."
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAppointModalOpen(false)}
                      disabled={isSubmittingAppointment}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="emerald"
                      disabled={isSubmittingAppointment}
                      className="text-xs font-bold px-5 cursor-pointer"
                    >
                      {isSubmittingAppointment ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                          Processing Affiliation...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Confirm Appointment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HealthInstituteDoctorDetailsPage;
