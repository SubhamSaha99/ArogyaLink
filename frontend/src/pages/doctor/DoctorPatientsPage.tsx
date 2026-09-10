import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Sparkles,
  AlertCircle,
  FileText,
  Activity,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { themeStyles } from "@/styles/themeStyles";

export interface PatientListItem {
  patientPrimaryKey: number;
  patientId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  age?: number;
  gender?: number; // 1: Male, 2: Female, 3: Other
}

export interface StateItem {
  id: number;
  name: string;
  code: string;
}

const getGenderLabel = (gender?: number): { text: string; variant: "teal" | "emerald" | "secondary" | "outline" } => {
  switch (gender) {
    case 1:
      return { text: "Male", variant: "teal" };
    case 2:
      return { text: "Female", variant: "secondary" };
    case 3:
      return { text: "Other", variant: "outline" };
    default:
      return { text: "Not Specified", variant: "outline" };
  }
};

export const DoctorPatientsPage: React.FC = () => {
  const { user } = useAuth();

  // Patients list & pagination state
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedGender, setSelectedGender] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(9);

  // States dropdown master data
  const [statesList, setStatesList] = useState<StateItem[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean>(false);

  const lastQueryKeyRef = useRef<string>("");

  // Debounce search term by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch states master data once
  useEffect(() => {
    void (async () => {
      setLoadingStates(true);
      try {
        const resp = await callApi(API_ROUTES.getPatientStates, null, "GET");
        const data = resp?.data || resp;
        const list = data?.states || (Array.isArray(data) ? data : []);
        setStatesList(list);
      } catch (err) {
        console.warn("Could not load states list for patient filtering:", err);
      } finally {
        setLoadingStates(false);
      }
    })();
  }, []);

  // Fetch patients list from POST /api/patient/getPatientsList
  const fetchPatientsList = useCallback(
    async (force = false) => {
      const offset = (currentPage - 1) * limit;

      const payload = {
        offset,
        limit,
        search: debouncedSearch.trim() || undefined,
        stateId: selectedStateId ? Number(selectedStateId) : undefined,
      };

      const queryKey = JSON.stringify(payload);
      if (!force && lastQueryKeyRef.current === queryKey) {
        return;
      }
      lastQueryKeyRef.current = queryKey;

      setLoading(true);
      setError(null);

      try {
        const response = await callApi(
          API_ROUTES.getPatientsList,
          payload,
          "POST"
        );

        const data = response?.data || response;
        if (data && Array.isArray(data.patients)) {
          setPatients(data.patients);
          setTotalCount(Number(data.total ?? data.patients.length));
        } else if (Array.isArray(data)) {
          setPatients(data);
          setTotalCount(data.length);
        } else {
          setPatients([]);
          setTotalCount(0);
        }
      } catch (err: any) {
        console.error("Failed to fetch patients list:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load patient records from directory."
        );
        lastQueryKeyRef.current = "";
      } finally {
        setLoading(false);
      }
    },
    [currentPage, limit, debouncedSearch, selectedStateId]
  );

  useEffect(() => {
    void (async () => {
      await fetchPatientsList();
    })();
  }, [fetchPatientsList]);

  // Client-side gender filtering if selected
  const displayedPatients = selectedGender
    ? patients.filter((p) => String(p.gender) === selectedGender)
    : patients;

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStateId(null);
    setSelectedGender("");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedStateId !== null || selectedGender !== ""
  );

  // Quick stats derived
  const maleCount = patients.filter((p) => p.gender === 1).length;
  const femaleCount = patients.filter((p) => p.gender === 2).length;

  return (
    <div className={themeStyles.layout.pageContainer}>
      {/* Header Banner */}
      <div className={themeStyles.layout.headerBannerLight}>
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-teal-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className={themeStyles.typography.pillTeal}>
              National Health Registry
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-500 font-mono">
              {user?.doctorId || "Doctor Terminal"}
            </Badge>
          </div>
          <h1 className={themeStyles.combine(themeStyles.typography.h1, "flex items-center gap-2.5")}>
            <Users className="w-6 h-6 text-teal-700" />
            Registered Patients
          </h1>
          <p className={themeStyles.typography.subtext}>
            Browse, search, and access clinical profiles of registered patients across
            connected healthcare facilities and national digital health records.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPatientsList(true)}
            disabled={loading}
            className="text-xs border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer h-9 px-3.5 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={themeStyles.layout.grid4}>
        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Total Registered Patients
              </span>
              <p className="text-2xl font-black text-slate-900">
                {totalCount}
              </p>
            </div>
            <div className={themeStyles.iconBadge.teal}>
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Current Page Count
              </span>
              <p className="text-2xl font-black text-emerald-600">
                {displayedPatients.length}
              </p>
            </div>
            <div className={themeStyles.iconBadge.emerald}>
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Demographics (M / F)
              </span>
              <p className="text-2xl font-black text-cyan-700">
                {maleCount} <span className="text-slate-400 text-lg font-normal">/</span> {femaleCount}
              </p>
            </div>
            <div className={themeStyles.iconBadge.cyan}>
              <HeartPulse className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                EHR Synchronized
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ABDM Compatible
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className={themeStyles.card.base}>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search patient name or Patient ID (e.g. PAT...)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs rounded-xl h-9"
              />
            </div>

            {/* Gender Filter */}
            <div>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="">All Genders</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
                <option value="3">Other</option>
              </select>
            </div>

            {/* State Filter */}
            <div>
              <select
                value={selectedStateId ?? ""}
                onChange={(e) => {
                  setSelectedStateId(e.target.value ? Number(e.target.value) : null);
                  setCurrentPage(1);
                }}
                disabled={loadingStates}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:bg-slate-50"
              >
                <option value="">All States</option>
                {statesList.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Helper */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Filtered results for active criteria
              </span>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" />
                Clear All Filters
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="p-4">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className={themeStyles.state.loading}>
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            Loading registered patients...
          </p>
          <p className={themeStyles.typography.subtext}>
            Querying patient index and digital health identifiers from registry.
          </p>
        </div>
      ) : displayedPatients.length === 0 ? (
        <div className={themeStyles.state.empty}>
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-100">
            <Users className="w-8 h-8 text-teal-600" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              {hasActiveFilters
                ? "No matching patients found"
                : "No registered patients found"}
            </h3>
            <p className={themeStyles.typography.subtext}>
              {hasActiveFilters
                ? "Try adjusting your search term, gender, or state filters to locate patient records."
                : "No patient records have been registered in the system yet."}
            </p>
          </div>

          {hasActiveFilters && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs cursor-pointer rounded-xl"
              >
                <FilterX className="w-3.5 h-3.5 mr-1" />
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Patients Grid */}
          <div className={themeStyles.layout.grid3}>
            {displayedPatients.map((patient) => {
              const fullName = [patient.firstName, patient.middleName, patient.lastName]
                .filter(Boolean)
                .join(" ");

              const initials = [
                patient.firstName?.charAt(0) || "P",
                patient.lastName?.charAt(0) || "T",
              ]
                .join("")
                .toUpperCase();

              const genderInfo = getGenderLabel(patient.gender);

              return (
                <Card
                  key={`${patient.patientPrimaryKey}-${patient.patientId}`}
                  className={themeStyles.combine(
                    themeStyles.card.base,
                    "flex flex-col justify-between overflow-hidden group"
                  )}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top Patient Profile Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className={themeStyles.combine(themeStyles.typography.h4, "truncate")}>
                            {fullName || "Registered Patient"}
                          </h4>
                          <span className={themeStyles.typography.monoTeal}>
                            {patient.patientId}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant="verified"
                        className="text-[10px] shrink-0 font-bold"
                      >
                        Registered
                      </Badge>
                    </div>

                    {/* Patient Attributes */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Gender
                        </span>
                        <Badge
                          variant={genderInfo.variant}
                          className="text-[11px] font-semibold"
                        >
                          {genderInfo.text}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Age
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {patient.age ? `${patient.age} Years` : "Not Specified"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Record ID
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-600">
                          #{patient.patientPrimaryKey}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  {/* Card Action Footer */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-teal-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      ABDM Linked
                    </span>
                    <Link
                      to={`/doctor/dashboard?patientId=${patient.patientId}`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 h-8 px-2.5 cursor-pointer font-bold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Clinical History &rarr;
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
                Showing{" "}
                <strong className="text-slate-800">
                  {(currentPage - 1) * limit + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-slate-800">
                  {Math.min(currentPage * limit, totalCount)}
                </strong>{" "}
                of <strong className="text-slate-800">{totalCount}</strong> registered patients
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
    </div>
  );
};

export default DoctorPatientsPage;
