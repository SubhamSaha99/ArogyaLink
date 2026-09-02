import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  UserCheck,
  Search,
  RefreshCw,
  Plus,
  ShieldCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  Layers,
  FilterX,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { themeStyles } from "@/styles/themeStyles";

export interface AppointedDoctorItem {
  mappingId?: number;
  doctorPrimaryKey: number;
  doctorId: string;
  departmentId: number;
  departmentName: string;
  designationId: number;
  designationName: string;
  joiningDate: string;
  consultationScopeId: number;
  consultationScopeName: string;
  status: boolean;
  firstName: string;
  middleName?: string;
  lastName: string;
  medicalRegistration: string;
  licenseStatus: number;
}

export interface MasterDataItem {
  id: number;
  name: string;
  code?: string;
}

export interface AppointMasterData {
  departments: MasterDataItem[];
  designations: MasterDataItem[];
  consultationScopes: MasterDataItem[];
}

let cachedMasterData: AppointMasterData | null = null;
let masterDataInFlightPromise: Promise<AppointMasterData> | null = null;

const getCachedAppointMasterData = async (): Promise<AppointMasterData> => {
  if (cachedMasterData) {
    return cachedMasterData;
  }
  if (masterDataInFlightPromise) {
    return masterDataInFlightPromise;
  }

  masterDataInFlightPromise = (async () => {
    try {
      const resp = await callApi(
        API_ROUTES.getAppointDoctorMasterData,
        null,
        "GET"
      );
      const data = resp?.data || resp;
      cachedMasterData = {
        departments: Array.isArray(data?.departments) ? data.departments : [],
        designations: Array.isArray(data?.designations) ? data.designations : [],
        consultationScopes: Array.isArray(data?.consultationScopes)
          ? data.consultationScopes
          : [],
      };
      return cachedMasterData;
    } finally {
      masterDataInFlightPromise = null;
    }
  })();

  return masterDataInFlightPromise;
};

