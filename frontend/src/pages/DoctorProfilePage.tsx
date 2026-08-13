import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  BookOpen,
  FileCheck,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export const DoctorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [doctorDetails, setDoctorDetails] = useState<DoctorDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingError, setFetchingError] = useState<string | null>(null);

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
    fetchDoctorDetails();
  }, []);

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

  return (
    <div className="space-y-6">
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

        <Button
          variant="outline"
          size="sm"
          onClick={fetchDoctorDetails}
          disabled={loading}
          className="text-xs font-semibold text-slate-700 hover:text-teal-700 border-slate-300"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Details
        </Button>
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
              <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md border-2 border-teal-500 -mt-10 mb-2 flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-teal-50 text-teal-800 font-black text-2xl flex items-center justify-center">
                  {firstName.charAt(0)}
                </div>
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
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-700" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Basic Personal Information
                  </CardTitle>
                </div>
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
    </div>
  );
};

export default DoctorProfilePage;
