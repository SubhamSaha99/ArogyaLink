import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Building2,
  Users,
  Stethoscope,
  Activity,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  MapPin,
  Globe,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Network,
  Radio,
  Compass,
  Edit,
  FileText,
  Phone,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

export interface MasterDataItem {
  id: number;
  name: string;
  code?: string;
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

export const HealthInstituteDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [instituteData, setInstituteData] = useState<any>(null);
  const [loadingInstitute, setLoadingInstitute] = useState<boolean>(true);
  const hasFetchedRef = useRef(false);

  // States & Districts API State
  const [states, setStates] = useState<MasterDataItem[]>([]);
  const [districts, setDistricts] = useState<MasterDataItem[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [districtSearchTerm, setDistrictSearchTerm] = useState<string>("");
  const [loadingStates, setLoadingStates] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [errorStates, setErrorStates] = useState<string | null>(null);
  const [errorDistricts, setErrorDistricts] = useState<string | null>(null);

  // Fetch States: GET /api/healthInstitute/states (On Demand)
  const fetchStates = useCallback(async () => {
    setLoadingStates(true);
    setErrorStates(null);
    try {
      const response = await callApi(API_ROUTES.getHealthInstituteStates, null, "GET");
      const list = response?.data?.states || response?.states || response?.data || [];
      if (Array.isArray(list)) {
        setStates(list);
        return list;
      }
      return [];
    } catch (err: any) {
      setErrorStates("Could not load states registry.");
      return [];
    } finally {
      setLoadingStates(false);
    }
  }, []);

  // Fetch Districts by State ID: GET /api/healthInstitute/districts/:id (On Demand)
  const fetchDistrictsByState = useCallback(async (stateId: number) => {
    if (!stateId) return [];
    setLoadingDistricts(true);
    setErrorDistricts(null);
    try {
      const response = await callApi(
        `${API_ROUTES.getHealthInstituteDistricts}/${stateId}`,
        null,
        "GET"
      );
      const list = response?.data?.districts || response?.districts || response?.data || [];
      if (Array.isArray(list)) {
        setDistricts(list);
        return list;
      }
      setDistricts([]);
      return [];
    } catch (err: any) {
      setErrorDistricts(`Unable to load districts for selected state.`);
      setDistricts([]);
      return [];
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  // Fetch Institute Details (Called on initial page load)
  const fetchDetails = useCallback(async () => {
    setLoadingInstitute(true);
    try {
      const response = await callApi(API_ROUTES.getHealthInstituteDetails, null, "GET");
      const data = response?.data?.healthInstituteId
        ? response.data
        : response?.healthInstituteId
        ? response
        : response?.data;
      if (data) {
        setInstituteData(data);
        if (data?.profileDetails?.stateId) {
          setSelectedStateId(Number(data.profileDetails.stateId));
        }
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch institute details:", err);
    } finally {
      setLoadingInstitute(false);
    }
    return null;
  }, []);

  // Initial Load: ONLY Fetch Institute Details once (stateName and districtName are included in details)
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchDetails();
  }, [fetchDetails]);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [modalStates, setModalStates] = useState<MasterDataItem[]>([]);
  const [modalDistricts, setModalDistricts] = useState<MasterDataItem[]>([]);
  const [loadingModalStates, setLoadingModalStates] = useState<boolean>(false);
  const [loadingModalDistricts, setLoadingModalDistricts] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Fetch States for Modal: GET /api/healthInstitute/states (Called only when modal opens)
  const fetchModalStates = async () => {
    setLoadingModalStates(true);
    try {
      const response = await callApi(API_ROUTES.getHealthInstituteStates, null, "GET");
      const list = response?.data?.states || response?.states || response?.data || [];
      if (Array.isArray(list)) {
        setModalStates(list);
        return list;
      }
      return [];
    } catch (err) {
      console.error("Dashboard failed to fetch modal states:", err);
      return [];
    } finally {
      setLoadingModalStates(false);
    }
  };

  // Fetch Districts for Modal: GET /api/healthInstitute/districts/:id (Called only when modal opens or state changes)
  const fetchModalDistricts = async (sId: number) => {
    if (!sId) return [];
    setLoadingModalDistricts(true);
    try {
      const response = await callApi(`${API_ROUTES.getHealthInstituteDistricts}/${sId}`, null, "GET");
      const list = response?.data?.districts || response?.districts || response?.data || [];
      if (Array.isArray(list)) {
        setModalDistricts(list);
        return list;
      }
      return [];
    } catch (err) {
      console.error(`Dashboard failed to fetch modal districts for state ${sId}:`, err);
      return [];
    } finally {
      setLoadingModalDistricts(false);
    }
  };

  // Formik for updating profile details: POST /api/healthInstitute/updateHealthInstituteProfile
  const formik = useFormik<EditInstituteProfileFormValues>({
    initialValues: {
      registrationNumber: instituteData?.profileDetails?.registrationNumber || "",
      phone: instituteData?.profileDetails?.phone || "",
      address: instituteData?.profileDetails?.address || "",
      stateId: instituteData?.profileDetails?.stateId || "",
      districtId: instituteData?.profileDetails?.districtId || "",
      pincode: instituteData?.profileDetails?.pincode || "",
    },
    validationSchema: editProfileSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      setUpdateError(null);
      setUpdateSuccess(null);

      try {
        const payload = {
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
          setUpdateSuccess("Institute details updated successfully!");
          await fetchDetails();
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
    const currentStateId = instituteData?.profileDetails?.stateId || "";
    const currentDistrictId = instituteData?.profileDetails?.districtId || "";

    formik.resetForm({
      values: {
        registrationNumber: instituteData?.profileDetails?.registrationNumber || "",
        phone: instituteData?.profileDetails?.phone || "",
        address: instituteData?.profileDetails?.address || "",
        stateId: currentStateId,
        districtId: currentDistrictId,
        pincode: instituteData?.profileDetails?.pincode || "",
      },
    });

    setUpdateError(null);
    setUpdateSuccess(null);
    setIsEditModalOpen(true);

    const fetchedStates = await fetchModalStates();
    const activeStateId = currentStateId || (fetchedStates.length > 0 ? fetchedStates[0].id : null);
    if (activeStateId) {
      if (!currentStateId && fetchedStates.length > 0) {
        formik.setFieldValue("stateId", activeStateId);
      }
      const fetchedDistricts = await fetchModalDistricts(Number(activeStateId));
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
      const fetched = await fetchModalDistricts(newSId);
      if (fetched.length > 0) {
        formik.setFieldValue("districtId", fetched[0].id);
      }
    }
  };

  const handleStateChange = (stateId: number) => {
    setSelectedStateId(stateId);
    setDistrictSearchTerm("");
    fetchDistrictsByState(stateId);
  };

  const handleOpenExplorer = async () => {
    const fetchedStates = await fetchStates();
    const activeStateId =
      selectedStateId ||
      (instituteData?.profileDetails?.stateId ? Number(instituteData.profileDetails.stateId) : null) ||
      (fetchedStates?.[0]?.id ?? null);

    if (activeStateId) {
      setSelectedStateId(Number(activeStateId));
      fetchDistrictsByState(Number(activeStateId));
    }
  };

  const instituteName =
    instituteData?.profileDetails?.healthInstituteName ||
    user?.healthInstituteName ||
    "Official Healthcare Facility";
  const instituteId =
    instituteData?.healthInstituteId || user?.healthInstituteId || "HND000001";
  
  const instituteStateId = instituteData?.profileDetails?.stateId;
  const instituteDistrictId = instituteData?.profileDetails?.districtId;

  // State and District names directly from getHealthInstituteDetails
  const instituteStateName = instituteData?.profileDetails?.stateName || null;
  const instituteDistrictName = instituteData?.profileDetails?.districtName || null;

  // Selected State object
  const selectedState = useMemo(() => {
    return states.find((s) => s.id === selectedStateId) || null;
  }, [states, selectedStateId]);

  // Filtered districts by search term
  const filteredDistricts = useMemo(() => {
    if (!districtSearchTerm.trim()) return districts;
    const query = districtSearchTerm.toLowerCase();
    return districts.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        (d.code && d.code.toLowerCase().includes(query))
    );
  }, [districts, districtSearchTerm]);

  const STATS = [
    {
      label: "Affiliated Doctors",
      value: "24",
      change: "+3 this month",
      icon: <Stethoscope className="w-5 h-5 text-teal-600" />,
      color: "bg-teal-50 border-teal-200 text-teal-900",
    },
    {
      label: "OPD Patient Records",
      value: "1,248",
      change: "+12% overall",
      icon: <Users className="w-5 h-5 text-cyan-600" />,
      color: "bg-cyan-50 border-cyan-200 text-cyan-900",
    },
    {
      label: "States ABDM Registry",
      value: `${states.length || "36"} States`,
      change: "National Coverage",
      icon: <Globe className="w-5 h-5 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    {
      label: "ABDM Gateway Sync",
      value: "99.9%",
      change: "Fully Compliant",
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-200 text-indigo-900",
    },
  ];

  const RECENT_ACTIVITIES = [
    {
      id: 1,
      title: "Doctor Affiliation Verified",
      time: "10 mins ago",
      desc: "Dr. Ananya Sharma (Cardiology) profile linked to institute.",
    },
    {
      id: 2,
      title: "Health Record Pushed to ABDM",
      time: "45 mins ago",
      desc: "OPD Visit Summary #AB-8849 synced with National Health Vault.",
    },
    {
      id: 3,
      title: "Regional State Registry Synced",
      time: "1 hour ago",
      desc: "Updated ABDM state & district nodal endpoints with Ministry registry.",
    },
    {
      id: 4,
      title: "Institute License Verified",
      time: "2 hours ago",
      desc: "Annual Hospital Registration license verified with State Council.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="teal"
              className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs px-3 py-1"
            >
              <Building2 className="w-3.5 h-3.5 mr-1" />
              Official Facility Terminal
            </Badge>
            <Badge
              variant="outline"
              className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-950/40"
            >
              <Radio className="w-3 h-3 mr-1 animate-pulse text-emerald-400" />
              ABDM Gateway Connected
            </Badge>

            {instituteStateName && (
              <Badge
                variant="outline"
                className="text-xs text-teal-300 border-teal-500/40 bg-teal-950/50 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-teal-400" />
                {instituteDistrictName ? `${instituteDistrictName}, ` : ""}
                {instituteStateName}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {instituteName}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl font-mono flex items-center gap-2">
              Health Institute ID:{" "}
              <span className="text-teal-300 font-bold">{instituteId}</span>
              {loadingInstitute && (
                <span className="text-xs text-slate-500 font-sans">
                  (Loading details...)
                </span>
              )}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/health-institute/profile">
              <Button variant="emerald" className="font-bold text-xs px-5 cursor-pointer">
                View Institute Profile
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={openEditModal}
              className="bg-slate-800/80 hover:bg-slate-700 text-teal-300 hover:text-white border-slate-700 font-bold text-xs px-4 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
              Edit Institute Details
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat, i) => (
          <Card
            key={i}
            className="border-slate-200 shadow-xs hover:shadow-md transition-shadow bg-white"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className={`p-3 rounded-2xl border ${stat.color}`}>{stat.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ABDM Regional Jurisdiction & District Coverage Explorer (State & District API Integration) */}
      <Card className="border-slate-200 shadow-xs bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <Compass className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  ABDM Regional Health Jurisdiction & District Registry
                </CardTitle>
              </div>
              <p className="text-xs text-slate-500">
                Explore official state health councils, connected ABDM districts, and regional hospital network circles.
              </p>
            </div>

            {/* State Selector & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
                  Select State:
                </label>
                <select
                  value={selectedStateId || ""}
                  onChange={(e) => handleStateChange(Number(e.target.value))}
                  onFocus={() => {
                    if (states.length === 0) handleOpenExplorer();
                  }}
                  disabled={loadingStates}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
                >
                  {states.length === 0 && (
                    <option value="">Select State (Click Sync)</option>
                  )}
                  {states.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} {st.code ? `(${st.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExplorer}
                disabled={loadingStates || loadingDistricts}
                className="text-xs text-slate-700 hover:text-teal-700 border-slate-300 h-8 px-3"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 ${
                    loadingStates || loadingDistricts ? "animate-spin text-teal-600" : ""
                  }`}
                />
                Sync Registry
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Active State Details Banner */}
          <div className="bg-linear-to-r from-teal-50/70 via-cyan-50/50 to-slate-50 border border-teal-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {selectedState?.code || "IN"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {selectedState?.name || "Selected State"}
                  {instituteStateId && Number(instituteStateId) === selectedStateId && (
                    <Badge
                      variant="teal"
                      className="text-[10px] bg-teal-100 text-teal-800 border-teal-200 py-0"
                    >
                      Facility Base State
                    </Badge>
                  )}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  State ID: #{selectedStateId} • ABDM Node Protocol v3.2
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Registered Districts
                </span>
                <p className="font-bold text-slate-800">
                  {loadingDistricts ? "Loading..." : `${districts.length} Districts`}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Gateway Status
                </span>
                <p className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Active & Synced
                </p>
              </div>
            </div>
          </div>

          {/* Search bar & Districts Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Districts in {selectedState?.name || "State"} ({filteredDistricts.length} found)
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Filter district by name..."
                value={districtSearchTerm}
                onChange={(e) => setDistrictSearchTerm(e.target.value)}
                className="pl-8 py-1.5 h-8 text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Error Message if any */}
          {(errorStates || errorDistricts) && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorStates || errorDistricts}</span>
            </div>
          )}

          {/* Loading Districts Spinner / Grid */}
          {loadingDistricts ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <p className="text-xs font-medium">
                Fetching districts for {selectedState?.name || "state"}...
              </p>
            </div>
          ) : filteredDistricts.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-600">
                No districts match your search in {selectedState?.name || "this state"}.
              </p>
              {districtSearchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDistrictSearchTerm("")}
                  className="text-xs text-teal-700 h-7"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredDistricts.map((district) => {
                const isInstituteDistrict =
                  instituteDistrictId && Number(instituteDistrictId) === district.id;

                return (
                  <div
                    key={district.id}
                    className={`p-3 rounded-xl border transition-all text-left flex items-start justify-between gap-2 ${
                      isInstituteDistrict
                        ? "bg-teal-50/80 border-teal-300 shadow-xs ring-1 ring-teal-400/40"
                        : "bg-slate-50/60 hover:bg-white border-slate-200 hover:border-teal-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isInstituteDistrict ? "text-teal-700" : "text-slate-400"
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {district.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500 bg-white/80 px-1.5 py-0.5 rounded-md border border-slate-200">
                          {district.code || `ID:${district.id}`}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          ABDM Linked
                        </span>
                      </div>
                    </div>

                    {isInstituteDistrict && (
                      <Badge
                        variant="teal"
                        className="text-[9px] px-1.5 py-0 bg-teal-600 text-white shrink-0"
                      >
                        Base
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions & Overview */}
        <Card className="lg:col-span-7 border-slate-200 shadow-xs bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-700" />
              Facility Operations & Quick Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all bg-slate-50/50 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Institute Profile</h4>
                <p className="text-xs text-slate-500">
                  Manage hospital name, category, license number, and location details.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    to="/health-institute/profile"
                    className="text-xs font-bold text-teal-700 hover:underline"
                  >
                    Go to Profile →
                  </Link>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="text-xs font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    Quick Edit →
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all bg-slate-50/50 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Doctor Roster</h4>
                <p className="text-xs text-slate-500">
                  View and manage doctors affiliated with your healthcare facility.
                </p>
                <span className="inline-block pt-1 text-xs font-bold text-slate-400">
                  Coming Soon
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit / Event Log */}
        <Card className="lg:col-span-5 border-slate-200 shadow-xs bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-700" />
              Recent Facility Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {RECENT_ACTIVITIES.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-teal-600 mt-2 shrink-0"></div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Details Modal (POST /api/healthInstitute/updateHealthInstituteProfile) */}
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
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
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
                    Registration / License Number *
                  </label>
                  <Input
                    type="text"
                    name="registrationNumber"
                    placeholder="e.g. NH-2026/8879"
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
                    placeholder="e.g. 0187243563"
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
                    placeholder="e.g. Phool Bagan, Kolkata"
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
                      {loadingModalStates && (
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
                      disabled={loadingModalStates}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select State</option>
                      {modalStates.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} {st.code ? `(${st.code})` : ""}
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
                      {loadingModalDistricts && (
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
                      disabled={loadingModalDistricts || !formik.values.stateId}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select District</option>
                      {modalDistricts.map((dist) => (
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
                    placeholder="e.g. 700009"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.pincode && formik.errors.pincode
                        ? formik.errors.pincode
                        : undefined
                    }
                  />
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={formik.isSubmitting}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="emerald"
                    disabled={formik.isSubmitting}
                    className="text-xs font-bold px-5"
                  >
                    {formik.isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Profile Details"
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

export default HealthInstituteDashboardPage;

