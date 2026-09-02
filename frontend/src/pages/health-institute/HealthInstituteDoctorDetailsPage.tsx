import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { themeStyles } from "@/styles/themeStyles";

export interface DoctorDetailsData {
  doctorPrimaryKey?: number;
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

export interface AppointMasterDataItem {
  id: number;
  name: string;
  code?: string;
}

export interface AppointDoctorMasterData {
  departments: AppointMasterDataItem[];
  designations: AppointMasterDataItem[];
  consultationScopes: AppointMasterDataItem[];
}

let cachedAppointMasterData: AppointDoctorMasterData | null = null;
let appointMasterDataInFlight: Promise<AppointDoctorMasterData> | null = null;

let cachedHealthInstitutePrimaryKey: number | null = null;
let healthInstituteDetailsInFlight: Promise<number | null> | null = null;

export const getCachedAppointDoctorMasterData = async (): Promise<AppointDoctorMasterData> => {
  if (cachedAppointMasterData) {
    return cachedAppointMasterData;
  }
  if (appointMasterDataInFlight) {
    return appointMasterDataInFlight;
  }

  appointMasterDataInFlight = (async () => {
    try {
      const response = await callApi(API_ROUTES.getAppointDoctorMasterData, null, "GET");
      const data = response?.data || response;
      cachedAppointMasterData = {
        departments: Array.isArray(data?.departments) ? data.departments : [],
        designations: Array.isArray(data?.designations) ? data.designations : [],
        consultationScopes: Array.isArray(data?.consultationScopes) ? data.consultationScopes : [],
      };
      return cachedAppointMasterData;
    } finally {
      appointMasterDataInFlight = null;
    }
  })();

  return appointMasterDataInFlight;
};

export const getCachedHealthInstitutePrimaryKey = async (): Promise<number | null> => {
  if (cachedHealthInstitutePrimaryKey !== null) {
    return cachedHealthInstitutePrimaryKey;
  }
  if (healthInstituteDetailsInFlight) {
    return healthInstituteDetailsInFlight;
  }

  healthInstituteDetailsInFlight = (async () => {
    try {
      const response = await callApi(API_ROUTES.getHealthInstituteDetails, null, "GET");
      const data = response?.data || response;
      const institutePk =
        data?.healthInstitutePrimaryKey ??
        data?.primaryKey ??
        data?.profileDetails?.healthInstitutePrimaryKey ??
        null;
      if (institutePk) {
        cachedHealthInstitutePrimaryKey = Number(institutePk);
      }
      return cachedHealthInstitutePrimaryKey;
    } finally {
      healthInstituteDetailsInFlight = null;
    }
  })();

  return healthInstituteDetailsInFlight;
};

export const HealthInstituteDoctorDetailsPage: React.FC = () => {
  const { doctorId: paramDoctorId, id: paramId } = useParams<{ doctorId?: string; id?: string }>();
  const activeRouteId = paramDoctorId || paramId;
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const stateDoctor = (location.state as any)?.doctor;
  const stateDoctorPrimaryKey = (location.state as any)?.doctorPrimaryKey;
  const stateDoctorId = (location.state as any)?.doctorId;

  const isNumericParam = Boolean(activeRouteId && /^\d+$/.test(activeRouteId));
  const initialDoctorPrimaryKey =
    stateDoctorPrimaryKey ||
    stateDoctor?.doctorPrimaryKey ||
    (isNumericParam ? Number(activeRouteId) : undefined);
  const initialDoctorId =
    stateDoctorId ||
    stateDoctor?.doctorId ||
    (!isNumericParam && activeRouteId ? activeRouteId : undefined);

  // Doctor Details State
  const [doctorData, setDoctorData] = useState<DoctorDetailsData | null>(() => {
    if (stateDoctor) {
      return {
        doctorPrimaryKey: initialDoctorPrimaryKey,
        doctorId: initialDoctorId || stateDoctor.doctorId || "",
        profileDetails: {
          firstName: stateDoctor.firstName,
          middleName: stateDoctor.middleName,
          lastName: stateDoctor.lastName,
          email: stateDoctor.email,
          mobile: stateDoctor.mobile,
          gender: stateDoctor.gender,
        },
        professionalDetails: {
          medicalRegistration: stateDoctor.medicalRegistration,
          registrationCouncilName: stateDoctor.registrationCouncilName,
          registrationStateName: stateDoctor.registrationStateName,
          licenseStatus: stateDoctor.licenseStatus,
        },
        qualificationDetails: stateDoctor.qualifications || [],
      };
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(!stateDoctor);
  const [error, setError] = useState<string | null>(null);

  // Appoint Doctor Modal State
  const [isAppointModalOpen, setIsAppointModalOpen] = useState<boolean>(false);
  const [loadingMasterData, setLoadingMasterData] = useState<boolean>(false);
  const [masterData, setMasterData] = useState<AppointDoctorMasterData>({
    departments: [],
    designations: [],
    consultationScopes: [],
  });

  // Appoint Form State
  const [appointmentDeptId, setAppointmentDeptId] = useState<string>("");
  const [appointmentDesignationId, setAppointmentDesignationId] = useState<string>("");
  const [appointmentDate, setAppointmentDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [appointmentScopeId, setAppointmentScopeId] = useState<string>("");
  const [appointmentNotes, setAppointmentNotes] = useState<string>("");
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState<boolean>(false);
  const [appointmentSuccessMessage, setAppointmentSuccessMessage] = useState<string | null>(null);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  // Fetch Doctor Details from Server: POST /api/doctor/getDoctorDetails with body payload
  const fetchDoctorDetails = useCallback(async () => {
    const docPk =
      initialDoctorPrimaryKey ??
      (isNumericParam ? Number(activeRouteId) : undefined);
    const docId =
      initialDoctorId ??
      (!isNumericParam && activeRouteId ? activeRouteId : undefined);

    if (!docPk && !docId) {
      setError("No Doctor reference provided in route parameters.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: { doctorPrimaryKey?: number; doctorId?: string } = {};
      if (docPk) payload.doctorPrimaryKey = Number(docPk);
      if (docId) payload.doctorId = docId;

      const response = await callApi(
        API_ROUTES.getDoctorDetails,
        payload,
        "POST"
      );

      const data = response?.data?.data || response?.data || response;
      if (data && (data.doctorId || data.profileDetails || data.doctorPrimaryKey)) {
        setDoctorData(data);
      } else {
        throw new Error("No details returned from practitioner registry.");
      }
    } catch (err: any) {
      console.error("Failed to fetch doctor details:", err);
      if (!doctorData) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to retrieve verified practitioner details."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [activeRouteId, isNumericParam, initialDoctorPrimaryKey, initialDoctorId, doctorData]);

  // Initial Fetch on component mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchDoctorDetails();
  }, [fetchDoctorDetails]);

  // Pre-fetch Master Data for appointment modal
  const fetchAppointMasterData = useCallback(async () => {
    setLoadingMasterData(true);
    try {
      const data = await getCachedAppointDoctorMasterData();
      setMasterData(data);
      if (data.departments.length > 0 && !appointmentDeptId) {
        setAppointmentDeptId(String(data.departments[0].id));
      }
      if (data.designations.length > 0 && !appointmentDesignationId) {
        setAppointmentDesignationId(String(data.designations[0].id));
      }
      if (data.consultationScopes.length > 0 && !appointmentScopeId) {
        setAppointmentScopeId(String(data.consultationScopes[0].id));
      }
    } catch (err) {
      console.error("Failed to load appointment master data:", err);
    } finally {
      setLoadingMasterData(false);
    }
  }, [appointmentDeptId, appointmentDesignationId, appointmentScopeId]);

  const handleOpenAppointModal = () => {
    setIsAppointModalOpen(true);
    setAppointmentSuccessMessage(null);
    setAppointmentError(null);
    fetchAppointMasterData();
  };

  // Submit Appoint Doctor Form: POST /api/healthInstitute/appointDoctor
  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentDeptId || !appointmentDesignationId || !appointmentScopeId) {
      setAppointmentError("Please complete all required fields (*).");
      return;
    }

    const docPk =
      doctorData?.doctorPrimaryKey ??
      initialDoctorPrimaryKey ??
      (isNumericParam ? Number(activeRouteId) : null);

    if (!docPk) {
      setAppointmentError("Missing doctor primary key reference for appointment.");
      return;
    }

    setIsSubmittingAppointment(true);
    setAppointmentError(null);
    setAppointmentSuccessMessage(null);

    try {
      const institutePk =
        user?.healthInstitutePrimaryKey ||
        (await getCachedHealthInstitutePrimaryKey()) ||
        1;

      const payload = {
        doctorPrimaryKey: Number(docPk),
        healthInstitutePrimaryKey: Number(institutePk),
        departmentId: Number(appointmentDeptId),
        designationId: Number(appointmentDesignationId),
        joiningDate: appointmentDate,
        consultationScopeId: Number(appointmentScopeId),
        notes: appointmentNotes.trim() || undefined,
      };

      const response = await callApi(API_ROUTES.appointDoctor, payload, "POST");
      const resData = response?.data || response;

      setAppointmentSuccessMessage(
        resData?.message ||
          `Dr. ${getFullName()} has been officially appointed to your facility.`
      );

      setTimeout(() => {
        setIsAppointModalOpen(false);
        navigate("/health-institute/appointed-doctors");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to appoint doctor:", err);
      setAppointmentError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to appoint doctor. Please verify details and try again."
      );
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  const profile = doctorData?.profileDetails;
  const professional = doctorData?.professionalDetails;
  const qualifications = doctorData?.qualificationDetails || [];

  const getFullName = () => {
    const parts = [profile?.firstName, profile?.middleName, profile?.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Medical Practitioner";
  };

  const getInitials = () => {
    const first = profile?.firstName?.charAt(0) || "D";
    const last = profile?.lastName?.charAt(0) || "R";
    return `${first}${last}`.toUpperCase();
  };

  const getGenderLabel = (g?: number) => {
    if (g === 1) return "Male";
    if (g === 2) return "Female";
    if (g === 3) return "Other";
    return "Not Disclosed";
  };

  const isLicenseActive =
    professional?.licenseStatus === 1 || professional?.licenseStatus === undefined;
  const fullName = getFullName();

  return (
    <div className={themeStyles.layout.pageContainer}>
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/health-institute/appoint-doctor")}
          className="text-xs text-slate-600 hover:text-cyan-700 border-slate-200 cursor-pointer h-9 px-3 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Doctor Directory
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDoctorDetails}
            disabled={loading}
            className="text-xs text-slate-700 border-slate-200 h-9 px-3 rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-cyan-600" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="cyan"
            size="sm"
            onClick={handleOpenAppointModal}
            className="text-xs font-bold h-9 px-4 cursor-pointer shadow-md rounded-xl"
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            Appoint to Institute
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <Alert variant="destructive" className="p-4">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <AlertDescription className="text-xs font-semibold">{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading Skeleton */}
      {loading && !doctorData ? (
        <div className={themeStyles.state.loading}>
          <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            Fetching verified practitioner profile...
          </p>
          <p className={themeStyles.typography.subtext}>
            Querying NMC doctor registry, state councils, and medical credentials.
          </p>
        </div>
      ) : doctorData ? (
        <div className="space-y-6">
          {/* Hero Profile Overview Card */}
          <div className={themeStyles.layout.headerBannerDark}>
            <div className={themeStyles.layout.ambientGlow} />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <Avatar className={themeStyles.avatar.hero}>
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="cyan"
                      className="text-xs px-3 py-0.5 font-bold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Verified Practitioner
                    </Badge>

                    {isLicenseActive ? (
                      <Badge
                        variant="outline"
                        className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-950/40 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        License Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs text-amber-400 border-amber-500/30 bg-amber-950/40"
                      >
                        Unverified
                      </Badge>
                    )}
                  </div>

                  <h1 className={themeStyles.combine(themeStyles.typography.h1White, "flex items-center gap-2")}>
                    Dr. {fullName}
                    {isLicenseActive && (
                      <BadgeCheck className="w-6 h-6 text-cyan-400 shrink-0" />
                    )}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-mono">
                    <span>
                      Doctor ID:{" "}
                      <strong className="text-cyan-300">
                        {doctorData.doctorId}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Medical Reg:{" "}
                      <strong className="text-white">
                        {professional?.medicalRegistration || "Not Assigned"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-3 relative z-10 shrink-0">
                <Button
                  variant="cyan"
                  onClick={handleOpenAppointModal}
                  className="font-bold text-xs px-6 py-2.5 h-auto cursor-pointer shadow-lg rounded-xl"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Appoint to Institute
                </Button>
              </div>
            </div>
          </div>

          {/* Details Section Grid */}
          <div className={themeStyles.layout.split12}>
            {/* Column Left: Contact Info & Medical Registration (5 cols) */}
            <div className={themeStyles.layout.col5}>
              {/* Personal & Contact Details Card */}
              <Card className={themeStyles.card.base}>
                <CardHeader className="border-b border-slate-100 pb-3.5">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-700" />
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
              <Card className="border-slate-200 shadow-xs bg-white rounded-2xl">
                <CardHeader className="border-b border-slate-100 pb-3.5">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-700" />
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
                      <Building2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      {professional?.registrationCouncilName || "Medical Council of India"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        State
                      </span>
                      <p className="font-semibold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
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
                </CardContent>
              </Card>
            </div>

            {/* Column Right: Academic Qualifications & Affiliation Prompt (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Academic & Medical Qualifications Card */}
              <Card className="border-slate-200 shadow-xs bg-white rounded-2xl">
                <CardHeader className="border-b border-slate-100 pb-3.5 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-700" />
                    Academic & Medical Qualifications ({qualifications.length})
                  </CardTitle>
                  <Badge variant="cyan" className="text-[10px]">
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
                          className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-cyan-300 hover:bg-white transition-all space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {q.qualificationName || "Medical Degree"}
                                </h4>
                              </div>
                              {q.specializationName && (
                                <p className="text-xs font-semibold text-cyan-700 pl-8">
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
                                <Award className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
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
              <Card className="border-cyan-200 bg-linear-to-r from-cyan-50/70 via-teal-50/50 to-white shadow-xs rounded-2xl overflow-hidden">
                <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-cyan-700" />
                      Ready to appoint Dr. {fullName || "this practitioner"}?
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md">
                      Assign medical specialties, OPD/IPD consultation schedules, and integrate this
                      certified practitioner into your hospital roster.
                    </p>
                  </div>
                  <Button
                    variant="cyan"
                    onClick={handleOpenAppointModal}
                    className="text-xs font-bold px-5 h-9 shrink-0 cursor-pointer shadow-xs rounded-xl"
                  >
                    Initiate Appointment →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}

      {/* Appoint Doctor Dialog using shadcn Dialog */}
      <Dialog
        open={isAppointModalOpen && Boolean(doctorData)}
        onOpenChange={(open) => {
          if (!open) {
            setIsAppointModalOpen(false);
            setAppointmentSuccessMessage(null);
            setAppointmentError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white rounded-3xl border-slate-200 shadow-2xl">
          <DialogHeader className="p-6 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5 text-cyan-700" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Appoint Medical Practitioner
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Affiliate Dr. {fullName} to your healthcare institute roster.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-5">
            {/* Doctor Summary Banner */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-cyan-50 to-teal-50 border border-cyan-100 flex items-center justify-between gap-4">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-700">
                  Selected Practitioner
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                  Dr. {fullName}
                </h4>
                <p className="text-xs text-slate-600 font-mono">
                  ID: {doctorData?.doctorId} • Reg: {professional?.medicalRegistration || "N/A"}
                </p>
                {professional?.registrationCouncilName && (
                  <p className="text-[11px] text-slate-500 font-medium">
                    {[professional.registrationCouncilName, professional.registrationStateName]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                )}
              </div>
              <Badge variant="cyan" className="text-[10px] shrink-0 font-bold">
                Verified ABDM
              </Badge>
            </div>

            {appointmentError && (
              <Alert variant="destructive" className="p-3">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs font-medium">
                  {appointmentError}
                </AlertDescription>
              </Alert>
            )}

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
              <form onSubmit={handleConfirmAppointment} id="appoint-doctor-form" className="space-y-4">
                {/* Department & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Department / Specialty *
                    </label>
                    <select
                      value={appointmentDeptId}
                      onChange={(e) => setAppointmentDeptId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer disabled:bg-slate-50"
                      required
                      disabled={loadingMasterData}
                    >
                      {masterData.departments.length === 0 ? (
                        <option value="">{loadingMasterData ? "Loading departments..." : "No departments found"}</option>
                      ) : (
                        masterData.departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Designation / Role *
                    </label>
                    <select
                      value={appointmentDesignationId}
                      onChange={(e) => setAppointmentDesignationId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer disabled:bg-slate-50"
                      required
                      disabled={loadingMasterData}
                    >
                      {masterData.designations.length === 0 ? (
                        <option value="">{loadingMasterData ? "Loading designations..." : "No designations found"}</option>
                      ) : (
                        masterData.designations.map((desig) => (
                          <option key={desig.id} value={desig.id}>
                            {desig.name}
                          </option>
                        ))
                      )}
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
                      value={appointmentScopeId}
                      onChange={(e) => setAppointmentScopeId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer disabled:bg-slate-50"
                      required
                      disabled={loadingMasterData}
                    >
                      {masterData.consultationScopes.length === 0 ? (
                        <option value="">{loadingMasterData ? "Loading scopes..." : "No consultation scopes found"}</option>
                      ) : (
                        masterData.consultationScopes.map((scope) => (
                          <option key={scope.id} value={scope.id}>
                            {scope.name}
                          </option>
                        ))
                      )}
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
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </form>
            )}
          </div>

          {!appointmentSuccessMessage && (
            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAppointModalOpen(false);
                  setAppointmentError(null);
                  setAppointmentSuccessMessage(null);
                }}
                disabled={isSubmittingAppointment}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="appoint-doctor-form"
                variant="cyan"
                disabled={isSubmittingAppointment}
                className="text-xs font-bold px-5 cursor-pointer rounded-xl"
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
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthInstituteDoctorDetailsPage;
