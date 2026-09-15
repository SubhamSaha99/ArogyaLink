import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  Activity,
  Building,
  User,
  Stethoscope,
  Eye,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  X,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { useAuth } from "@/context/AuthContext";
import { themeStyles } from "@/styles/themeStyles";
import { MedicalRecordDetailsModal } from "@/components/doctor/MedicalRecordDetailsModal";

// Interfaces
export interface PatientMedicalRecordItem {
  patientMedicalRecordId: string;
  doctorPrimaryKey: number;
  doctorId: string;
  healthInstitutePrimaryKey: number;
  healthInstituteId: string;
  title: string;
  diagnosis: string;
  status: number; // 1: Active, 2: Completed / Resolved
}

const PAGE_SIZE = 8;

export const PatientMedicalRecordsPage: React.FC = () => {
  const { user } = useAuth();

  // Records list state for Infinite Scroll
  const [records, setRecords] = useState<PatientMedicalRecordItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "1" | "2">("ALL");

  // Record Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Sentinel ref for infinite scroll intersection observer
  const observerTargetRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Fetch records page by offset
  const fetchRecordsPage = useCallback(
    async (targetOffset: number, isInitial = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isInitial) {
        setLoadingInitial(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const payload = {
          offset: targetOffset,
          limit: PAGE_SIZE,
        };

        const response = await callApi(
          API_ROUTES.getPatientMedicalRecords,
          payload,
          "POST"
        );

        const data = response?.data || response;
        const fetchedRecords: PatientMedicalRecordItem[] = Array.isArray(
          data?.medicalRecords
        )
          ? data.medicalRecords
          : Array.isArray(data)
          ? data
          : [];

        const total = Number(data?.total ?? fetchedRecords.length);
        setTotalCount(total);

        setRecords((prev) => {
          if (isInitial) {
            return fetchedRecords;
          }
          // Avoid duplicate keys when appending
          const existingIds = new Set(prev.map((r) => r.patientMedicalRecordId));
          const newItems = fetchedRecords.filter(
            (r) => !existingIds.has(r.patientMedicalRecordId)
          );
          return [...prev, ...newItems];
        });

        const nextOffset = targetOffset + fetchedRecords.length;
        setOffset(nextOffset);
        setHasMore(nextOffset < total && fetchedRecords.length > 0);
      } catch (err: any) {
        console.error("Failed to load patient medical records:", err);
        const errMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load medical records from vault.";
        setError(Array.isArray(errMsg) ? errMsg.join(", ") : errMsg);
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    void fetchRecordsPage(0, true);
  }, [fetchRecordsPage]);

  // Infinite scroll intersection observer setup
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          hasMore &&
          !loadingInitial &&
          !loadingMore &&
          !isFetchingRef.current
        ) {
          void fetchRecordsPage(offset, false);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingInitial, loadingMore, offset, fetchRecordsPage]);

  // Manual Refresh
  const handleRefresh = () => {
    setOffset(0);
    setHasMore(true);
    void fetchRecordsPage(0, true);
  };

  // Open Details Modal
  const handleViewRecordDetails = (recordId: string) => {
    setSelectedRecordId(recordId);
    setIsDetailsModalOpen(true);
  };

  // Filtered records for client-side search & status tab
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesSearch =
        !searchTerm.trim() ||
        rec.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        rec.diagnosis.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        rec.doctorId.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        rec.healthInstituteId.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesStatus =
        statusFilter === "ALL" || String(rec.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  // Summary Metrics
  const activeCount = useMemo(
    () => records.filter((r) => r.status === 1).length,
    [records]
  );
  const completedCount = useMemo(
    () => records.filter((r) => r.status === 2).length,
    [records]
  );

  const patientFullName = user?.patientId
    ? `Patient ${user.patientId}`
    : "My Records";

  return (
    <div className={themeStyles.layout.pageContainer}>
      {/* Top Banner with Patient Medical Records Overview */}
      <div className="bg-linear-to-r from-slate-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-2xl shadow-xl border-2 border-white/20 shrink-0">
              <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-100" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                  Patient Medical Records
                </h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                  ABDM Encrypted Vault
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Access your longitudinal health records, active prescriptions,
                diagnostic reports, and historical treatment plans seamlessly.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loadingInitial || loadingMore}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-semibold text-xs h-10 px-4 rounded-xl cursor-pointer transition-all"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${
                  loadingInitial || loadingMore ? "animate-spin text-emerald-400" : ""
                }`}
              />
              Refresh Vault
            </Button>
          </div>
        </div>

        {/* Quick Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/40 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Records
            </span>
            <span className="text-lg sm:text-xl font-black text-white">
              {totalCount}
            </span>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Active Episodes
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-300">
              {activeCount}
            </span>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
              Resolved Cases
            </span>
            <span className="text-lg sm:text-xl font-black text-blue-300">
              {completedCount}
            </span>
          </div>
          <div className="bg-slate-800/40 rounded-2xl p-3 border border-slate-700/50">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Patient ID
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 truncate block">
              {user?.patientId || "PATIENT"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Search & Filter Controls */}
        <Card className="bg-white rounded-2xl border-slate-200/80 shadow-none p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search diagnosis, title, doctor ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9.5 pr-8 h-10 text-xs rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Records ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("1")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "1"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Active Cases ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("2")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === "2"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Resolved ({completedCount})
              </button>
            </div>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Initial Loading Skeletons */}
        {loadingInitial ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="bg-white rounded-3xl border-slate-200/80 p-6 space-y-4 animate-pulse shadow-none"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-3/5 rounded-lg bg-slate-100" />
                  <Skeleton className="h-6 w-20 rounded-full bg-slate-100" />
                </div>
                <Skeleton className="h-4 w-4/5 rounded-md bg-slate-100" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-7 w-24 rounded-lg bg-slate-100" />
                  <Skeleton className="h-7 w-28 rounded-lg bg-slate-100" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          /* Empty State */
          <Card className="bg-white rounded-3xl border-slate-200/80 p-12 text-center shadow-none">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {searchTerm || statusFilter !== "ALL"
                ? "No matching medical records found"
                : "No Medical Records in Vault"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {searchTerm || statusFilter !== "ALL"
                ? "Try adjusting your search criteria or clearing filters to view available medical episodes."
                : "Your treating doctor or health institute has not created any medical records for your vault yet."}
            </p>
            {(searchTerm || statusFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          /* Infinite Scroll Record Cards Grid */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecords.map((record) => {
                const isActive = record.status === 1;

                return (
                  <Card
                    key={record.patientMedicalRecordId}
                    className="bg-white rounded-3xl border-slate-200/80 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    <CardContent className="p-6 space-y-4">
                      {/* Top Row: Title & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                            {record.title || "Clinical Consultation"}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{record.diagnosis}</span>
                          </div>
                        </div>

                        {isActive ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active Case
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 border-slate-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            Resolved
                          </Badge>
                        )}
                      </div>

                      {/* Doctor & Institute Badges */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 py-1 text-[11px] text-slate-700 font-mono">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {record.doctorId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 py-1 text-[11px] text-slate-700 font-mono">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {record.healthInstituteId}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    {/* Bottom Action Footer */}
                    <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-45">
                        ID: {record.patientMedicalRecordId.slice(-8)}
                      </span>

                      <Button
                        size="sm"
                        onClick={() =>
                          handleViewRecordDetails(record.patientMedicalRecordId)
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Full Details
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Infinite Scroll Sentinel / Loading More Indicator */}
            <div
              ref={observerTargetRef}
              className="py-6 flex flex-col items-center justify-center min-h-15"
            >
              {loadingMore && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full shadow-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  Loading more medical records...
                </div>
              )}

              {!hasMore && records.length > 0 && (
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-slate-400">
                    You've reached the end of your medical vault records.
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    All records cryptographically verified under ABDM standards.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Medical Record Details Modal (Read-Only) */}
      {/* ========================================================================= */}
      <MedicalRecordDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        recordId={selectedRecordId}
        patientFullName={patientFullName}
        readOnly={true}
      />
    </div>
  );
};

export default PatientMedicalRecordsPage;
