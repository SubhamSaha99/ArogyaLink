import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  Building2,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

export interface DoctorListItem {
  doctorPrimaryKey?: number;
  doctorId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  medicalRegistration?: string;
  licenseStatus?: number;
  registrationStateId?: number;
  registrationCouncilId?: number;
  registrationStateName?: string;
  registrationCouncilName?: string;
}

export interface MasterDataItem {
  id: number;
  name: string;
  code?: string;
}

let cachedMasterData: {
  states: MasterDataItem[];
  councils: MasterDataItem[];
} | null = null;

let masterDataInFlightPromise: Promise<{
  states: MasterDataItem[];
  councils: MasterDataItem[];
}> | null = null;

const getCachedHealthInstituteMasterData = async (): Promise<{
  states: MasterDataItem[];
  councils: MasterDataItem[];
}> => {
  if (cachedMasterData) return cachedMasterData;
  if (masterDataInFlightPromise) return masterDataInFlightPromise;

  masterDataInFlightPromise = (async () => {
    try {
      const [councilsResp, statesResp] = await Promise.all([
        callApi(API_ROUTES.getHealthInstituteRegistrationCouncils, null, "GET"),
        callApi(API_ROUTES.getHealthInstituteStates, null, "GET"),
      ]);

      const councilsData = councilsResp?.data || councilsResp;
      const councilsList = councilsData?.registrationCouncils || (Array.isArray(councilsData) ? councilsData : []);
      const statesData = statesResp?.data || statesResp;
      const statesList = statesData?.states || (Array.isArray(statesData) ? statesData : []);

      cachedMasterData = {
        states: Array.isArray(statesList) ? statesList : [],
        councils: Array.isArray(councilsList) ? councilsList : [],
      };
      return cachedMasterData;
    } finally {
      masterDataInFlightPromise = null;
    }
  })();
  return masterDataInFlightPromise;
};

