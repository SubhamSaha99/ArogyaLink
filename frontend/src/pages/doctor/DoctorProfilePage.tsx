import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  User,
  ShieldCheck,
  BookOpen,
  FileCheck,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  Edit,
  Camera,
  X,
  CheckCircle2,
  AlertCircle,
  Upload,
  Calendar,
  Building2,
  Award,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SelectDropdown } from "@/components/common/SelectDropdown";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

export interface MasterDataItem {
  id: number;
  name: string;
  code?: string;
}

export interface DoctorMasterData {
  registrationCouncils: MasterDataItem[];
  states: MasterDataItem[];
  qualifications: MasterDataItem[];
  specializations: MasterDataItem[];
}

interface DoctorDetailsResponse {
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
    registrationCouncil?: number;
    registrationStateId?: number;
    registrationStateName?: string;
    registrationState?: number;
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

interface BasicDetailsFormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: number | undefined;
  profileImage: File | null;
}

interface ProfessionalDetailsFormValues {
  medicalRegistration: string;
  registrationCouncil: number | "";
  registrationState: number | "";
  registrationYear: number | "";
  licenseStatus: number | "";
}

interface QualificationItemFormValues {
  qualificationId: number | "";
  specializationId: number | "" | null;
  institutionName: string;
  universityName: string;
  yearOfCompletion: number | "";
}

interface QualificationsFormValues {
  qualifications: QualificationItemFormValues[];
}

const basicDetailsSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .test(
      "min-len",
      "First Name must be at least 2 characters",
      (val) => !val || val.length >= 2
    )
    .max(100, "First Name cannot exceed 100 characters")
    .optional(),
  middleName: Yup.string()
    .trim()
    .max(100, "Middle Name cannot exceed 100 characters")
    .optional(),
  lastName: Yup.string()
    .trim()
    .max(100, "Last Name cannot exceed 100 characters")
    .optional(),
  gender: Yup.number()
    .nullable()
    .oneOf([1, 2, 3], "Gender must be 1 (Male), 2 (Female), or 3 (Other)")
    .optional(),
  profileImage: Yup.mixed<File>()
    .nullable()
    .test(
      "fileType",
      "Only JPEG, JPG, PNG, and WEBP image files are allowed",
      (file) =>
        !file ||
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file.type
        )
    )
    .test(
      "fileSize",
      "Image size must be less than 1MB",
      (file) => !file || file.size <= 1 * 1024 * 1024
    )
    .optional(),
});

const professionalDetailsSchema = Yup.object({
  medicalRegistration: Yup.string()
    .trim()
    .required("Medical Registration Number is required")
    .max(50, "Registration Number cannot exceed 50 characters"),
  registrationCouncil: Yup.number()
    .required("Registration Council is required")
    .min(1, "Please select a valid Registration Council"),
  registrationState: Yup.number()
    .required("Registration State is required")
    .min(1, "Please select a valid Registration State"),
  registrationYear: Yup.number()
    .required("Registration Year is required")
    .min(1900, "Year must be 1900 or later")
    .max(
      new Date().getFullYear(),
      `Year cannot be in the future (${new Date().getFullYear()})`
    ),
  licenseStatus: Yup.number()
    .required("License Status is required")
    .oneOf([1, 2, 3], "Invalid License Status"),
});

const qualificationsSchema = Yup.object({
  qualifications: Yup.array()
    .of(
      Yup.object({
        qualificationId: Yup.number()
          .required("Qualification degree is required")
          .min(1, "Please select a qualification degree"),
        specializationId: Yup.number().nullable().optional(),
        institutionName: Yup.string()
          .trim()
          .max(200, "Institution name cannot exceed 200 characters")
          .optional(),
        universityName: Yup.string()
          .trim()
          .max(200, "University name cannot exceed 200 characters")
          .optional(),
        yearOfCompletion: Yup.number()
          .nullable()
          .optional()
          .min(1900, "Year must be 1900 or later")
          .max(
            new Date().getFullYear(),
            `Year cannot be in the future (${new Date().getFullYear()})`
          ),
      })
    )
    .min(1, "At least one qualification entry is required"),
});

