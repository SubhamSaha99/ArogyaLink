import React, { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

export interface PatientProfileSummary {
  patientPrimaryKey: number;
  patientId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface UploadDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientDetails: PatientProfileSummary | null;
  medicalRecordId: string;
  onDocumentsUploaded: () => void;
}

export const UploadDocumentsModal: React.FC<UploadDocumentsModalProps> = ({
  open,
  onOpenChange,
  patientDetails,
  medicalRecordId,
  onDocumentsUploaded,
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [documents, setDocuments] = useState<
    Array<{
      file: File;
      documentType: number;
      title: string;
      description?: string;
      documentDate: string;
    }>
  >([]);

  useEffect(() => {
    if (open) {
      setDocuments([]);
      setError(null);
      setSuccessMsg(null);
    }
  }, [open]);

  const handleAddDocumentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setDocuments((prev) => [
      ...prev,
      {
        file,
        documentType: 1, // Default Prescription
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: "",
        documentDate: new Date().toISOString().split("T")[0],
      },
    ]);
    e.target.value = "";
  };

  const handleUpdateDocumentMeta = (
    index: number,
    field: "title" | "documentType" | "documentDate" | "description",
    value: any
  ) => {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalRecordId || !patientDetails?.patientId) {
      setError("Patient or Medical Record reference is missing.");
      return;
    }
    if (documents.length === 0) {
      setError("Please attach at least one document to upload.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("patientId", patientDetails.patientId);
      formData.append("medicalRecordId", medicalRecordId);

      documents.forEach((doc, idx) => {
        formData.append(`medicalDocuments[${idx}].file`, doc.file);
        formData.append(`medicalDocuments[${idx}].title`, doc.title || doc.file.name);
        formData.append(`medicalDocuments[${idx}].documentType`, String(doc.documentType));
        formData.append(`medicalDocuments[${idx}].documentDate`, doc.documentDate);
        if (doc.description?.trim()) {
          formData.append(`medicalDocuments[${idx}].description`, doc.description.trim());
        }
      });

      await callApi(API_ROUTES.uploadMedicalDocuments, formData, "POST");

      setSuccessMsg("Medical documents uploaded and attached successfully.");

      setTimeout(() => {
        onOpenChange(false);
        onDocumentsUploaded();
      }, 900);
    } catch (err: any) {
      console.error("Failed to upload medical documents:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload medical documents."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const patientFullName = patientDetails
    ? [patientDetails.firstName, patientDetails.middleName, patientDetails.lastName]
        .filter(Boolean)
        .join(" ")
    : "Patient";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200 shadow-xl bg-white">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-6 bg-slate-900 text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="verified" className="text-[10px] bg-teal-500/20 text-teal-300 border-teal-400/30">
                Document Upload
              </Badge>
              {patientDetails?.patientId && (
                <Badge className="bg-white/10 text-white border-white/20 text-[10px] font-mono">
                  {patientDetails.patientId}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-lg font-bold text-white mt-1">
              Upload Documents for {patientFullName}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              Attach diagnostic reports, prescriptions, or imaging scans to this clinical encounter.
            </DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="p-6 space-y-6">
            {error && (
              <Alert variant="destructive" className="p-3.5 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {successMsg && (
              <Alert className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <AlertDescription className="text-xs font-semibold">{successMsg}</AlertDescription>
              </Alert>
            )}

            {/* Document upload zone */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Attached Files ({documents.length})
                </h4>

                <label className="inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  Choose File
                  <input
                    type="file"
                    onChange={handleAddDocumentFile}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                  />
                </label>
              </div>

              {documents.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-2">
                  <Upload className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-500">
                    No documents selected yet.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Upload medical prescriptions, blood tests, radiology scans, or discharge summaries (PDF / JPEG / PNG).
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {documents.map((doc, idx) => (
                    <Card
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border-slate-200 shadow-none space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                          <FileText className="w-4 h-4" />
                        </div>

                        <div className="flex-1 w-full sm:w-auto">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Document Title
                          </label>
                          <Input
                            type="text"
                            value={doc.title}
                            onChange={(e) =>
                              handleUpdateDocumentMeta(idx, "title", e.target.value)
                            }
                            required
                            className="text-xs rounded-lg h-8 bg-slate-50"
                          />
                        </div>

                        <div className="w-full sm:w-44">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Document Type
                          </label>
                          <Select
                            value={doc.documentType}
                            onChange={(e) =>
                              handleUpdateDocumentMeta(
                                idx,
                                "documentType",
                                Number(e.target.value)
                              )
                            }
                            className="h-8 text-xs rounded-lg bg-slate-50"
                          >
                            <option value={1}>Prescription</option>
                            <option value={2}>Lab Test Report</option>
                            <option value={3}>Discharge Summary</option>
                            <option value={4}>Diagnostic Scan</option>
                            <option value={5}>Other Medical Record</option>
                          </Select>
                        </div>

                        <div className="w-full sm:w-36">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Document Date
                          </label>
                          <Input
                            type="date"
                            value={doc.documentDate}
                            onChange={(e) =>
                              handleUpdateDocumentMeta(
                                idx,
                                "documentDate",
                                e.target.value
                              )
                            }
                            required
                            className="text-xs rounded-lg h-8 bg-slate-50"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(idx)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg cursor-pointer shrink-0 mt-4 sm:mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Document Description (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Fasting glucose report, Dr. Roy handwritten notes..."
                          value={doc.description || ""}
                          onChange={(e) =>
                            handleUpdateDocumentMeta(
                              idx,
                              "description",
                              e.target.value
                            )
                          }
                          className="text-xs rounded-lg h-8 bg-slate-50"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || documents.length === 0}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-teal-600/20 px-4 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Upload &amp; Attach ({documents.length})</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

