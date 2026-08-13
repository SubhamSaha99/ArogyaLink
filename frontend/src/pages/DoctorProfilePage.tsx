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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

interface DoctorDetailsResponse {
  doctorId: string;
  profileDetails?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    gender?: number;
    profileImage?: string;
  };
  professionalDetails?: {
    medicalRegistration?: string;
    registrationCouncil?: number;
    registrationState?: number;
    registrationYear?: number;
    licenseStatus?: number;
  };
  qualificationDetails?: Array<{
    qualificationId?: number;
    specializationId?: number;
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

const basicDetailsSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .test("min-len", "First Name must be at least 2 characters", (val) => !val || val.length >= 2)
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
      (file) => !file || ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)
    )
    .test(
      "fileSize",
      "Image size must be less than 1MB",
      (file) => !file || file.size <= 1 * 1024 * 1024
    )
    .optional(),
});

export const DoctorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingError, setFetchingError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDoctorDetails = async () => {
    setLoading(true);
    setFetchingError(null);
    try {
      const response = await callApi(API_ROUTES.getDoctorDetails, null, "GET");
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

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchDoctorDetails();
  }, []);

  const formik = useFormik<BasicDetailsFormValues>({
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
          API_ROUTES.updateDoctorBasicDetails,
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

  const openEditModal = () => {
    const prof = doctorDetails?.profileDetails;
    formik.resetForm({
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      formik.setFieldValue("profileImage", file);
      formik.setFieldTouched("profileImage", true);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const getGenderLabel = (g?: number) => {
    if (g === 1) return "Male";
    if (g === 2) return "Female";
    if (g === 3) return "Other";
    return "Not Specified";
  };

  const doctorId = doctorDetails?.doctorId || user?.doctorId || "DOC000001";
  const firstName = doctorDetails?.profileDetails?.firstName || "Dr. Doctor";
  const middleName = doctorDetails?.profileDetails?.middleName || "";
  const lastName = doctorDetails?.profileDetails?.lastName || "";
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
  const email = doctorDetails?.profileDetails?.email || user?.email || "doctor@arogyalink.org";
  const mobile = doctorDetails?.profileDetails?.mobile || user?.mobile || "Not specified";
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
            Official registered details fetched directly from the ArogyaLink National Health Registry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openEditModal}
            className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white border-transparent"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Basic Details
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDoctorDetails}
            disabled={loading}
            className="text-xs font-semibold text-slate-700 hover:text-teal-700 border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 space-y-4">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Fetching Doctor Details...</p>
        </div>
      ) : fetchingError ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-sm text-red-700 font-semibold">{fetchingError}</p>
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
                  className="absolute bottom-0 right-0 p-1.5 bg-teal-600 text-white rounded-full shadow-md hover:bg-teal-700 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{fullName}</h2>
                <Badge variant="teal" className="mt-1 font-mono text-xs">
                  Doctor ID: {doctorId}
                </Badge>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{email}</span>
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
                  <span className="text-slate-500 font-semibold block mb-0.5">First Name</span>
                  <span className="text-slate-900 font-bold text-sm">{firstName || "-"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">Middle Name</span>
                  <span className="text-slate-900 font-bold text-sm">{middleName || "-"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">Last Name</span>
                  <span className="text-slate-900 font-bold text-sm">{lastName || "-"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">Gender</span>
                  <span className="text-slate-900 font-bold text-sm">
                    {getGenderLabel(doctorDetails?.profileDetails?.gender)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-teal-700" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Professional & Registration Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Medical Registration Number
                  </span>
                  <span className="text-slate-900 font-mono font-bold text-sm">
                    {doctorDetails?.professionalDetails?.medicalRegistration || "Not Provided"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Registration Council Code
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {doctorDetails?.professionalDetails?.registrationCouncil || "Not Provided"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Registration State Code
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {doctorDetails?.professionalDetails?.registrationState || "Not Provided"}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 font-semibold block mb-0.5">
                    Registration Year
                  </span>
                  <span className="text-slate-900 font-bold text-sm">
                    {doctorDetails?.professionalDetails?.registrationYear || "Not Provided"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-700" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Educational Qualifications
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {doctorDetails?.qualificationDetails &&
                doctorDetails.qualificationDetails.length > 0 ? (
                  doctorDetails.qualificationDetails.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
                          Qualification ID: {q.qualificationId || idx + 1}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Year: {q.yearOfCompletion || "N/A"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Institution:</strong> {q.institutionName || "N/A"} •{" "}
                        <strong>University:</strong> {q.universityName || "N/A"}
                      </p>
                    </div>
                  ))
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
                  <h3 className="text-lg font-bold text-slate-900">Update Basic Details</h3>
                  <p className="text-xs text-slate-500">
                    Modify your personal profile details and image
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={formik.handleSubmit} className="p-5 space-y-4 overflow-y-auto">
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
                    {formik.touched.profileImage && typeof formik.errors.profileImage === "string" && (
                      <p className="text-xs text-red-600 font-medium">
                        {formik.errors.profileImage}
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
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="First Name"
                    className="text-xs"
                    error={
                      formik.touched.firstName && formik.errors.firstName
                        ? formik.errors.firstName
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
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Middle Name"
                    className="text-xs"
                    error={
                      formik.touched.middleName && formik.errors.middleName
                        ? formik.errors.middleName
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
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Last Name"
                    className="text-xs"
                    error={
                      formik.touched.lastName && formik.errors.lastName
                        ? formik.errors.lastName
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
                        formik.setFieldValue("gender", g.id);
                        formik.setFieldTouched("gender", true);
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all text-center ${
                        formik.values.gender === g.id
                          ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="text-xs text-red-600 font-medium">
                    {formik.errors.gender}
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
                  disabled={formik.isSubmitting}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={formik.isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                >
                  {formik.isSubmitting ? (
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
    </div>
  );
};

export default DoctorProfilePage;
