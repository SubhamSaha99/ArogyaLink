import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  RefreshCw,
  Edit,
  Camera,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Activity,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { themeStyles } from "@/styles/themeStyles";

export interface PatientProfileDetails {
  patientProfileId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  age?: number;
  gender?: number;
  profileImage?: string;
  address?: string;
  stateId?: number;
  stateName?: string;
  districtId?: number;
  districtName?: string;
  pincode?: number;
}

export interface PatientDetailsResponse {
  patientPrimaryKey?: number;
  patientId: string;
  patientProfile?: PatientProfileDetails;
}

export interface MasterDataItem {
  id: number;
  name: string;
  code?: string;
}

export const getGenderLabel = (gender?: number) => {
  switch (gender) {
    case 1:
      return "Male";
    case 2:
      return "Female";
    case 3:
      return "Other";
    default:
      return "Not Specified";
  }
};

export const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase}${cleanPath}`;
};

const patientProfileEditSchema = Yup.object().shape({
  firstName: Yup.string().trim().required("First name is required"),
  middleName: Yup.string().trim().optional(),
  lastName: Yup.string().trim().required("Last name is required"),
  dateOfBirth: Yup.string()
    .matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, "Must be in YYYY-MM-DD format")
    .optional()
    .nullable(),
  age: Yup.number()
    .min(0, "Age cannot be negative")
    .max(150, "Invalid age")
    .optional()
    .nullable(),
  gender: Yup.number()
    .oneOf([1, 2, 3], "Invalid gender selection")
    .optional()
    .nullable(),
  address: Yup.string()
    .max(300, "Address cannot exceed 300 characters")
    .optional()
    .nullable(),
  stateId: Yup.number().optional().nullable(),
  districtId: Yup.number().optional().nullable(),
  pincode: Yup.number()
    .min(100000, "Must be a valid 6-digit postal code")
    .max(999999, "Must be a valid 6-digit postal code")
    .optional()
    .nullable(),
});

interface EditPatientFormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  age: number | "";
  gender: number | "";
  address: string;
  stateId: number | "";
  districtId: number | "";
  pincode: number | "";
}

export const PatientProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [details, setDetails] = useState<PatientDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingError, setFetchingError] = useState<string | null>(null);

  // States & Districts for Edit Modal
  const [statesList, setStatesList] = useState<MasterDataItem[]>([]);
  const [districtsList, setDistrictsList] = useState<MasterDataItem[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Profile Image Preview / File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFetchedRef = useRef(false);

  // Fetch Patient Details from API
  const fetchPatientDetails = async () => {
    setLoading(true);
    setFetchingError(null);
    try {
      const response = await callApi(API_ROUTES.getPatientDetails, null, "GET");
      const data = response?.data || response;
      if (data) {
        setDetails(data);
        fetchStates();
        if (data?.patientProfile?.stateId) {
          fetchDistricts(data.patientProfile.stateId);
        }
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load patient profile details.";
      setFetchingError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchPatientDetails();
  }, []);

  // Fetch States API
  const fetchStates = async () => {
    if (statesList.length > 0) return statesList;
    setLoadingStates(true);
    try {
      const response = await callApi(API_ROUTES.getPatientStates, null, "GET");
      const list = response?.data?.states || response?.states || response?.data || [];
      if (Array.isArray(list)) {
        setStatesList(list);
        return list;
      }
      return [];
    } catch (err) {
      console.error("Failed to load states:", err);
      return [];
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch Districts API
  const fetchDistricts = async (stateId: number) => {
    if (!stateId) {
      setDistrictsList([]);
      return;
    }
    setLoadingDistricts(true);
    try {
      const response = await callApi(
        `${API_ROUTES.getPatientDistricts}/${stateId}`,
        null,
        "GET"
      );
      const list = response?.data?.districts || response?.districts || response?.data || [];
      if (Array.isArray(list)) {
        setDistrictsList(list);
      } else {
        setDistrictsList([]);
      }
    } catch (err) {
      console.error("Failed to load districts:", err);
      setDistrictsList([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Calculate age from Date of Birth
  const calculateAge = (dobString: string): number | "" => {
    if (!dobString) return "";
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : "";
  };

  // Handle Edit Modal Opening
  const handleOpenEditModal = async () => {
    setUpdateError(null);
    setUpdateSuccess(null);
    setSelectedFile(null);
    setImagePreview(details?.patientProfile?.profileImage || null);
    setIsEditModalOpen(true);

    await fetchStates();
    if (details?.patientProfile?.stateId) {
      await fetchDistricts(details.patientProfile.stateId);
    }
  };

  // Image Upload Selection Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1 * 1024 * 1024) {
        setUpdateError("Profile image must be less than 1MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // State Change in Modal
  const handleModalStateChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedVal = e.target.value;
    const numVal = selectedVal ? Number(selectedVal) : "";
    formik.setFieldValue("stateId", numVal);
    formik.setFieldValue("districtId", "");
    formik.setFieldTouched("stateId", true);
    if (numVal) {
      await fetchDistricts(Number(numVal));
    } else {
      setDistrictsList([]);
    }
  };

  const formik = useFormik<EditPatientFormValues>({
    enableReinitialize: true,
    initialValues: {
      firstName: details?.patientProfile?.firstName || "",
      middleName: details?.patientProfile?.middleName || "",
      lastName: details?.patientProfile?.lastName || "",
      dateOfBirth: details?.patientProfile?.dateOfBirth || "",
      age: details?.patientProfile?.age ?? "",
      gender: details?.patientProfile?.gender ?? "",
      address: details?.patientProfile?.address || "",
      stateId: details?.patientProfile?.stateId ?? "",
      districtId: details?.patientProfile?.districtId ?? "",
      pincode: details?.patientProfile?.pincode ?? "",
    },
    validationSchema: patientProfileEditSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setUpdateError(null);
      setUpdateSuccess(null);

      const patientProfileId = details?.patientProfile?.patientProfileId;
      if (!patientProfileId) {
        setUpdateError("Patient Profile ID is missing. Cannot update.");
        setSubmitting(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("patientProfileId", patientProfileId);
        if (values.firstName) formData.append("firstName", values.firstName.trim());
        if (values.middleName) formData.append("middleName", values.middleName.trim());
        if (values.lastName) formData.append("lastName", values.lastName.trim());
        if (values.dateOfBirth) formData.append("dateOfBirth", values.dateOfBirth);
        if (values.age !== "" && values.age !== undefined && values.age !== null) {
          formData.append("age", values.age.toString());
        }
        if (values.gender !== "" && values.gender !== undefined && values.gender !== null) {
          formData.append("gender", values.gender.toString());
        }
        if (values.address) formData.append("address", values.address.trim());
        if (values.stateId !== "" && values.stateId !== undefined && values.stateId !== null) {
          formData.append("stateId", values.stateId.toString());
        }
        if (values.districtId !== "" && values.districtId !== undefined && values.districtId !== null) {
          formData.append("districtId", values.districtId.toString());
        }
        if (values.pincode !== "" && values.pincode !== undefined && values.pincode !== null) {
          formData.append("pincode", values.pincode.toString());
        }
        if (selectedFile) {
          formData.append("profileImage", selectedFile);
        }

        const response = await callApi(
          API_ROUTES.updatePatientProfileDetails,
          formData,
          "POST"
        );

        if (response) {
          setUpdateSuccess("Patient Profile Updated Successfully!");
          await fetchPatientDetails();
          setTimeout(() => {
            setIsEditModalOpen(false);
          }, 1000);
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update patient profile. Please try again.";
        setUpdateError(Array.isArray(message) ? message.join(", ") : message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const profile = details?.patientProfile;
  const fullName = profile
    ? `${profile.firstName} ${profile.middleName ? profile.middleName + " " : ""}${profile.lastName}`
    : "Patient Name";
  const patientId = details?.patientId || user?.patientId || "PATIENT";
  const email = user?.email || "patient@arogyalink.org";
  const mobile = user?.mobile || "+91 9876543210";

  // Resolve State Name & District Name for display
  const matchedState = profile?.stateName || statesList.find((s) => s.id === profile?.stateId)?.name;
  const matchedDistrict = profile?.districtName || districtsList.find((d) => d.id === profile?.districtId)?.name;

  return (
    <div className={themeStyles.layout.pageContainer}>
      {/* Top Banner with Patient Overview */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar / Profile Image */}
            <div className="relative group">
              <Avatar className="w-20 h-20 rounded-3xl border-2 border-white/20 shadow-lg shrink-0">
                {profile?.profileImage && (
                  <AvatarImage
                    src={getImageUrl(profile.profileImage)}
                    alt={fullName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="rounded-3xl bg-linear-to-br from-emerald-600 to-teal-700 text-white font-black text-2xl">
                  {fullName.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={themeStyles.typography.h1White}>{fullName}</h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  ABHA Verified
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="font-mono text-emerald-300 font-semibold">
                  Patient ID: {patientId}
                </span>
                {details?.patientPrimaryKey && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400">
                      Primary Key: #{details.patientPrimaryKey}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="emerald"
              onClick={handleOpenEditModal}
              className="font-bold shadow-lg shadow-emerald-600/30 cursor-pointer h-10 px-5 rounded-xl"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={fetchPatientDetails}
              disabled={loading}
              className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer h-10 px-4 rounded-xl"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Fetch Error Alert Banner */}
      {fetchingError && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <div className="flex items-center justify-between gap-3 w-full">
            <AlertDescription className="text-xs">{fetchingError}</AlertDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPatientDetails}
              className="text-xs h-7 px-3 shrink-0"
            >
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Metric Stat Cards */}
      <div className={themeStyles.layout.grid4}>
        <Card className={themeStyles.card.base}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className={themeStyles.typography.muted}>Age & Date of Birth</span>
              <div className="text-sm font-bold text-slate-900">
                {profile?.age !== undefined ? `${profile.age} Yrs` : "Not set"}{" "}
                {profile?.dateOfBirth && (
                  <span className="text-xs font-normal text-slate-500">
                    ({profile.dateOfBirth})
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.base}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className={themeStyles.typography.muted}>Gender</span>
              <div className="text-sm font-bold text-slate-900">
                {getGenderLabel(profile?.gender)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.base}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className={themeStyles.typography.muted}>Mobile Contact</span>
              <div className="text-sm font-bold font-mono text-slate-900">
                {mobile}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.base}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className={themeStyles.typography.muted}>Registered Email</span>
              <div className="text-sm font-bold text-slate-900 truncate max-w-35">
                {email}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Profile Content Grid */}
      <div className={themeStyles.layout.grid2}>
        {/* Personal & Demographics Information */}
        <Card className={themeStyles.card.base}>
          <CardHeader className={themeStyles.card.header}>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Personal & Demographics
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-semibold">
              EHR Identity
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">First Name:</span>
              <span className="text-slate-900 font-bold">{profile?.firstName || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Middle Name:</span>
              <span className="text-slate-900 font-medium">{profile?.middleName || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Last Name:</span>
              <span className="text-slate-900 font-bold">{profile?.lastName || "—"}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Date of Birth:</span>
              <span className="text-slate-900 font-mono font-bold">
                {profile?.dateOfBirth || "Not provided"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Calculated Age:</span>
              <span className="text-slate-900 font-bold">
                {profile?.age !== undefined ? `${profile.age} Years` : "Not provided"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2">
              <span className="text-slate-500 font-medium">Gender:</span>
              <span className="text-slate-900 font-bold">{getGenderLabel(profile?.gender)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Address & Residential Details */}
        <Card className={themeStyles.card.base}>
          <CardHeader className={themeStyles.card.header}>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              Residential & Region Details
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-semibold">
              Location Sync
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="py-2 border-b border-slate-100 space-y-1">
              <span className="text-slate-500 font-medium block">Residential Address:</span>
              <p className="text-slate-900 font-medium text-xs leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                {profile?.address || "No residential address registered yet."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">State / Region:</span>
              <span className="text-slate-900 font-bold">
                {matchedState || (profile?.stateId ? `State ID: ${profile.stateId}` : "Not selected")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">District / City:</span>
              <span className="text-slate-900 font-bold">
                {matchedDistrict || (profile?.districtId ? `District ID: ${profile.districtId}` : "Not selected")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Postal Pincode:</span>
              <span className="text-slate-900 font-mono font-bold">
                {profile?.pincode || "Not provided"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2">
              <span className="text-slate-500 font-medium">Vault Encryption:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit AES End-to-End
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ABDM Interoperability & Consent Card */}
      <Card className="bg-linear-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              ABDM Consolidated EHR Network
            </div>
            <h3 className="text-xl font-bold text-white">
              Consent-Driven Healthcare Record Sharing
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your patient health records are interoperable across treating doctors and hospitals under the National Health Authority guidelines. You have 100% control over which medical professionals access your historical prescriptions and allergy records.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="outline"
              onClick={handleOpenEditModal}
              className="bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-white font-bold text-xs h-10 px-5 rounded-xl cursor-pointer"
            >
              Update Vault Details
            </Button>
          </div>
        </div>
      </Card>

      {/* EDIT PROFILE MODAL */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white rounded-3xl border-slate-200 shadow-2xl">
          {/* Modal Header */}
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit className="w-4 h-4 text-emerald-600" />
              Edit Patient Profile Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update your demographic, residential, and personal information.
            </DialogDescription>
          </DialogHeader>

          {/* Modal Scrollable Form Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Alert Feedback */}
            {updateError && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <AlertDescription className="text-xs">{updateError}</AlertDescription>
              </Alert>
            )}

            {updateSuccess && (
              <Alert variant="success" className="rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <AlertDescription className="text-xs">{updateSuccess}</AlertDescription>
              </Alert>
            )}

            <form id="edit-patient-form" onSubmit={formik.handleSubmit} className="space-y-5">
              {/* Profile Picture Upload Section */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="relative">
                  <Avatar className="w-16 h-16 rounded-2xl border-2 border-white shadow-xs">
                    {imagePreview && (
                      <AvatarImage
                        src={getImageUrl(imagePreview)}
                        alt="Preview"
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-xl">
                      {formik.values.firstName.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="block text-xs font-bold text-slate-800">
                    Profile Picture (Optional)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    JPG, PNG or WEBP under 1MB.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs h-8 cursor-pointer font-semibold"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    Choose Photo
                  </Button>
                </div>
              </div>

              {/* Patient Name Fields */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Patient Full Name *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
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
                    name="middleName"
                    placeholder="Middle Name (Optional)"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <Input
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

              {/* Date of Birth, Age & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formik.values.dateOfBirth}
                    onChange={(e) => {
                      formik.handleChange(e);
                      const calculated = calculateAge(e.target.value);
                      if (calculated !== "") {
                        formik.setFieldValue("age", calculated);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.dateOfBirth && formik.errors.dateOfBirth
                        ? formik.errors.dateOfBirth
                        : undefined
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Age (Years)
                  </label>
                  <Input
                    type="number"
                    name="age"
                    placeholder="e.g. 26"
                    value={formik.values.age}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.age && formik.errors.age
                        ? (formik.errors.age as string)
                        : undefined
                    }
                  />
                </div>

                {/* Gender Select */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formik.values.gender || ""}
                    onChange={(e) => {
                      formik.setFieldValue(
                        "gender",
                        e.target.value ? Number(e.target.value) : ""
                      );
                    }}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                    <option value="3">Other</option>
                  </select>
                  {formik.touched.gender && formik.errors.gender && (
                    <p className="text-xs text-red-600 font-medium">
                      {formik.errors.gender}
                    </p>
                  )}
                </div>
              </div>

              {/* Residential Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Residential Address
                </label>
                <Textarea
                  name="address"
                  rows={2}
                  placeholder="Street, locality, landmark..."
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.address && formik.errors.address)}
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">
                    {formik.errors.address}
                  </p>
                )}
              </div>

              {/* State, District, and Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                {/* State Select */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      State
                    </label>
                    {loadingStates && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                      </span>
                    )}
                  </div>
                  <select
                    name="stateId"
                    value={formik.values.stateId}
                    onChange={handleModalStateChange}
                    onBlur={formik.handleBlur}
                    disabled={loadingStates}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {statesList.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name} {state.code ? `(${state.code})` : ""}
                      </option>
                    ))}
                  </select>
                  {formik.touched.stateId && formik.errors.stateId && (
                    <p className="text-xs text-red-600 font-medium">
                      {formik.errors.stateId}
                    </p>
                  )}
                </div>

                {/* District Select */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      District
                    </label>
                    {loadingDistricts && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                      </span>
                    )}
                  </div>
                  <select
                    name="districtId"
                    value={formik.values.districtId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={loadingDistricts || !formik.values.stateId}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="">
                      {!formik.values.stateId ? "Select State First" : "Select District"}
                    </option>
                    {districtsList.map((dist) => (
                      <option key={dist.id} value={dist.id}>
                        {dist.name} {dist.code ? `(${dist.code})` : ""}
                      </option>
                    ))}
                  </select>
                  {formik.touched.districtId && formik.errors.districtId && (
                    <p className="text-xs text-red-600 font-medium">
                      {formik.errors.districtId}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Postal Pincode
                  </label>
                  <Input
                    type="number"
                    name="pincode"
                    placeholder="e.g. 700001"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.pincode && formik.errors.pincode
                        ? (formik.errors.pincode as string)
                        : undefined
                    }
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Modal Footer */}
          <DialogFooter className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="text-xs h-10 px-5 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-patient-form"
              variant="emerald"
              loading={formik.isSubmitting}
              className="text-xs font-bold h-10 px-6 rounded-xl shadow-md cursor-pointer"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientProfilePage;