export const HealthInstituteAppointDoctorPage: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedCouncilId, setSelectedCouncilId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const [states, setStates] = useState<MasterDataItem[]>([]);
  const [councils, setCouncils] = useState<MasterDataItem[]>([]);

  const hasFetchedOnceRef = useRef<boolean>(false);
  const lastQueryKeyRef = useRef<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchMasterData = useCallback(async () => {
    try {
      const data = await getCachedHealthInstituteMasterData();
      if (Array.isArray(data?.councils)) setCouncils(data.councils);
      if (Array.isArray(data?.states)) setStates(data.states);
    } catch (err) {
      console.error("Failed to load health institute master data:", err);
    }
  }, []);

  const fetchDoctors = useCallback(async (force = false) => {
    const offset = (currentPage - 1) * limit;
    const queryKey = `${debouncedSearch}|${selectedStateId}|${selectedCouncilId}|${offset}|${limit}`;

    if (!force && lastQueryKeyRef.current === queryKey) return;
    lastQueryKeyRef.current = queryKey;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        offset,
        limit,
        search: debouncedSearch.trim() || undefined,
        stateId: selectedStateId ? Number(selectedStateId) : null,
        councilId: selectedCouncilId ? Number(selectedCouncilId) : null,
      };

      const response = await callApi(API_ROUTES.getDoctorList, payload, "POST");
      const data = response?.data || response;

      if (data && Array.isArray(data.doctors)) {
        setDoctors(data.doctors);
        setTotalCount(Number(data.total ?? data.doctors.length));
      } else if (Array.isArray(data)) {
        setDoctors(data);
        setTotalCount(data.length);
      } else {
        setDoctors([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error("Failed to fetch doctors list:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load doctor directory.");
      lastQueryKeyRef.current = "";
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearch, selectedStateId, selectedCouncilId]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (!hasFetchedOnceRef.current) {
      hasFetchedOnceRef.current = true;
      fetchMasterData();
    }
  }, [fetchMasterData]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStateId(null);
    setSelectedCouncilId(null);
    setCurrentPage(1);
    lastQueryKeyRef.current = "";
  };

  const getDoctorFullName = (doc: DoctorListItem) => {
    return [doc.firstName, doc.middleName, doc.lastName].filter(Boolean).join(" ") || "Unnamed Practitioner";
  };

  const getDoctorInitials = (doc: DoctorListItem) => {
    return `${doc.firstName?.charAt(0) || "D"}${doc.lastName?.charAt(0) || "R"}`.toUpperCase();
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return (
    <div className="space-y-8">
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-cyan-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs px-3 py-1 font-bold bg-cyan-500/20 text-cyan-200 border-cyan-500/30">
              <Building2 className="w-3.5 h-3.5 mr-1" />
              Facility Doctor Registry
            </Badge>
            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-950/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              National Doctor Council Synced
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Appoint Certified Doctors</h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">Search the central ABDM medical registry, verify practitioner registration numbers & licenses, and recruit certified medical specialists to your institute.</p>
          </div>
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Total Registry Practitioners: <strong className="text-white font-mono">{totalCount}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xs bg-white rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search by Doctor ID (e.g. DOC000001), or Medical Reg No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-xl pl-9"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedStateId || ""}
                onChange={(e) => {
                  setSelectedStateId(e.target.value ? Number(e.target.value) : null);
                  setCurrentPage(1);
                }}
                onFocus={fetchMasterData}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="">All States</option>
                {states.map((st) => <option key={st.id} value={st.id}>{st.name} {st.code ? `(${st.code})` : ""}</option>)}
              </select>
              <select
                value={selectedCouncilId || ""}
                onChange={(e) => {
                  setSelectedCouncilId(e.target.value ? Number(e.target.value) : null);
                  setCurrentPage(1);
                }}
                onFocus={fetchMasterData}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="">All Medical Councils</option>
                {councils.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                {[6, 10, 20, 50].map(n => <option key={n} value={n}>{n} rows</option>)}
              </select>
              <Button variant="outline" size="sm" onClick={() => fetchDoctors(true)} disabled={loading} className="h-9 px-3 rounded-xl">
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
              {(searchTerm || selectedStateId !== null || selectedCouncilId !== null) && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="text-red-600 h-9 px-3 rounded-xl">Clear Filters</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <Alert variant="destructive"><AlertCircle className="w-4 h-4" /><AlertDescription className="text-xs font-semibold">{error}</AlertDescription></Alert>}

      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">Fetching Central Doctor Directory...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <UserCheck className="w-8 h-8 text-cyan-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No doctors found</h3>
          <Button variant="outline" size="sm" onClick={handleClearFilters} className="rounded-xl">Reset All Filters</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doctor, index) => {
              const isLicenseActive = doctor.licenseStatus === 1 || doctor.licenseStatus === undefined;
              return (
                <Card key={doctor.doctorPrimaryKey || doctor.doctorId || index} className="border-slate-200 rounded-2xl">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black"><AvatarFallback>{getDoctorInitials(doctor)}</AvatarFallback></Avatar>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">Dr. {getDoctorFullName(doctor)} {isLicenseActive && <BadgeCheck className="w-4 h-4 text-emerald-600" />}</h3>
                        <span className="text-[11px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">{doctor.doctorId}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase">State</span>
                        <p className="font-semibold">{doctor.registrationStateName || "National"}</p>
                      </div>
                    </div>
                    <Link to={`/health-institute/doctors/${doctor.doctorPrimaryKey || doctor.doctorId}`}>
                      <Button variant="outline" size="sm" className="w-full text-cyan-700 rounded-xl">View Details →</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="rounded-xl"><ChevronLeft className="w-4 h-4" /></Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={currentPage === p ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(p)} className="w-8 h-8 p-0 rounded-xl">{p}</Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="rounded-xl"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthInstituteAppointDoctorPage;
