import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  Edit,
  MapPin,
  FileText,
  Building,
  CheckCircle2,
  AlertCircle,
  Hash,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

/**
 * Health Institute Category Mapping Helper
 */
export const getInstituteTypeLabel = (typeId?: number) => {
  switch (typeId) {
    case 1:
      return "General / Multispecialty Hospital";
    case 2:
      return "Nursing Home & Care Center";
    case 3:
      return "Specialty & Dental Clinic";
    case 4:
      return "Diagnostic Center & Pathology Lab";
    case 5:
      return "Pharmacy / Healthcare Facility";
    default:
      return "Health Institute / Hospital";
  }
};

export interface HealthInstituteDetailsResponse {
  healthInstitutePrimaryKey?: number;
  healthInstituteId: string;
  profileDetails?: {
    healthInstituteProfileId?: number;
    id?: number;
    healthInstituteName?: string;
    healthInstituteType?: number;
    registrationNumber?: string;
    email?: string;
    phone?: string;
    address?: string;
    stateId?: number;
    stateName?: string;
    districtId?: number;
    districtName?: string;
    pincode?: string;
  };
}

interface EditInstituteProfileFormValues {
  registrationNumber: string;
  phone: string;
  address: string;
  stateId: number | "";
  districtId: number | "";
  pincode: string;
}

const editProfileSchema = Yup.object({
  registrationNumber: Yup.string()
    .trim()
    .required("Registration Number is required")
    .max(50, "Registration Number cannot exceed 50 characters"),
  phone: Yup.string()
    .trim()
    .matches(/^\+?[0-9]{7,15}$/, "Please enter a valid phone number (7-15 digits)")
    .optional()
    .nullable(),
  address: Yup.string()
    .trim()
    .max(255, "Address cannot exceed 255 characters")
    .optional()
    .nullable(),
  stateId: Yup.number()
    .required("State selection is required")
    .min(1, "Please select a valid State"),
  districtId: Yup.number()
    .required("District selection is required")
    .min(1, "Please select a valid District"),
  pincode: Yup.string()
    .trim()
    .required("Pincode is required")
    .matches(/^[1-9][0-9]{5}$/, "Pincode must be a 6-digit valid postal code"),
});

export interface MasterDataItem {
  id: number;
  name: string;
  code?: string;
}