export const HealthInstituteAppointedDoctorsPage: React.FC = () => {
  const { user } = useAuth();

  // Appointed Doctors State
  const [appointedDoctors, setAppointedDoctors] = useState<
    AppointedDoctorItem[]
  >([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Pagination State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedDesignationId, setSelectedDesignationId] = useState<
    number | null
  >(null);
  const [selectedScopeId, setSelectedScopeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(9);

  // Master Filter Options
  const [masterData, setMasterData] = useState<AppointMasterData>({
    departments: [],
    designations: [],
    consultationScopes: [],
  });
  const [loadingMasterData, setLoadingMasterData] = useState<boolean>(false);

  const lastQueryKeyRef = useRef<string>("");

  // Debounce search input by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load master data once for filter dropdowns
  useEffect(() => {
    const loadMasterData = async () => {
      setLoadingMasterData(true);
      try {
        const data = await getCachedAppointMasterData();
        setMasterData(data);
      } catch (err) {
        console.error("Failed to load appoint doctor master data:", err);
      } finally {
        setLoadingMasterData(false);
      }
    };
    loadMasterData();
  }, []);

  // Fetch Appointed Doctors from POST /api/healthInstitute/getAppointedDoctorsList
  const fetchAppointedDoctors = useCallback(
    async (force = false) => {
      const offset = (currentPage - 1) * limit;

      const payload = {
        offset,
        limit,
        search: debouncedSearch.trim() || undefined,
        departmentId: selectedDeptId ? Number(selectedDeptId) : undefined,
        designationId: selectedDesignationId
          ? Number(selectedDesignationId)
          : undefined,
        consultationScopeId: selectedScopeId
          ? Number(selectedScopeId)
          : undefined,
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
          API_ROUTES.getAppointedDoctorsList,
          payload,
          "POST"
        );

        const data = response?.data || response;
        if (data && Array.isArray(data.doctors)) {
          setAppointedDoctors(data.doctors);
          setTotalCount(Number(data.total ?? data.doctors.length));
        } else if (Array.isArray(data)) {
          setAppointedDoctors(data);
          setTotalCount(data.length);
        } else {
          setAppointedDoctors([]);
          setTotalCount(0);
        }
      } catch (err: any) {
        console.error("Failed to fetch appointed doctors list:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load appointed doctors roster."
        );
        lastQueryKeyRef.current = "";
      } finally {
        setLoading(false);
      }
    },
    [
      currentPage,
      limit,
      debouncedSearch,
      selectedDeptId,
      selectedDesignationId,
      selectedScopeId,
    ]
  );

  useEffect(() => {
    fetchAppointedDoctors();
  }, [fetchAppointedDoctors]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedDeptId(null);
    setSelectedDesignationId(null);
    setSelectedScopeId(null);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedDeptId !== null ||
      selectedDesignationId !== null ||
      selectedScopeId !== null
  );

  // Derived Summary Counts
  const uniqueDepartmentsCount = new Set(
    appointedDoctors.map((d) => d.departmentId).filter(Boolean)
  ).size;

  const activePractitionersCount = appointedDoctors.filter(
    (d) => d.status !== false
  ).length;

  return (
    <div className={themeStyles.layout.pageContainer}>
      {/* Header Banner */}
      <div className={themeStyles.layout.headerBannerLight}>
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-teal-50/60 to-transparent pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className={themeStyles.typography.pillTeal}>
              Healthcare Facility Roster
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-500 font-mono">
              {user?.healthInstituteId || "Hospital Terminal"}
            </Badge>
          </div>
          <h1 className={themeStyles.combine(themeStyles.typography.h1, "flex items-center gap-2.5")}>
            <UserCheck className="w-6 h-6 text-teal-700" />
            Appointed Medical Staff
          </h1>
          <p className={themeStyles.typography.subtext}>
            View, filter, and oversee all certified medical practitioners appointed
            to your healthcare institute across specialized clinical departments.
          </p>
        </div>

        {/* Primary Appoint CTA Button */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAppointedDoctors(true)}
            disabled={loading}
            className="text-xs border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer h-9 px-3 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
            Refresh
          </Button>

          <Link to="/health-institute/appoint-doctor">
            <Button
              variant="emerald"
              className="text-xs font-bold px-4 h-9 shadow-xs cursor-pointer flex items-center gap-1.5 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Appoint New Doctor
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={themeStyles.layout.grid4}>
        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Total Appointed
              </span>
              <p className="text-2xl font-black text-slate-900">
                {totalCount}
              </p>
            </div>
            <div className={themeStyles.iconBadge.teal}>
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Active Staff on Duty
              </span>
              <p className="text-2xl font-black text-emerald-600">
                {activePractitionersCount || totalCount}
              </p>
            </div>
            <div className={themeStyles.iconBadge.emerald}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Clinical Specialties
              </span>
              <p className="text-2xl font-black text-cyan-700">
                {uniqueDepartmentsCount || masterData.departments.length || "Active"}
              </p>
            </div>
            <div className={themeStyles.iconBadge.cyan}>
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Roster Status
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ABDM Verified
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
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search ID, name, registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs rounded-xl h-9"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={selectedDeptId ?? ""}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value ? Number(e.target.value) : null);
                  setCurrentPage(1);
                }}
                disabled={loadingMasterData}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:bg-slate-50"
              >
                <option value="">All Departments</option>
                {masterData.departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation Filter */}
            <div>
              <select
                value={selectedDesignationId ?? ""}
                onChange={(e) => {
                  setSelectedDesignationId(
                    e.target.value ? Number(e.target.value) : null
                  );
                  setCurrentPage(1);
                }}
                disabled={loadingMasterData}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:bg-slate-50"
              >
                <option value="">All Designations</option>
                {masterData.designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Consultation Scope Filter */}
            <div>
              <select
                value={selectedScopeId ?? ""}
                onChange={(e) => {
                  setSelectedScopeId(
                    e.target.value ? Number(e.target.value) : null
                  );
                  setCurrentPage(1);
                }}
                disabled={loadingMasterData}
                className="w-full h-9 px-3 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:bg-slate-50"
              >
                <option value="">All Consultation Scopes</option>
                {masterData.consultationScopes.map((scope) => (
                  <option key={scope.id} value={scope.id}>
                    {scope.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Clear Helper */}
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

      {/* Main Content Area */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className={themeStyles.state.loading}>
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            Loading appointed doctors...
          </p>
          <p className={themeStyles.typography.subtext}>
            Retrieving clinical affiliation records from hospital registry.
          </p>
        </div>
      ) : appointedDoctors.length === 0 ? (
        <div className={themeStyles.state.empty}>
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-100">
            <UserCheck className="w-8 h-8 text-teal-600" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              {hasActiveFilters
                ? "No matching appointed doctors"
                : "No doctors appointed yet"}
            </h3>
            <p className={themeStyles.typography.subtext}>
              {hasActiveFilters
                ? "Try adjusting your search query, department, or scope filters to find appointed practitioners."
                : "Your hospital roster is currently empty. Explore verified practitioners in the national registry to appoint them."}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs cursor-pointer rounded-xl"
              >
                <FilterX className="w-3.5 h-3.5 mr-1" />
                Reset Filters
              </Button>
            ) : null}

            <Link to="/health-institute/appoint-doctor">
              <Button
                variant="emerald"
                size="sm"
                className="text-xs font-bold px-4 cursor-pointer flex items-center gap-1.5 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                Appoint Doctor Now
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Doctors Grid */}
          <div className={themeStyles.layout.grid3}>
            {appointedDoctors.map((doc) => {
              const fullName = [doc.firstName, doc.middleName, doc.lastName]
                .filter(Boolean)
                .join(" ");

              const initials = [
                doc.firstName?.charAt(0) || "D",
                doc.lastName?.charAt(0) || "R",
              ]
                .join("")
                .toUpperCase();

              return (
                <Card
                  key={doc.mappingId || `${doc.doctorId}-${doc.departmentId}`}
                  className={themeStyles.combine(themeStyles.card.base, "flex flex-col justify-between overflow-hidden group")}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top Doctor Profile Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={themeStyles.combine(themeStyles.avatar.doctor, "group-hover:scale-105 transition-transform")}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className={themeStyles.combine(themeStyles.typography.h4, "truncate")}>
                            Dr. {fullName || doc.doctorId}
                          </h4>
                          <span className={themeStyles.typography.monoTeal}>
                            {doc.doctorId}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant="teal"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shrink-0"
                      >
                        {doc.status !== false ? "Active Staff" : "Inactive"}
                      </Badge>
                    </div>

                    {/* Specialty & Role Badges */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Specialty
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[11px] font-bold text-teal-800 bg-teal-50 border-teal-200"
                        >
                          {doc.departmentName || "General Medicine"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Designation
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-45">
                          {doc.designationName || "Practitioner"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Scope
                        </span>
                        <span className="text-xs font-semibold text-cyan-700 truncate max-w-45">
                          {doc.consultationScopeName || "Full Consultation"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Joining Date
                        </span>
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {doc.joiningDate || "Affiliated"}
                        </span>
                      </div>

                      {doc.medicalRegistration && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            Reg. No.
                          </span>
                          <span className="text-[11px] font-mono font-medium text-slate-600 truncate max-w-45">
                            {doc.medicalRegistration}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Card Action Footer */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-500">
                      Roster ID: #{doc.mappingId || doc.doctorPrimaryKey}
                    </span>
                    <Link
                      to={`/health-institute/doctors/${doc.doctorPrimaryKey || doc.doctorId}`}
                      state={{
                        doctorPrimaryKey: doc.doctorPrimaryKey,
                        doctorId: doc.doctorId,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 h-8 px-2.5 cursor-pointer font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Full Profile →
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
                of <strong className="text-slate-800">{totalCount}</strong> appointed doctors
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

export default HealthInstituteAppointedDoctorsPage;