const LICENSE_STATUS_OPTIONS = [
  { value: 1, label: "Active" },
  { value: 2, label: "Inactive" },
  { value: 3, label: "Suspended / Expired" },
];

export const DoctorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [doctorDetails, setDoctorDetails] =
    useState<DoctorDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingError, setFetchingError] = useState<string | null>(null);

  // Master Data State
  const [masterData, setMasterData] = useState<DoctorMasterData | null>(null);
  const [masterDataLoading, setMasterDataLoading] = useState<boolean>(false);
  const [masterDataError, setMasterDataError] = useState<string | null>(null);

  // Edit Basic Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Edit Professional Details Modal State
  const [isProfEditModalOpen, setIsProfEditModalOpen] = useState<boolean>(false);
  const [profUpdateError, setProfUpdateError] = useState<string | null>(null);
  const [profUpdateSuccess, setProfUpdateSuccess] = useState<string | null>(null);

  // Edit Qualifications Modal State
  const [isQualEditModalOpen, setIsQualEditModalOpen] = useState<boolean>(false);
  const [qualUpdateError, setQualUpdateError] = useState<string | null>(null);
  const [qualUpdateSuccess, setQualUpdateSuccess] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Doctor Details from API
  const fetchDoctorDetails = async () => {
    setLoading(true);
    setFetchingError(null);
    try {
      const response = await callApi(
        API_ROUTES.getDoctorDetails,
        {
          doctorPrimaryKey: user?.doctorPrimaryKey || user?.userPrimaryKey,
          doctorId: user?.doctorId,
        },
        "POST"
      );
      if (response && response.data) {
        setDoctorDetails(response.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch doctor details:", err);
      setFetchingError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load doctor profile details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Doctor Master Data for Dropdowns
  const fetchMasterData = async () => {
    setMasterDataLoading(true);
    setMasterDataError(null);
    try {
      const response = await callApi(API_ROUTES.getDoctorMasterData, null, "GET");
      if (response && response.data) {
        setMasterData(response.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch doctor master data:", err);
      setMasterDataError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load master dropdown data."
      );
    } finally {
      setMasterDataLoading(false);
    }
  };

  const specializationOptions = React.useMemo(() => {
    const opts: Array<{ value: string | number; label: string; code?: string }> = [
      { value: "", label: "None / General" },
    ];
    if (masterData?.specializations) {
      masterData.specializations.forEach((sp) => {
        opts.push({ value: sp.id, label: sp.name, code: sp.code });
      });
    }
    return opts;
  }, [masterData?.specializations]);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchDoctorDetails();
    fetchMasterData();
  }, []);

  // Basic Details Formik Handler
  const basicFormik = useFormik<BasicDetailsFormValues>({
    initialValues: {
      firstName: doctorDetails?.profileDetails?.firstName || "",
      middleName: doctorDetails?.profileDetails?.middleName || "",
      lastName: doctorDetails?.profileDetails?.lastName || "",
      gender: doctorDetails?.profileDetails?.gender,
      profileImage: null,
    },
    validationSchema: basicDetailsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setUpdateError(null);
      setUpdateSuccess(null);

      try {
        const formData = new FormData();

        const doctorProfileId =
          doctorDetails?.profileDetails?.doctorProfileId ||
          user?.doctorPrimaryKey ||
          user?.userPrimaryKey;

        if (doctorProfileId) {
          formData.append("doctorProfileId", String(doctorProfileId));
        }

        if (values.firstName.trim()) {
          formData.append("firstName", values.firstName.trim());
        }
        if (values.middleName.trim()) {
          formData.append("middleName", values.middleName.trim());
        }
        if (values.lastName.trim()) {
          formData.append("lastName", values.lastName.trim());
        }
        if (values.gender !== undefined && values.gender !== null) {
          formData.append("gender", String(values.gender));
        }
        if (values.profileImage) {
          formData.append("profileImage", values.profileImage);
        }

        const response = await callApi(
          API_ROUTES.updateDoctorProfileDetails,
          formData,
          "POST",
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response && response.success) {
          setUpdateSuccess("Basic details updated successfully!");
          await fetchDoctorDetails();
          setTimeout(() => {
            setIsEditModalOpen(false);
          }, 1000);
        } else {
          setUpdateError(response?.message || "Failed to update details.");
        }
      } catch (err: any) {
        console.error("Error updating doctor basic details:", err);
        setUpdateError(
          err?.response?.data?.message ||
            err?.message ||
            "An error occurred while updating basic details."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Professional Details Formik Handler
  const profFormik = useFormik<ProfessionalDetailsFormValues>({
    initialValues: {
      medicalRegistration:
        doctorDetails?.professionalDetails?.medicalRegistration || "",
      registrationCouncil:
        doctorDetails?.professionalDetails?.registrationCouncilId ||
        doctorDetails?.professionalDetails?.registrationCouncil ||
        "",
      registrationState:
        doctorDetails?.professionalDetails?.registrationStateId ||
        doctorDetails?.professionalDetails?.registrationState ||
        "",
      registrationYear:
        doctorDetails?.professionalDetails?.registrationYear ||
        new Date().getFullYear(),
      licenseStatus: doctorDetails?.professionalDetails?.licenseStatus || 1,
    },
    validationSchema: professionalDetailsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setProfUpdateError(null);
      setProfUpdateSuccess(null);

      try {
        const payload = {
          doctorProfessionalDetailsId:
            doctorDetails?.professionalDetails?.doctorProfessionalDetailsId ||
            undefined,
          medicalRegistration: values.medicalRegistration.trim(),
          registrationCouncil: Number(values.registrationCouncil),
          registrationState: Number(values.registrationState),
          registrationYear: Number(values.registrationYear),
          licenseStatus: Number(values.licenseStatus),
        };

        const response = await callApi(
          API_ROUTES.updateDoctorProfessionalDetails,
          payload,
          "POST"
        );

        if (response && response.success) {
          setProfUpdateSuccess("Professional details updated successfully!");
          await fetchDoctorDetails();
          setTimeout(() => {
            setIsProfEditModalOpen(false);
          }, 1000);
        } else {
          setProfUpdateError(
            response?.message || "Failed to update professional details."
          );
        }
      } catch (err: any) {
        console.error("Error updating doctor professional details:", err);
        setProfUpdateError(
          err?.response?.data?.message ||
            err?.message ||
            "An error occurred while updating professional details."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Educational Qualifications Formik Handler
  const qualFormik = useFormik<QualificationsFormValues>({
    initialValues: {
      qualifications:
        doctorDetails?.qualificationDetails &&
        doctorDetails.qualificationDetails.length > 0
          ? doctorDetails.qualificationDetails.map((q) => ({
              qualificationId: q.qualificationId || "",
              specializationId: q.specializationId || null,
              institutionName: q.institutionName || "",
              universityName: q.universityName || "",
              yearOfCompletion: q.yearOfCompletion || "",
            }))
          : [
              {
                qualificationId: "",
                specializationId: null,
                institutionName: "",
                universityName: "",
                yearOfCompletion: "",
              },
            ],
    },
    validationSchema: qualificationsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setQualUpdateError(null);
      setQualUpdateSuccess(null);

      try {
        const payload = {
          qualifications: values.qualifications.map((q, idx) => {
            const existingQualId =
              doctorDetails?.qualificationDetails?.[idx]?.doctorQualificationId;
            return {
              doctorQualificationId:
                (q as any).doctorQualificationId || existingQualId || undefined,
              qualificationId: Number(q.qualificationId),
              specializationId: q.specializationId
                ? Number(q.specializationId)
                : undefined,
              institutionName: q.institutionName?.trim() || "",
              universityName: q.universityName?.trim() || "",
              yearOfCompletion: q.yearOfCompletion
                ? Number(q.yearOfCompletion)
                : 0,
            };
          }),
        };

        const response = await callApi(
          API_ROUTES.updateDoctorQualifications,
          payload,
          "POST"
        );

        if (response && response.success) {
          setQualUpdateSuccess("Qualifications updated successfully!");
          await fetchDoctorDetails();
          setTimeout(() => {
            setIsQualEditModalOpen(false);
          }, 1000);
        } else {
          setQualUpdateError(
            response?.message || "Failed to update qualifications."
          );
        }
      } catch (err: any) {
        console.error("Error updating doctor qualifications:", err);
        setQualUpdateError(
          err?.response?.data?.message ||
            err?.message ||
            "An error occurred while updating qualifications."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openEditModal = () => {
    const prof = doctorDetails?.profileDetails;
    basicFormik.resetForm({
      values: {
        firstName: prof?.firstName || "",
        middleName: prof?.middleName || "",
        lastName: prof?.lastName || "",
        gender: prof?.gender,
        profileImage: null,
      },
    });
    setImagePreview(prof?.profileImage || null);
    setUpdateError(null);
    setUpdateSuccess(null);
    setIsEditModalOpen(true);
  };

  const openProfessionalEditModal = () => {
    const pd = doctorDetails?.professionalDetails;
    profFormik.resetForm({
      values: {
        medicalRegistration: pd?.medicalRegistration || "",
        registrationCouncil:
          pd?.registrationCouncilId || pd?.registrationCouncil || "",
        registrationState: pd?.registrationStateId || pd?.registrationState || "",
        registrationYear: pd?.registrationYear || new Date().getFullYear(),
        licenseStatus: pd?.licenseStatus || 1,
      },
    });
    setProfUpdateError(null);
    setProfUpdateSuccess(null);
    setIsProfEditModalOpen(true);
  };

  const openQualEditModal = () => {
    const list = doctorDetails?.qualificationDetails || [];
    qualFormik.resetForm({
      values: {
        qualifications:
          list.length > 0
            ? list.map((q) => ({
                qualificationId: q.qualificationId || "",
                specializationId: q.specializationId || null,
                institutionName: q.institutionName || "",
                universityName: q.universityName || "",
                yearOfCompletion: q.yearOfCompletion || "",
              }))
            : [
                {
                  qualificationId: "",
                  specializationId: null,
                  institutionName: "",
                  universityName: "",
                  yearOfCompletion: "",
                },
              ],
      },
    });
    setQualUpdateError(null);
    setQualUpdateSuccess(null);
    setIsQualEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      basicFormik.setFieldValue("profileImage", file);
      basicFormik.setFieldTouched("profileImage", true);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getGenderLabel = (g?: number) => {
    if (g === 1) return "Male";
    if (g === 2) return "Female";
    if (g === 3) return "Other";
    return "Not Specified";
  };

  // Council Name Display Lookup
  const getCouncilName = () => {
    const pd = doctorDetails?.professionalDetails;
    if (pd?.registrationCouncilName) return pd.registrationCouncilName;
    const councilId = pd?.registrationCouncilId || pd?.registrationCouncil;
    if (councilId && masterData?.registrationCouncils) {
      const match = masterData.registrationCouncils.find(
        (c) => Number(c.id) === Number(councilId)
      );
      if (match) return match.name;
    }
    return councilId ? `Council ID: ${councilId}` : "Not Provided";
  };

  // State Name Display Lookup
  const getStateName = () => {
    const pd = doctorDetails?.professionalDetails;
    if (pd?.registrationStateName) return pd.registrationStateName;
    const stateId = pd?.registrationStateId || pd?.registrationState;
    if (stateId && masterData?.states) {
      const match = masterData.states.find(
        (s) => Number(s.id) === Number(stateId)
      );
      if (match) return match.name;
    }
    return stateId ? `State ID: ${stateId}` : "Not Provided";
  };

  // Qualification Name Lookup
  const getQualificationName = (qId?: number, qName?: string) => {
    if (qName) return qName;
    if (qId && masterData?.qualifications) {
      const match = masterData.qualifications.find(
        (item) => Number(item.id) === Number(qId)
      );
      if (match) return match.name;
    }
    return qId ? `Qualification #${qId}` : "Degree";
  };

  // Specialization Name Lookup
  const getSpecializationName = (spId?: number, spName?: string) => {
    if (spName) return spName;
    if (spId && masterData?.specializations) {
      const match = masterData.specializations.find(
        (item) => Number(item.id) === Number(spId)
      );
      if (match) return match.name;
    }
    return null;
  };

  // License Status Badge Helper
  const renderLicenseStatusBadge = (status?: number) => {
    if (status === 1) {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs px-2.5 py-0.5">
          Active
        </Badge>
      );
    }
    if (status === 2) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-semibold text-xs px-2.5 py-0.5">
          Inactive
        </Badge>
      );
    }
    if (status === 3) {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 font-semibold text-xs px-2.5 py-0.5">
          Suspended / Expired
        </Badge>
      );
    }
    return <span className="text-slate-400 font-normal">Not Specified</span>;
  };

  const doctorId = doctorDetails?.doctorId || user?.doctorId || "DOC000001";
  const firstName = doctorDetails?.profileDetails?.firstName || "Dr. Doctor";
  const middleName = doctorDetails?.profileDetails?.middleName || "";
  const lastName = doctorDetails?.profileDetails?.lastName || "";
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
  const email =
    doctorDetails?.profileDetails?.email ||
    user?.email ||
    "doctor@arogyalink.org";
  const mobile =
    doctorDetails?.profileDetails?.mobile || user?.mobile || "Not specified";
  const profileImage = doctorDetails?.profileDetails?.profileImage;

  return (
    <div className="space-y-6 relative">
      {/* Header Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-bold uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            NMC Verified Medical Professional
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Doctor Profile Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official registered details fetched directly from the ArogyaLink
            National Health Registry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchDoctorDetails();
              fetchMasterData();
            }}
            disabled={loading || masterDataLoading}
            className="text-xs font-semibold text-slate-700 hover:text-teal-700 border-slate-300"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${
                loading || masterDataLoading ? "animate-spin" : ""
              }`}
            />
            Refresh Data
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 space-y-4">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">
            Fetching Doctor Details...
          </p>
        </div>
      ) : fetchingError ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-sm text-red-700 font-semibold">
              {fetchingError}
            </p>
            <Button size="sm" variant="outline" onClick={fetchDoctorDetails}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Key Identity Card */}
          <Card className="lg:col-span-4 border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-teal-800 to-cyan-900 p-4"></div>
            <CardContent className="pt-0 relative space-y-4 pb-6">
              <div className="relative w-20 h-20 -mt-10 mb-2 group">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md border-2 border-teal-500 overflow-hidden flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={fullName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-teal-50 text-teal-800 font-black text-2xl flex items-center justify-center">
                      {firstName.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={openEditModal}
                  title="Change Profile Picture"
                  className="absolute bottom-0 right-0 p-1.5 bg-teal-600 text-white rounded-full shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {fullName}
                </h2>
                <Badge variant="teal" className="mt-1 font-mono text-xs">
                  Doctor ID: {doctorId}
                </Badge>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">
                    {email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-mono text-slate-800">{mobile}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Detailed Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Profile Details */}
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-700" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Basic Personal Information
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openEditModal}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    First Name
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {firstName || "-"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Middle Name
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {middleName || "-"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Last Name
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {lastName || "-"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Gender
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {getGenderLabel(doctorDetails?.profileDetails?.gender)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Professional & Registration Details */}
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-teal-700" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Professional & Registration Details
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openProfessionalEditModal}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Medical Registration Number
                  </span>
                  <span className="text-slate-900 font-mono font-bold text-sm">
                    {doctorDetails?.professionalDetails?.medicalRegistration ||
                      "Not Provided"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Registration Council
                  </span>
                  <span className="text-slate-900 font-bold text-sm flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    {getCouncilName()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Registration State
                  </span>
                  <span className="text-slate-900 font-bold text-sm flex items-center gap-1.5">
                    {getStateName()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Registration Year
                  </span>
                  <span className="text-slate-900 font-bold text-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    {doctorDetails?.professionalDetails?.registrationYear ||
                      "Not Provided"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5">
                      License Status
                    </span>
                    <span className="text-xs text-slate-500">
                      Current status in the Medical Register
                    </span>
                  </div>
                  <div>
                    {renderLicenseStatusBadge(
                      doctorDetails?.professionalDetails?.licenseStatus
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educational Qualifications */}
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-700" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Educational Qualifications
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openQualEditModal}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {doctorDetails?.qualificationDetails &&
                doctorDetails.qualificationDetails.length > 0 ? (
                  doctorDetails.qualificationDetails.map((q, idx) => {
                    const qualName = getQualificationName(
                      q.qualificationId,
                      q.qualificationName
                    );
                    const specName = getSpecializationName(
                      q.specializationId,
                      q.specializationName
                    );

                    return (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-teal-600" />
                            {qualName}
                            {specName && (
                              <span className="text-xs text-teal-700 font-medium">
                                ({specName})
                              </span>
                            )}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            Year: {q.yearOfCompletion || "N/A"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">
                          <strong>Institution:</strong>{" "}
                          {q.institutionName || "N/A"} •{" "}
                          <strong>University:</strong>{" "}
                          {q.universityName || "N/A"}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 text-slate-500 text-xs italic text-center">
                    No qualifications listed yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Basic Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Update Basic Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modify your personal profile details and image
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form
              onSubmit={basicFormik.handleSubmit}
              className="p-5 space-y-4 overflow-y-auto"
            >
              {updateError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{updateError}</span>
                </div>
              )}

              {updateSuccess && (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{updateSuccess}</span>
                </div>
              )}

              {/* Profile Image Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Profile Image
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-teal-700 border-teal-300 hover:bg-teal-50"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Choose Image
                    </Button>
                    <p className="text-[11px] text-slate-500">
                      JPEG, PNG or WEBP (Max 1MB)
                    </p>
                    {basicFormik.touched.profileImage &&
                      typeof basicFormik.errors.profileImage === "string" && (
                        <p className="text-xs text-red-600 font-medium">
                          {basicFormik.errors.profileImage}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Name inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    First Name
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={basicFormik.values.firstName}
                    onChange={basicFormik.handleChange}
                    onBlur={basicFormik.handleBlur}
                    placeholder="First Name"
                    className="text-xs"
                    error={
                      basicFormik.touched.firstName && basicFormik.errors.firstName
                        ? basicFormik.errors.firstName
                        : undefined
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Middle Name
                  </label>
                  <Input
                    type="text"
                    name="middleName"
                    value={basicFormik.values.middleName}
                    onChange={basicFormik.handleChange}
                    onBlur={basicFormik.handleBlur}
                    placeholder="Middle Name"
                    className="text-xs"
                    error={
                      basicFormik.touched.middleName && basicFormik.errors.middleName
                        ? basicFormik.errors.middleName
                        : undefined
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={basicFormik.values.lastName}
                    onChange={basicFormik.handleChange}
                    onBlur={basicFormik.handleBlur}
                    placeholder="Last Name"
                    className="text-xs"
                    error={
                      basicFormik.touched.lastName && basicFormik.errors.lastName
                        ? basicFormik.errors.lastName
                        : undefined
                    }
                  />
                </div>
              </div>

              {/* Gender selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 1, label: "Male" },
                    { id: 2, label: "Female" },
                    { id: 3, label: "Other" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        basicFormik.setFieldValue("gender", g.id);
                        basicFormik.setFieldTouched("gender", true);
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all text-center ${
                        basicFormik.values.gender === g.id
                          ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                {basicFormik.touched.gender && basicFormik.errors.gender && (
                  <p className="text-xs text-red-600 font-medium">
                    {basicFormik.errors.gender}
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={basicFormik.isSubmitting}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={basicFormik.isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  {basicFormik.isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Professional Details Modal */}
      {isProfEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Update Professional Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modify your medical registration and council affiliations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProfEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form
              onSubmit={profFormik.handleSubmit}
              className="p-5 space-y-4 overflow-y-auto"
            >
              {profUpdateError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profUpdateError}</span>
                </div>
              )}

              {profUpdateSuccess && (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profUpdateSuccess}</span>
                </div>
              )}

              {masterDataError && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{masterDataError}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchMasterData}
                    className="text-[11px] h-7 px-2 border-amber-300 hover:bg-amber-100 font-semibold text-amber-900"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Medical Registration Number */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Medical Registration Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="medicalRegistration"
                  value={profFormik.values.medicalRegistration}
                  onChange={profFormik.handleChange}
                  onBlur={profFormik.handleBlur}
                  placeholder="e.g. MCI/2018/12345"
                  className="text-xs font-mono"
                  error={
                    profFormik.touched.medicalRegistration &&
                    profFormik.errors.medicalRegistration
                      ? profFormik.errors.medicalRegistration
                      : undefined
                  }
                />
              </div>

              {/* Registration Council Dropdown */}
              <SelectDropdown
                label="Registration Council"
                name="registrationCouncil"
                required
                value={profFormik.values.registrationCouncil}
                options={masterData?.registrationCouncils || []}
                onChange={(val) => {
                  profFormik.setFieldValue("registrationCouncil", val);
                  profFormik.setFieldTouched("registrationCouncil", true);
                }}
                onBlur={() => profFormik.setFieldTouched("registrationCouncil", true)}
                placeholder="Select Medical Council"
                isLoading={masterDataLoading}
                error={
                  profFormik.touched.registrationCouncil &&
                  profFormik.errors.registrationCouncil
                    ? String(profFormik.errors.registrationCouncil)
                    : undefined
                }
              />

              {/* Registration State Dropdown */}
              <SelectDropdown
                label="Registration State"
                name="registrationState"
                required
                value={profFormik.values.registrationState}
                options={masterData?.states || []}
                onChange={(val) => {
                  profFormik.setFieldValue("registrationState", val);
                  profFormik.setFieldTouched("registrationState", true);
                }}
                onBlur={() => profFormik.setFieldTouched("registrationState", true)}
                placeholder="Select State"
                isLoading={masterDataLoading}
                error={
                  profFormik.touched.registrationState &&
                  profFormik.errors.registrationState
                    ? String(profFormik.errors.registrationState)
                    : undefined
                }
              />

              {/* Registration Year */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Registration Year <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="registrationYear"
                  value={profFormik.values.registrationYear}
                  onChange={profFormik.handleChange}
                  onBlur={profFormik.handleBlur}
                  placeholder="e.g. 2018"
                  className="text-xs font-mono"
                  min={1900}
                  max={new Date().getFullYear()}
                  error={
                    profFormik.touched.registrationYear &&
                    profFormik.errors.registrationYear
                      ? profFormik.errors.registrationYear
                      : undefined
                  }
                />
              </div>

              {/* License Status Dropdown */}
              <SelectDropdown
                label="License Status"
                name="licenseStatus"
                required
                value={profFormik.values.licenseStatus}
                options={LICENSE_STATUS_OPTIONS}
                onChange={(val) => {
                  profFormik.setFieldValue("licenseStatus", val);
                  profFormik.setFieldTouched("licenseStatus", true);
                }}
                onBlur={() => profFormik.setFieldTouched("licenseStatus", true)}
                placeholder="Select Status"
                error={
                  profFormik.touched.licenseStatus &&
                  profFormik.errors.licenseStatus
                    ? String(profFormik.errors.licenseStatus)
                    : undefined
                }
              />

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProfEditModalOpen(false)}
                  disabled={profFormik.isSubmitting}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={profFormik.isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  {profFormik.isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Educational Qualifications Modal */}
      {isQualEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Update Educational Qualifications
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add or update your degrees, specializations, and universities
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQualEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form
              onSubmit={qualFormik.handleSubmit}
              className="p-5 space-y-4 overflow-y-auto"
            >
              {qualUpdateError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{qualUpdateError}</span>
                </div>
              )}

              {qualUpdateSuccess && (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{qualUpdateSuccess}</span>
                </div>
              )}

              {masterDataError && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{masterDataError}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchMasterData}
                    className="text-[11px] h-7 px-2 border-amber-300 hover:bg-amber-100 font-semibold text-amber-900"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Dynamic Qualifications List */}
              <div className="space-y-4">
                {qualFormik.values.qualifications.map((item, index) => {
                  const itemErrors =
                    Array.isArray(qualFormik.errors.qualifications) &&
                    (qualFormik.errors.qualifications[index] as any);
                  const itemTouched =
                    Array.isArray(qualFormik.touched.qualifications) &&
                    (qualFormik.touched.qualifications[index] as any);

                  return (
                    <div
                      key={index}
                      className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-teal-600" />
                          Qualification #{index + 1}
                        </span>
                        {qualFormik.values.qualifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...qualFormik.values.qualifications];
                              updated.splice(index, 1);
                              qualFormik.setFieldValue("qualifications", updated);
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Remove Qualification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Qualification Degree Dropdown */}
                        <SelectDropdown
                          label="Qualification Degree"
                          name={`qualifications[${index}].qualificationId`}
                          required
                          value={item.qualificationId}
                          options={masterData?.qualifications || []}
                          onChange={(val) => {
                            qualFormik.setFieldValue(
                              `qualifications[${index}].qualificationId`,
                              val
                            );
                            qualFormik.setFieldTouched(
                              `qualifications[${index}].qualificationId`,
                              true
                            );
                          }}
                          onBlur={() =>
                            qualFormik.setFieldTouched(
                              `qualifications[${index}].qualificationId`,
                              true
                            )
                          }
                          placeholder="Select Degree (e.g. MBBS, MD)"
                          isLoading={masterDataLoading}
                          error={
                            itemTouched?.qualificationId && itemErrors?.qualificationId
                              ? String(itemErrors.qualificationId)
                              : undefined
                          }
                        />

                        {/* Specialization Dropdown */}
                        <SelectDropdown
                          label="Specialization (Optional)"
                          name={`qualifications[${index}].specializationId`}
                          value={item.specializationId}
                          options={specializationOptions}
                          onChange={(val) => {
                            qualFormik.setFieldValue(
                              `qualifications[${index}].specializationId`,
                              val !== "" ? val : null
                            );
                            qualFormik.setFieldTouched(
                              `qualifications[${index}].specializationId`,
                              true
                            );
                          }}
                          onBlur={() =>
                            qualFormik.setFieldTouched(
                              `qualifications[${index}].specializationId`,
                              true
                            )
                          }
                          placeholder="Select Specialization"
                          isLoading={masterDataLoading}
                          error={
                            itemTouched?.specializationId && itemErrors?.specializationId
                              ? String(itemErrors.specializationId)
                              : undefined
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Institution Name */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Institution Name
                          </label>
                          <Input
                            type="text"
                            name={`qualifications[${index}].institutionName`}
                            value={item.institutionName}
                            onChange={qualFormik.handleChange}
                            onBlur={qualFormik.handleBlur}
                            placeholder="e.g. Kolkata Medical College"
                            className="text-xs"
                            error={
                              itemTouched?.institutionName && itemErrors?.institutionName
                                ? String(itemErrors.institutionName)
                                : undefined
                            }
                          />
                        </div>

                        {/* University Name */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            University Name
                          </label>
                          <Input
                            type="text"
                            name={`qualifications[${index}].universityName`}
                            value={item.universityName}
                            onChange={qualFormik.handleChange}
                            onBlur={qualFormik.handleBlur}
                            placeholder="e.g. West Bengal University"
                            className="text-xs"
                            error={
                              itemTouched?.universityName && itemErrors?.universityName
                                ? String(itemErrors.universityName)
                                : undefined
                            }
                          />
                        </div>

                        {/* Year of Completion */}
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Completion Year
                          </label>
                          <Input
                            type="number"
                            name={`qualifications[${index}].yearOfCompletion`}
                            value={item.yearOfCompletion}
                            onChange={qualFormik.handleChange}
                            onBlur={qualFormik.handleBlur}
                            placeholder="e.g. 2015"
                            className="text-xs font-mono"
                            min={1900}
                            max={new Date().getFullYear()}
                            error={
                              itemTouched?.yearOfCompletion && itemErrors?.yearOfCompletion
                                ? String(itemErrors.yearOfCompletion)
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add Qualification Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    qualFormik.setFieldValue("qualifications", [
                      ...qualFormik.values.qualifications,
                      {
                        qualificationId: "",
                        specializationId: null,
                        institutionName: "",
                        universityName: "",
                        yearOfCompletion: "",
                      },
                    ]);
                  }}
                  className="w-full border-dashed border-teal-300 text-teal-700 hover:bg-teal-50 text-xs font-semibold py-2.5"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Another Qualification
                </Button>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQualEditModalOpen(false)}
                  disabled={qualFormik.isSubmitting}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={qualFormik.isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  {qualFormik.isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Qualifications"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfilePage;
