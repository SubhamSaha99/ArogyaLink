import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2,
  RefreshCw,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  FilterX,
  Stethoscope,
  CheckCircle2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { themeStyles } from "@/styles/themeStyles";

export interface AssociatedHealthInstituteItem {
  healthInstitutePrimaryKey: number;
  healthInstituteId: string;
  healthInstituteName: string;
  departmentId: number;
  departmentName: string;
  designationId: number;
  designationName: string;
  joiningDate: string;
  consultationScopeId: number;
  consultationScopeName: string;
}

export const DoctorAssociatedInstitutesPage: React.FC = () => {
  const { user } = useAuth();

  const [institutes, setInstitutes] = useState<AssociatedHealthInstituteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedScope, setSelectedScope] = useState<string>("");

  // Fetch Associated Health Institutes
  const fetchAssociatedInstitutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await callApi(
        API_ROUTES.getAssociatedHealthInstitutes,
        null,
        "GET"
      );

      const data = response?.data || response;
      const list =
        data?.healthInstitutes ||
        (Array.isArray(data) ? data : []);

      if (Array.isArray(list)) {
        setInstitutes(list);
      } else {
        setInstitutes([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch associated health institutes:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load affiliated healthcare institutes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssociatedInstitutes();
  }, [fetchAssociatedInstitutes]);

  // Extract distinct departments and scopes for filters
  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    institutes.forEach((inst) => {
      if (inst.departmentName) set.add(inst.departmentName);
    });
    return Array.from(set);
  }, [institutes]);

  const uniqueScopes = useMemo(() => {
    const set = new Set<string>();
    institutes.forEach((inst) => {
      if (inst.consultationScopeName) set.add(inst.consultationScopeName);
    });
    return Array.from(set);
  }, [institutes]);

  // Filtered Institutes
  const filteredInstitutes = useMemo(() => {
    return institutes.filter((inst) => {
      const matchesSearch =
        !searchTerm.trim() ||
        inst.healthInstituteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.healthInstituteId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.designationName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = !selectedDept || inst.departmentName === selectedDept;
      const matchesScope = !selectedScope || inst.consultationScopeName === selectedScope;

      return matchesSearch && matchesDept && matchesScope;
    });
  }, [institutes, searchTerm, selectedDept, selectedScope]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDept("");
    setSelectedScope("");
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedDept || selectedScope
  );

  return (
    <div className={themeStyles.layout.pageContainer}>
      {/* Header Banner */}
      <div className={themeStyles.layout.headerBannerLight}>
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-teal-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className={themeStyles.typography.pillTeal}>
              Clinical Affiliations
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-500 font-mono">
              {user?.doctorId || "Doctor Terminal"}
            </Badge>
          </div>
          <h1 className={themeStyles.combine(themeStyles.typography.h1, "flex items-center gap-2.5")}>
            <Building2 className="w-6 h-6 text-teal-700" />
            Associated Healthcare Institutes
          </h1>
          <p className={themeStyles.typography.subtext}>
            Review all hospitals, medical centers, and clinics where you are officially
            appointed as a certified practitioner with active clinical scopes.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssociatedInstitutes}
            disabled={loading}
            className="text-xs border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer h-9 px-3.5 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
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
                Affiliated Facilities
              </span>
              <p className="text-2xl font-black text-slate-900">
                {institutes.length}
              </p>
            </div>
            <div className={themeStyles.iconBadge.teal}>
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Specialty Roles
              </span>
              <p className="text-2xl font-black text-emerald-600">
                {uniqueDepartments.length || "1"}
              </p>
            </div>
            <div className={themeStyles.iconBadge.emerald}>
              <Stethoscope className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Practice Scopes
              </span>
              <p className="text-2xl font-black text-cyan-700">
                {uniqueScopes.length || "1"}
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
                Registry Verification
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Affiliations
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className={themeStyles.card.base}>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search hospital name, ID, department, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4 text-slate-400" />}
                className={themeStyles.form.input}
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Department Filter */}
              {uniqueDepartments.length > 0 && (
                <div className="min-w-40">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className={themeStyles.form.select}
                  >
                    <option value="">All Departments</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Scope Filter */}
              {uniqueScopes.length > 0 && (
                <div className="min-w-36">
                  <select
                    value={selectedScope}
                    onChange={(e) => setSelectedScope(e.target.value)}
                    className={themeStyles.form.select}
                  >
                    <option value="">All Scopes</option>
                    {uniqueScopes.map((scope) => (
                      <option key={scope} value={scope}>
                        {scope}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-10 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl cursor-pointer"
                >
                  <FilterX className="w-3.5 h-3.5 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="p-4">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Content Area */}
      {loading ? (
        <div className={themeStyles.state.loading}>
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            Loading associated healthcare institutes...
          </p>
          <p className="text-xs text-slate-500">
            Retrieving clinical postings and hospital mappings from registry.
          </p>
        </div>
      ) : filteredInstitutes.length === 0 ? (
        <div className={themeStyles.state.empty}>
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-100">
            <Building2 className="w-8 h-8 text-teal-600" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              {hasActiveFilters
                ? "No matching institutes found"
                : "No health institute associations yet"}
            </h3>
            <p className="text-xs text-slate-500">
              {hasActiveFilters
                ? "Try adjusting your search query or filter selection."
                : "You are not currently appointed by any healthcare institute in the system. When a hospital or clinic appoints you, their details will appear here."}
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
        <div className={themeStyles.layout.grid3}>
          {filteredInstitutes.map((inst, index) => {
            const initials = (inst.healthInstituteName || "H")
              .split(" ")
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <Card
                key={`${inst.healthInstitutePrimaryKey}-${inst.departmentId}-${index}`}
                className={themeStyles.combine(themeStyles.card.base, "flex flex-col justify-between overflow-hidden group")}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Row: Institute Icon, Name & Verified Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className={themeStyles.combine(themeStyles.avatar.institute, "group-hover:scale-105 transition-transform")}>
                        <AvatarFallback>{initials || <Building2 className="w-6 h-6" />}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className={themeStyles.combine(themeStyles.typography.h4, "truncate")}>
                          {inst.healthInstituteName || "Healthcare Institute"}
                        </h4>
                        <span className={themeStyles.typography.monoTeal}>
                          {inst.healthInstituteId}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="emerald"
                      className="text-[10px] shrink-0 font-bold"
                    >
                      Active
                    </Badge>
                  </div>

                  {/* Posting Details */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Department
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-bold text-teal-800 bg-teal-50 border-teal-200"
                      >
                        {inst.departmentName || "General Medicine"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Designation
                      </span>
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-45">
                        {inst.designationName || "Consultant"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Practice Scope
                      </span>
                      <span className="text-xs font-semibold text-cyan-700 truncate max-w-45">
                        {inst.consultationScopeName || "Full Scope"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Joining Date
                      </span>
                      <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {inst.joiningDate || "Active"}
                      </span>
                    </div>
                  </div>
                </CardContent>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Posting
                  </span>
                  <span className="font-mono text-slate-400">
                    ID: #{inst.healthInstitutePrimaryKey}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorAssociatedInstitutesPage;
