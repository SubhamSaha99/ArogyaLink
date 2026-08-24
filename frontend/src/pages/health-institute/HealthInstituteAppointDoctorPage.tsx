import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  ShieldCheck,
  Building2,
  Eye,
  X,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

export interface DoctorListItem {
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

// Module-level cache to deduplicate concurrent or repeated master data requests
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
  if (cachedMasterData) {
    return cachedMasterData;
  }
  if (masterDataInFlightPromise) {
    return masterDataInFlightPromise;
  }

  masterDataInFlightPromise = (async () => {
    try {
      const [councilsResp, statesResp] = await Promise.all([
        callApi(API_ROUTES.getHealthInstituteRegistrationCouncils, null, "GET"),
        callApi(API_ROUTES.getHealthInstituteStates, null, "GET"),
      ]);

      const councilsData = councilsResp?.data || councilsResp;
      const councilsList =
        councilsData?.registrationCouncils ||
        (Array.isArray(councilsData) ? councilsData : []);

      const statesData = statesResp?.data || statesResp;
      const statesList =
        statesData?.states || (Array.isArray(statesData) ? statesData : []);

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
  const { user } = useAuth();

  // Doctor List API State
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedCouncilId, setSelectedCouncilId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Master Data State (Councils and States)
  const [states, setStates] = useState<MasterDataItem[]>([]);
  const [councils, setCouncils] = useState<MasterDataItem[]>([]);

  // Modal State for Appointment
  const [selectedDoctorForAppointment, setSelectedDoctorForAppointment] =
    useState<DoctorListItem | null>(null);

  // Appointment Form State
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

  const hasFetchedOnceRef = useRef<boolean>(false);
  const lastQueryKeyRef = useRef<string>("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Master Data: GET /api/healthInstitute/registrationCouncils & GET /api/healthInstitute/states
  const fetchMasterData = useCallback(async () => {
    try {
      const data = await getCachedHealthInstituteMasterData();
      if (Array.isArray(data?.councils)) {
        setCouncils(data.councils);
      }
      if (Array.isArray(data?.states)) {
        setStates(data.states);
      }
    } catch (err) {
      console.error("Failed to load registration councils / states:", err);
    }
  }, []);

  // Main Doctor List Fetcher: POST /api/doctor/getDoctorList
  const fetchDoctors = useCallback(async (force = false) => {
    const offset = (currentPage - 1) * limit;
    const searchVal = debouncedSearch.trim();
    const queryKey = `${currentPage}-${limit}-${searchVal}-${selectedStateId}-${selectedCouncilId}`;

    if (!force && lastQueryKeyRef.current === queryKey) {
      return;
    }
    lastQueryKeyRef.current = queryKey;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        offset,
        limit,
        search: searchVal || undefined,
        stateId: selectedStateId ? Number(selectedStateId) : null,
        councilId: selectedCouncilId ? Number(selectedCouncilId) : null,
      };

      const response = await callApi(API_ROUTES.getDoctorList, payload, "POST");

      const responseData = response?.data || response;
      const docList = responseData?.doctors || [];
      const total = responseData?.total ?? docList.length;

      setDoctors(Array.isArray(docList) ? docList : []);
      setTotalCount(typeof total === "number" ? total : Number(total) || 0);
    } catch (err: any) {
      console.error("Failed to fetch doctor list:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load doctor registry. Please try again."
      );
      setDoctors([]);
      setTotalCount(0);
      lastQueryKeyRef.current = "";
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearch, selectedStateId, selectedCouncilId]);

  // Initial & Filter Trigger
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Load master data on initial mount
  useEffect(() => {
    if (!hasFetchedOnceRef.current) {
      hasFetchedOnceRef.current = true;
      fetchMasterData();
    }
  }, [fetchMasterData]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStateId(null);
    setSelectedCouncilId(null);
    setCurrentPage(1);
    lastQueryKeyRef.current = "";
  };

  // Submit Doctor Appointment
  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForAppointment) return;

    setIsSubmittingAppointment(true);
    try {
      // Simulate appointment workflow / link record
      await new Promise((resolve) => setTimeout(resolve, 800));

      setAppointmentSuccessMessage(
        `Dr. ${selectedDoctorForAppointment.firstName} ${selectedDoctorForAppointment.lastName} has been successfully appointed as ${appointmentDesignation} (${appointmentDept}) at ${
          user?.healthInstituteName || "your institute"
        }!`
      );

      setTimeout(() => {
        setAppointmentSuccessMessage(null);
        setSelectedDoctorForAppointment(null);
        // Reset form
        setAppointmentDept("General Medicine");
        setAppointmentDesignation("Consultant");
        setAppointmentNotes("");
      }, 2000);
    } catch (err: any) {
      console.error("Appointment error:", err);
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  const getDoctorFullName = (doc: DoctorListItem) => {
    const parts = [doc.firstName, doc.middleName, doc.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Unnamed Medical Practitioner";
  };

  const getDoctorInitials = (doc: DoctorListItem) => {
    const first = doc.firstName?.charAt(0) || "D";
    const last = doc.lastName?.charAt(0) || "R";
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero Header */}
      <div className="bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="teal"
              className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs px-3 py-1"
            >
              <Building2 className="w-3.5 h-3.5 mr-1" />
              Facility Doctor Registry
            </Badge>
            <Badge
              variant="outline"
              className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-950/40 flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              National Doctor Council Synced
            </Badge>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Appoint Certified Doctors
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Search the central ABDM medical registry, verify practitioner registration numbers &
              licenses, and recruit certified medical specialists to your institute.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>
                Total Registry Practitioners:{" "}
                <strong className="text-white font-mono">{totalCount}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Current Page:{" "}
                <strong className="text-white font-mono">
                  {currentPage} of {totalPages}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <Card className="border-slate-200 shadow-xs bg-white">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search by Doctor ID (e.g. DOC000001), or Medical Reg No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-12 py-2 text-sm bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* State Filter, Council Filter, and Limit Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* State Filter */}
              <div className="flex items-center gap-2 min-w-[170px]">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedStateId || ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setSelectedStateId(val);
                    setCurrentPage(1);
                  }}
                  onFocus={fetchMasterData}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="">All States</option>
                  {states.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} {st.code ? `(${st.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Medical Council Filter */}
              <div className="flex items-center gap-2 min-w-[190px]">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedCouncilId || ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setSelectedCouncilId(val);
                    setCurrentPage(1);
                  }}
                  onFocus={fetchMasterData}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="">All Medical Councils</option>
                  {councils.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.code ? `(${c.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Per Page:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDoctors(true)}
                disabled={loading}
                className="text-xs text-slate-700 hover:text-teal-700 border-slate-200 h-9 px-3 rounded-xl cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-teal-600" : ""}`}
                />
                Refresh
              </Button>

              {(searchTerm || selectedStateId || selectedCouncilId) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-red-600 hover:bg-red-50 border-red-200 h-9 px-3 rounded-xl cursor-pointer"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Banner if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDoctors(true)}
            className="text-xs text-red-700 border-red-300 hover:bg-red-100 h-8"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Doctor List Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4 bg-white rounded-3xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-slate-700">Loading Doctor Registry...</p>
            <p className="text-xs text-slate-400">
              Querying verified practitioners from central medical database.
            </p>
          </div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="py-20 text-center bg-white border border-dashed border-slate-300 rounded-3xl space-y-4 p-6">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Doctors Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchTerm || selectedStateId
                ? "No registered doctors match your current search criteria or state filter."
                : "No registered doctors are currently available in the central registry."}
            </p>
          </div>
          {(searchTerm || selectedStateId) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-teal-700 border-teal-300 hover:bg-teal-50"
            >
              Reset All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>
              Showing{" "}
              <strong className="text-slate-800">
                {(currentPage - 1) * limit + 1}–
                {Math.min(currentPage * limit, totalCount)}
              </strong>{" "}
              of <strong className="text-slate-800">{totalCount}</strong> doctors
            </span>
            <span>Sorted by Recent Registration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => {
              const fullName = getDoctorFullName(doctor);
              const initials = getDoctorInitials(doctor);
              const isLicenseActive = doctor.licenseStatus === 1;

              return (
                <Card
                  key={doctor.doctorId}
                  className="border-slate-200 shadow-xs hover:shadow-md transition-all hover:border-teal-300 bg-white overflow-hidden flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top Row: Avatar, Name & ID */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-500 to-cyan-700 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h3 className="text-base font-bold text-slate-900 truncate flex items-center gap-1.5">
                            Dr. {fullName}
                            {isLicenseActive && (
                              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                              {doctor.doctorId}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* License Status Badge */}
                      {isLicenseActive ? (
                        <Badge
                          variant="emerald"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shrink-0"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                          Active License
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] shrink-0"
                        >
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          Unverified
                        </Badge>
                      )}
                    </div>

                    {/* Middle Details: Medical Registration, State, and Council */}
                    <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Medical Reg No
                          </span>
                          <p className="font-semibold text-slate-800 font-mono truncate">
                            {doctor.medicalRegistration || "Not Assigned"}
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            State
                          </span>
                          <p className="font-semibold text-slate-800 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                            {doctor.registrationStateName || "National"}
                          </p>
                        </div>
                      </div>

                      {doctor.registrationCouncilName && (
                        <div className="space-y-0.5 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Medical Council
                          </span>
                          <p className="font-medium text-slate-700 text-[11px] truncate flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-cyan-600 shrink-0" />
                            {doctor.registrationCouncilName}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Bottom Action Footer */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center">
                    <Link to={`/health-institute/doctors/${doctor.doctorId}`} className="w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 border-teal-200 h-8 px-3 cursor-pointer font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Doctor Details →
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
                <strong className="text-slate-800">{totalPages}</strong>
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || loading}
                  className="text-xs text-slate-700 border-slate-300 h-8 px-3 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = currentPage - 2 + i;
                      if (pageNum > totalPages) {
                        pageNum = totalPages - 4 + i;
                      }
                    }
                    if (pageNum <= 0 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? "bg-teal-600 text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || loading}
                  className="text-xs text-slate-700 border-slate-300 h-8 px-3 cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appoint Doctor Modal */}
      {selectedDoctorForAppointment && (
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
                  setSelectedDoctorForAppointment(null);
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
                    Dr. {getDoctorFullName(selectedDoctorForAppointment)}
                  </h4>
                  <p className="text-xs text-slate-600 font-mono">
                    ID: {selectedDoctorForAppointment.doctorId} • Reg:{" "}
                    {selectedDoctorForAppointment.medicalRegistration || "N/A"}
                  </p>
                  {(selectedDoctorForAppointment.registrationCouncilName ||
                    selectedDoctorForAppointment.registrationStateName) && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      {[
                        selectedDoctorForAppointment.registrationCouncilName,
                        selectedDoctorForAppointment.registrationStateName,
                      ]
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
                      onClick={() => setSelectedDoctorForAppointment(null)}
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

export default HealthInstituteAppointDoctorPage;

