import React, { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Pill,
  Upload,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

export interface MedicalDocumentItem {
  patientMedicalDocumentId: string;
  documentType: number;
  documentTypeName: string;
  title: string;
  description?: string;
  documentUrl: string;
  documentDate: string;
}

export interface MedicationItem {
  patientMedicationId: string;
  medicationName: string;
  dosage: string;
  startDate: string;
  endDate?: string;
  status: number; // 1: Active, 2: Completed, 3: Discontinued, 4: On Hold
  description?: string;
}

export interface PatientMedicalRecordDetails {
  patientMedicalRecordId: string;
  title: string;
  diagnosis: string;
  description?: string;
  status: number;
  startedDate: string;
  resolvedDate?: string;
  medicalDocuments: MedicalDocumentItem[];
  medications: MedicationItem[];
}

export interface MedicalRecordDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string | null;
  patientFullName?: string;
  readOnly?: boolean;
  onOpenUpdateMeds?: (record: PatientMedicalRecordDetails) => void;
  onOpenUploadDocs?: (recordId: string) => void;
  refreshTrigger?: number;
}

export const getDocumentFullUrl = (url?: string) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${apiBase}${cleanPath}`;
};

const getMedicationStatusBadge = (status: number) => {
  switch (status) {
    case 1:
      return { label: "Active", bg: "bg-teal-50 text-teal-700 border-teal-200" };
    case 2:
      return { label: "Completed", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case 3:
      return { label: "Discontinued", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    case 4:
      return { label: "On Hold", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    default:
      return { label: "Active", bg: "bg-teal-50 text-teal-700 border-teal-200" };
  }
};

export const MedicalRecordDetailsModal: React.FC<MedicalRecordDetailsModalProps> = ({
  open,
  onOpenChange,
  recordId,
  patientFullName = "Patient",
  readOnly = false,
  onOpenUpdateMeds,
  onOpenUploadDocs,
  refreshTrigger = 0,
}) => {
  const [recordDetails, setRecordDetails] =
    useState<PatientMedicalRecordDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!recordId) return;
    setLoading(true);
    setError(null);

    try {
      const url = `${API_ROUTES.getPatientMedicalRecordDetails}/${recordId}`;
      const response = await callApi(url, null, "GET");
      const data = response?.data || response;
      const rec = data?.medicalRecordDetails || data?.medicalRecord || data;

      setRecordDetails({
        patientMedicalRecordId:
          rec.patientMedicalRecordId || rec._id || recordId,
        title: rec.title || "Clinical Record",
        diagnosis: rec.diagnosis || "No diagnosis specified",
        description: rec.description || "",
        status: Number(rec.status ?? 1),
        startedDate: rec.startedDate || rec.created_at || "",
        resolvedDate: rec.resolvedDate,
        medicalDocuments: Array.isArray(rec.medicalDocuments)
          ? rec.medicalDocuments
          : [],
        medications: Array.isArray(rec.medications) ? rec.medications : [],
      });
    } catch (err: any) {
      console.error("Failed to load medical record details:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load details for this clinical record."
      );
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    if (open && recordId) {
      void fetchDetails();
    } else if (!open) {
      setRecordDetails(null);
      setError(null);
    }
  }, [open, recordId, refreshTrigger, fetchDetails]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200 shadow-xl bg-white">
        {/* Header */}
        <DialogHeader className="p-6 bg-slate-900 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="verified" className="text-[10px] bg-teal-500/20 text-teal-300 border-teal-400/30">
              Clinical Encounter
            </Badge>
            {recordDetails && (
              <Badge
                className={`text-[10px] font-bold ${
                  recordDetails.status === 1
                    ? "bg-amber-500 text-white"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {recordDetails.status === 1 ? "Active Condition" : "Resolved / Completed"}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg font-bold text-white mt-1">
            {loading
              ? "Loading clinical encounter..."
              : recordDetails?.title || "Clinical Record Details"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300">
            Diagnostic findings, prescription orders, and attached laboratory investigations for {patientFullName}.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-4 py-12 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Loading clinical history and attached artifacts...
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="p-3.5 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          ) : recordDetails ? (
            <div className="space-y-6">
              {/* Diagnosis and Timeline Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <Card className="p-3.5 rounded-xl bg-teal-50/60 border-teal-100 shadow-none space-y-1">
                  <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                    Primary Diagnosis / Findings
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-relaxed">
                    {recordDetails.diagnosis}
                  </p>
                </Card>

                <Card className="p-3.5 rounded-xl bg-slate-50 border-slate-200 shadow-none space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Clinical Timeline
                  </span>
                  <div className="flex items-center justify-between text-xs text-slate-800 pt-0.5">
                    <span>
                      Started: <strong>{recordDetails.startedDate || "Not recorded"}</strong>
                    </span>
                    {recordDetails.resolvedDate && (
                      <span>
                        Resolved: <strong>{recordDetails.resolvedDate}</strong>
                      </span>
                    )}
                  </div>
                </Card>
              </div>

              {/* Notes & Advice */}
              {recordDetails.description && (
                <Card className="p-3.5 rounded-xl bg-slate-50 border-slate-200 shadow-none space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Clinical Notes &amp; Treatment Advice
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {recordDetails.description}
                  </p>
                </Card>
              )}

              {/* Prescribed Medications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-600" />
                    Prescribed Medications ({recordDetails.medications.length})
                  </h4>
                  {!readOnly && onOpenUpdateMeds && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onOpenUpdateMeds(recordDetails)}
                      className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl cursor-pointer h-7 px-2.5 flex items-center gap-1.5 shadow-xs"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      Update Medications
                    </Button>
                  )}
                </div>

                {recordDetails.medications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    No prescription items recorded for this encounter.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-none">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="border-b border-slate-200 hover:bg-transparent">
                          <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider h-9">
                            Medication
                          </TableHead>
                          <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider h-9">
                            Dosage / Frequency
                          </TableHead>
                          <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider h-9">
                            Schedule / Duration
                          </TableHead>
                          <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider h-9">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recordDetails.medications.map((med) => {
                          const badgeInfo = getMedicationStatusBadge(med.status);
                          return (
                            <TableRow key={med.patientMedicationId} className="border-b border-slate-100">
                              <TableCell className="py-2.5">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                                  <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                  <span>{med.medicationName}</span>
                                </div>
                                {med.description && (
                                  <p className="text-[11px] text-slate-500 font-normal mt-0.5 ml-5">
                                    {med.description}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="py-2.5 font-semibold text-slate-700 font-mono text-xs">
                                {med.dosage}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-slate-600">
                                <div>
                                  Started: <span className="font-medium text-slate-800">{med.startDate}</span>
                                </div>
                                {med.endDate && (
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Ended: <span className="font-semibold text-slate-700">{med.endDate}</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-2.5">
                                <Badge className={`text-[10px] font-semibold ${badgeInfo.bg}`}>
                                  {badgeInfo.label}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Attached Clinical Documents */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    Attached Clinical Documents ({recordDetails.medicalDocuments.length})
                  </h4>
                  {!readOnly && onOpenUploadDocs && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onOpenUploadDocs(recordDetails.patientMedicalRecordId)}
                      className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl cursor-pointer h-7 px-2.5 flex items-center gap-1 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Documents
                    </Button>
                  )}
                </div>

                {recordDetails.medicalDocuments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    No documents or diagnostic reports attached to this record.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recordDetails.medicalDocuments.map((doc) => {
                      const fileUrl = getDocumentFullUrl(doc.documentUrl);

                      return (
                        <Card
                          key={doc.patientMedicalDocumentId}
                          className="p-3.5 rounded-xl bg-white border-slate-200 shadow-none flex flex-col justify-between gap-2.5 hover:border-teal-400 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate" title={doc.title}>
                                  {doc.title || "Clinical Document"}
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {doc.documentTypeName || "Document"}
                                  </Badge>
                                  <span>{doc.documentDate}</span>
                                </div>
                              </div>
                            </div>

                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="shrink-0"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 border-teal-200 rounded-lg flex items-center gap-1 cursor-pointer font-semibold"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View
                                </Button>
                              </a>
                            )}
                          </div>

                          {doc.description && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                              {doc.description}
                            </p>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs rounded-xl cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