export const HealthInstituteProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [details, setDetails] = useState<HealthInstituteDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingError, setFetchingError] = useState<string | null>(null);

  // States and Districts for Edit Modal
  const [statesList, setStatesList] = useState<MasterDataItem[]>([]);
  const [districtsList, setDistrictsList] = useState<MasterDataItem[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  // Fetch States API (called only when modal opens)
  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const response = await callApi(API_ROUTES.getHealthInstituteStates, null, "GET");
      const list = response?.data?.states || response?.states || response?.data || [];
      if (Array.isArray(list)) {
        setStatesList(list);
        return list;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch states:", err);
      return [];
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch Districts API by State ID (called only when modal opens or state changes)
  const fetchDistricts = async (sId: number) => {
    if (!sId) return [];
    setLoadingDistricts(true);
    try {
      const response = await callApi(`${API_ROUTES.getHealthInstituteDistricts}/${sId}`, null, "GET");
      const list = response?.data?.districts || response?.districts || response?.data || [];
      if (Array.isArray(list)) {
        setDistrictsList(list);
        return list;
      }
      return [];
    } catch (err) {
      console.error(`Failed to fetch districts for state ${sId}:`, err);
      return [];
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch Health Institute Details API (called on page load)
  const fetchInstituteDetails = async () => {
    setLoading(true);
    setFetchingError(null);
    try {
      const response = await callApi(API_ROUTES.getHealthInstituteDetails, null, "GET");
      const apiData = response?.data?.healthInstituteId
        ? response.data
        : response?.healthInstituteId
        ? response
        : response?.data;
      if (apiData) {
        setDetails(apiData);
      }
    } catch (err: any) {
      console.error("Failed to fetch health institute details:", err);
      setFetchingError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load health institute profile details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchInstituteDetails();
  }, []);

  const profile = details?.profileDetails;
  const healthInstituteId = details?.healthInstituteId || user?.healthInstituteId || "HND000001";
  const instituteName = profile?.healthInstituteName || user?.healthInstituteName || "City Care Multispecialty Hospital";
  const instituteType = profile?.healthInstituteType || user?.healthInstituteType || 1;
  const email = profile?.email || user?.email || "contact@hospital.org";
  const phone = profile?.phone || "Not Specified";
  const registrationNumber = profile?.registrationNumber || "Not Specified";
  const address = profile?.address || "Not Specified";
  const stateId = profile?.stateId;
  const districtId = profile?.districtId;
  const pincode = profile?.pincode || "Not Specified";

  // Formik for updating profile details
  const formik = useFormik<EditInstituteProfileFormValues>({
    initialValues: {
      registrationNumber: profile?.registrationNumber || "",
      phone: profile?.phone || "+91",
      address: profile?.address || "",
      stateId: profile?.stateId || 1,
      districtId: profile?.districtId || 101,
      pincode: profile?.pincode || "",
    },
    validationSchema: editProfileSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setUpdateError(null);
      setUpdateSuccess(null);

      try {
        const profileId =
          profile?.healthInstituteProfileId ||
          profile?.id ||
          details?.healthInstitutePrimaryKey ||
          user?.healthInstitutePrimaryKey ||
          user?.userPrimaryKey;

        if (!profileId) {
          throw new Error("Health institute profile ID could not be determined.");
        }

        const payload = {
          healthInstituteProfileId: Number(profileId),
          registrationNumber: values.registrationNumber.trim(),
          phone: values.phone.trim() || undefined,
          address: values.address.trim() || undefined,
          stateId: Number(values.stateId),
          districtId: Number(values.districtId),
          pincode: values.pincode.trim(),
        };

        const response = await callApi(
          API_ROUTES.updateHealthInstituteProfile,
          payload,
          "POST"
        );

        if (response && response.success) {
          setUpdateSuccess("Institute profile updated successfully!");
          await fetchInstituteDetails();
          setTimeout(() => {
            setIsEditModalOpen(false);
          }, 1000);
        } else {
          setUpdateError(response?.message || "Failed to update institute details.");
        }
      } catch (err: any) {
        console.error("Error updating institute profile:", err);
        setUpdateError(
          err?.response?.data?.message ||
            err?.message ||
            "An error occurred while updating profile details."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openEditModal = async () => {
    const currentStateId = profile?.stateId || "";
    const currentDistrictId = profile?.districtId || "";

    formik.resetForm({
      values: {
        registrationNumber: profile?.registrationNumber || "",
        phone: profile?.phone || "",
        address: profile?.address || "",
        stateId: currentStateId,
        districtId: currentDistrictId,
        pincode: profile?.pincode || "",
      },
    });

    setUpdateError(null);
    setUpdateSuccess(null);
    setIsEditModalOpen(true);

    // Fetch states & districts ONLY when edit modal opens
    const fetchedStates = await fetchStates();
    const activeStateId = currentStateId || (fetchedStates.length > 0 ? fetchedStates[0].id : null);
    if (activeStateId) {
      if (!currentStateId && fetchedStates.length > 0) {
        formik.setFieldValue("stateId", activeStateId);
      }
      const fetchedDistricts = await fetchDistricts(Number(activeStateId));
      if (!currentDistrictId && fetchedDistricts.length > 0) {
        formik.setFieldValue("districtId", fetchedDistricts[0].id);
      }
    }
  };

  const handleModalStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSId = Number(e.target.value);
    formik.setFieldValue("stateId", newSId);
    formik.setFieldValue("districtId", "");
    if (newSId) {
      const fetched = await fetchDistricts(newSId);
      if (fetched.length > 0) {
        formik.setFieldValue("districtId", fetched[0].id);
      }
    }
  };

  const getStateName = (sId?: number) => {
    if (profile?.stateName) return profile.stateName;
    if (!sId) return "Not Specified";
    const found = statesList.find((s) => s.id === Number(sId));
    return found ? found.name : `State ID: ${sId}`;
  };

  const getDistrictName = (dId?: number) => {
    if (profile?.districtName) return profile.districtName;
    if (!dId) return "Not Specified";
    const found = districtsList.find((d) => d.id === Number(dId));
    return found ? found.name : `District ID: ${dId}`;
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-full bg-linear-to-l from-cyan-500/10 via-teal-500/5 to-transparent pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 text-[11px] text-cyan-800 font-bold uppercase tracking-wider bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
            ABDM Health Facility Registry (HFR)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Health Facility Profile
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Registered hospital and healthcare provider credentials synced with ArogyaLink National Health Gateway.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInstituteDetails}
            disabled={loading}
            className="text-xs font-semibold text-slate-700 hover:text-cyan-700 border-slate-300 h-9 px-3.5 rounded-xl cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>

          <Button
            variant="cyan"
            size="sm"
            onClick={openEditModal}
            disabled={loading}
            className="text-xs font-bold shadow-md h-9 px-4 rounded-xl cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile Details
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 space-y-4">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">
            Fetching Health Institute Profile...
          </p>
        </div>
      ) : fetchingError ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-sm text-red-700 font-semibold">{fetchingError}</p>
            <Button size="sm" variant="outline" onClick={fetchInstituteDetails}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Key Identity Card */}
          <Card className="lg:col-span-4 border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="h-28 bg-linear-to-r from-teal-800 to-cyan-900 p-4"></div>
            <CardContent className="pt-0 relative space-y-4 pb-6">
              <div className="relative w-20 h-20 -mt-10 mb-2">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md border-2 border-teal-500 overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full rounded-xl bg-teal-50 text-teal-800 font-black text-2xl flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-teal-700" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {instituteName}
                </h2>
                <div className="flex flex-wrap gap-2 items-center mt-2">
                  <Badge variant="teal" className="font-mono text-xs">
                    ID: {healthInstituteId}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700">
                    {getInstituteTypeLabel(instituteType)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-mono text-slate-800">{phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 leading-normal">{address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Detailed Cards */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Facility Information */}
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-teal-700" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Primary Facility Details
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
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Institute / Hospital Name
                    </label>
                    <p className="text-sm font-bold text-slate-900">{instituteName}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Facility Category
                    </label>
                    <p className="text-sm font-semibold text-teal-800">
                      {getInstituteTypeLabel(instituteType)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Registration / License Number
                    </label>
                    <p className="text-sm font-mono font-bold text-slate-800">
                      {registrationNumber}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Official Email Address
                    </label>
                    <p className="text-sm font-medium text-slate-800">{email}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Contact Phone Number
                    </label>
                    <p className="text-sm font-mono font-medium text-slate-800">
                      {phone}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Verification Status
                    </label>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Active & Compliant
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Postal Address Card */}
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-700" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Location & Address Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Street Address
                    </label>
                    <p className="text-sm font-medium text-slate-800">
                      {address}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      State
                    </label>
                    <p className="text-sm font-semibold text-slate-800">
                      {getStateName(stateId)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      District
                    </label>
                    <p className="text-sm font-semibold text-slate-800">
                      {getDistrictName(districtId)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Pincode / Postal Code
                    </label>
                    <p className="text-sm font-mono font-bold text-slate-800">
                      {pincode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Profile Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-xl bg-white shadow-2xl border-slate-200 my-8">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Edit Institute Profile Details
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Update registration number, contact phone, and location details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {updateError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{updateError}</span>
                  </div>
                )}

                {updateSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{updateSuccess}</span>
                  </div>
                )}

                {/* Registration Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Registration / License Number
                  </label>
                  <Input
                    type="text"
                    name="registrationNumber"
                    placeholder="e.g. REG-MH-2024-8890"
                    value={formik.values.registrationNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.registrationNumber && formik.errors.registrationNumber
                        ? formik.errors.registrationNumber
                        : undefined
                    }
                    icon={<FileText className="w-4 h-4 text-teal-600" />}
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Contact Phone Number
                  </label>
                  <Input
                    type="text"
                    name="phone"
                    placeholder="e.g. +919876543210"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.phone && formik.errors.phone
                        ? formik.errors.phone
                        : undefined
                    }
                    icon={<Phone className="w-4 h-4 text-teal-600" />}
                  />
                </div>

                {/* Street Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Street Address
                  </label>
                  <Input
                    type="text"
                    name="address"
                    placeholder="e.g. Plot 42, Healthcare Avenue, Sector 5"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.address && formik.errors.address
                        ? formik.errors.address
                        : undefined
                    }
                    icon={<MapPin className="w-4 h-4 text-teal-600" />}
                  />
                </div>

                {/* State & District Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State Select */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        State *
                      </label>
                      {loadingStates && (
                        <span className="text-[10px] text-teal-600 flex items-center gap-1 font-medium">
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
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        District *
                      </label>
                      {loadingDistricts && (
                        <span className="text-[10px] text-teal-600 flex items-center gap-1 font-medium">
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
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select District</option>
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
                </div>

                {/* Pincode */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pincode *
                  </label>
                  <Input
                    type="text"
                    name="pincode"
                    placeholder="e.g. 400001"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.pincode && formik.errors.pincode
                        ? formik.errors.pincode
                        : undefined
                    }
                    icon={<Hash className="w-4 h-4 text-teal-600" />}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={formik.isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="emerald"
                    disabled={formik.isSubmitting}
                    className="font-bold px-6"
                  >
                    {formik.isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Save Profile Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HealthInstituteProfilePage;
