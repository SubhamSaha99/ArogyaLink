import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

export interface MasterDataItem {
  id: number;
  name: string;
  code?: string;
}

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

  // Initial Load: ONLY Fetch Institute Details once
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchDetails();
  }, [fetchDetails]);

  // Handle State Selector change or on-demand loading
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

  const instituteStateName = instituteData?.profileDetails?.stateName || null;
  const instituteDistrictName = instituteData?.profileDetails?.districtName || null;

  const selectedState = useMemo(() => {
    return states.find((s) => s.id === selectedStateId) || null;
  }, [states, selectedStateId]);

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
      title: "ABDM Gateway Synced",
      time: "1 hour ago",
      desc: "Successfully pushed 42 OPD patient encounters to the national repository.",
    },
    {
      id: 3,
      title: "District Registry Updated",
      time: "Yesterday",
      desc: "Facility address confirmed with state medical directorate.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-cyan-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="cyan"
              className="text-xs px-3 py-1 font-bold"
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
                className="text-xs text-cyan-300 border-cyan-500/40 bg-cyan-950/50 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-cyan-400" />
                {instituteDistrictName ? `${instituteDistrictName}, ` : ""}
                {instituteStateName}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Welcome, {instituteName}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl font-mono flex items-center gap-2">
              Health Institute ID:{" "}
              <span className="text-cyan-300 font-bold">{instituteId}</span>
              {loadingInstitute && (
                <span className="text-xs text-slate-500 font-sans">
                  (Loading details...)
                </span>
              )}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/health-institute/profile">
              <Button variant="cyan" className="font-bold text-xs px-5 cursor-pointer shadow-md">
                View Institute Profile
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat, i) => (
          <Card
            key={i}
            className="border-slate-200 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl"
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
      <Card className="border-slate-200 shadow-xs bg-white rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-100 text-cyan-800">
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
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-xs"
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
                className="text-xs text-slate-700 hover:text-cyan-700 border-slate-300 h-8 px-3 rounded-xl cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 ${
                    loadingStates || loadingDistricts ? "animate-spin text-cyan-600" : ""
                  }`}
                />
                Sync Registry
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Active State Details Banner */}
          <div className="bg-linear-to-r from-cyan-50/70 via-teal-50/50 to-slate-50 border border-cyan-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {selectedState?.code || "IN"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {selectedState?.name || "Selected State"}
                  {instituteStateId && Number(instituteStateId) === selectedStateId && (
                    <Badge
                      variant="cyan"
                      className="text-[10px] py-0"
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
              <Network className="w-4 h-4 text-cyan-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Districts in {selectedState?.name || "State"} ({filteredDistricts.length} found)
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Filter district by name..."
                value={districtSearchTerm}
                onChange={(e) => setDistrictSearchTerm(e.target.value)}
                icon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                className="h-9 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
              />
            </div>
          </div>

          {/* Error Message if any */}
          {(errorStates || errorDistricts) && (
            <Alert variant="destructive" className="p-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <AlertDescription className="text-xs font-medium">
                {errorStates || errorDistricts}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading Districts Spinner / Grid */}
          {loadingDistricts ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-600" />
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
                  className="text-xs text-cyan-700 h-7 rounded-xl"
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
                    className={`p-3 rounded-2xl border transition-all text-left flex items-start justify-between gap-2 ${
                      isInstituteDistrict
                        ? "bg-cyan-50/80 border-cyan-300 shadow-xs ring-1 ring-cyan-400/40"
                        : "bg-slate-50/60 hover:bg-white border-slate-200 hover:border-cyan-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isInstituteDistrict ? "text-cyan-700" : "text-slate-400"
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
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          ABDM Linked
                        </span>
                      </div>
                    </div>

                    {isInstituteDistrict && (
                      <Badge
                        variant="cyan"
                        className="text-[9px] px-1.5 py-0 shrink-0 font-bold"
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
        <Card className="lg:col-span-7 border-slate-200 shadow-xs bg-white rounded-3xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-700" />
              Facility Operations & Quick Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-xs transition-all bg-slate-50/50 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Institute Profile</h4>
                <p className="text-xs text-slate-500">
                  Manage hospital name, category, license number, and location details.
                </p>
                <Link
                  to="/health-institute/profile"
                  className="inline-block pt-1 text-xs font-bold text-cyan-700 hover:underline"
                >
                  Go to Profile →
                </Link>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 hover:border-cyan-400 hover:shadow-xs transition-all bg-slate-50/50 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Doctor Roster</h4>
                <p className="text-xs text-slate-500">
                  Search, verify medical registration, and appoint doctors to your facility.
                </p>
                <Link
                  to="/health-institute/appoint-doctor"
                  className="inline-block pt-1 text-xs font-bold text-teal-700 hover:underline"
                >
                  Appoint & Manage Doctors →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit / Event Log */}
        <Card className="lg:col-span-5 border-slate-200 shadow-xs bg-white rounded-3xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-700" />
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
                  <div className="w-2 h-2 rounded-full bg-cyan-600 mt-2 shrink-0" />
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
    </div>
  );
};

export default HealthInstituteDashboardPage;

