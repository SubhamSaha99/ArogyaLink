import React, { useState, useEffect } from "react";
import {
  Pill,
  Plus,
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

export interface MedicationItem {
  patientMedicationId: string;
  medicationName: string;
  dosage: string;
  startDate: string;
  endDate?: string;
  status: number; // 1: Active, 2: Completed, 3: Discontinued, 4: On Hold
  description?: string;
}

export interface PatientProfileSummary {
  patientPrimaryKey: number;
  patientId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface UpdateMedicationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientDetails: PatientProfileSummary | null;
  medicalRecordId: string;
  existingMedications: MedicationItem[];
  onMedicationsUpdated: () => void;
}

export const UpdateMedicationsModal: React.FC<UpdateMedicationsModalProps> = ({
  open,
  onOpenChange,
  patientDetails,
  medicalRecordId,
  existingMedications,
  onMedicationsUpdated,
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Snapshot for differential changes
  const [originalMedsMap, setOriginalMedsMap] = useState<
    Record<string, { status: number; endDate: string }>
  >({});

  const [existingMedsList, setExistingMedsList] = useState<
    Array<{
      patientMedicationId: string;
      medicationName: string;
      dosage: string;
      startDate: string;
      endDate?: string;
      status: number;
      description?: string;
    }>
  >([]);

  const [newMedsList, setNewMedsList] = useState<
    Array<{
      medicationName: string;
      dosage: string;
      startDate: string;
      description?: string;
    }>
  >([]);

  // Initialize state when modal opens or existingMedications change
  useEffect(() => {
    if (open) {
      const initialMap: Record<string, { status: number; endDate: string }> = {};
      const initialList = (existingMedications || []).map((m) => {
        initialMap[m.patientMedicationId] = {
          status: Number(m.status || 1),
          endDate: m.endDate || "",
        };
        return {
          patientMedicationId: m.patientMedicationId,
          medicationName: m.medicationName,
          dosage: m.dosage,
          startDate: m.startDate,
          endDate: m.endDate || "",
          status: Number(m.status || 1),
          description: m.description || "",
        };
      });

      setOriginalMedsMap(initialMap);
      setExistingMedsList(initialList);
      setNewMedsList([]);
      setError(null);
      setSuccessMsg(null);
    }
  }, [open, existingMedications]);

  const handleExistingMedStatusChange = (index: number, newStatus: number) => {
    setExistingMedsList((prev) =>
      prev.map((med, i) => {
        if (i !== index) return med;
        let updatedEndDate = med.endDate;
        if ((newStatus === 2 || newStatus === 3) && !updatedEndDate) {
          updatedEndDate = new Date().toISOString().split("T")[0];
        }
        return {
          ...med,
          status: newStatus,
          endDate: updatedEndDate,
        };
      })
    );
  };

  const handleExistingMedEndDateChange = (index: number, endDate: string) => {
    setExistingMedsList((prev) =>
      prev.map((med, i) => (i === index ? { ...med, endDate } : med))
    );
  };

  const handleAddNewMedRow = () => {
    setNewMedsList((prev) => [
      ...prev,
      {
        medicationName: "",
        dosage: "",
        startDate: new Date().toISOString().split("T")[0],
        description: "",
      },
    ]);
  };

  const handleUpdateNewMedRow = (
    index: number,
    field: "medicationName" | "dosage" | "startDate" | "description",
    value: string
  ) => {
    setNewMedsList((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    );
  };

  const handleRemoveNewMedRow = (index: number) => {
    setNewMedsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute differential modifications
  const modifiedExistingMeds = existingMedsList.filter((m) => {
    const orig = originalMedsMap[m.patientMedicationId];
    if (!orig) return false;
    const isStatusChanged = Number(m.status) !== Number(orig.status);
    const isEndDateChanged = (m.endDate || "") !== (orig.endDate || "");
    return isStatusChanged || isEndDateChanged;
  });

  const validNewMeds = newMedsList.filter(
    (m) => m.medicationName.trim() && m.dosage.trim()
  );

  const totalChangesCount = modifiedExistingMeds.length + validNewMeds.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicalRecordId || !patientDetails?.patientId) {
      setError("Patient or Medical Record reference is missing.");
      return;
    }

    for (let i = 0; i < newMedsList.length; i++) {
      const m = newMedsList[i];
      if (!m.medicationName.trim() || !m.dosage.trim()) {
        setError(
          `Please provide both Drug Name and Dosage for new medication #${i + 1}.`
        );
        return;
      }
    }

    if (totalChangesCount === 0) {
      setError(
        "No changes detected. Please modify a medication's status/end date or add a new medication."
      );
      return;
    }

    const modifiedExistingPayload = modifiedExistingMeds.map((m) => {
      const item: Record<string, any> = {
        patientMedicationId: m.patientMedicationId,
        status: Number(m.status),
      };
      if (m.endDate && m.endDate.trim()) {
        item.endDate = m.endDate.trim();
      }
      return item;
    });

    const newMedsPayload = validNewMeds.map((m) => {
      const item: Record<string, any> = {
        medicationName: m.medicationName.trim(),
        dosage: m.dosage.trim(),
        startDate: m.startDate,
      };
      if (m.description && m.description.trim()) {
        item.description = m.description.trim();
      }
      return item;
    });

    const medicationsPayload = [...modifiedExistingPayload, ...newMedsPayload];

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        patientId: patientDetails.patientId,
        medicalRecordId: medicalRecordId,
        medications: medicationsPayload,
      };

      await callApi(API_ROUTES.updateMedications, payload, "POST");

      setSuccessMsg(
        `Medications synchronized successfully (${modifiedExistingPayload.length} updated, ${newMedsPayload.length} added).`
      );

      setTimeout(() => {
        onOpenChange(false);
        onMedicationsUpdated();
      }, 900);
    } catch (err: any) {
      console.error("Failed to update medications:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update medications."
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200 shadow-xl bg-white">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="p-6 bg-slate-900 text-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="verified" className="text-[10px] bg-teal-500/20 text-teal-300 border-teal-400/30">
                Prescription Management
              </Badge>
              {patientDetails?.patientId && (
                <Badge className="bg-white/10 text-white border-white/20 text-[10px] font-mono">
                  {patientDetails.patientId}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-lg font-bold text-white mt-1">
              Update Medications for {patientFullName}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              Modify active medication statuses &amp; end dates, or prescribe new medications for this encounter.
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

            {/* Section 1: Existing Prescriptions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  1. Current Prescriptions ({existingMedsList.length})
                </h4>
                <span className="text-[11px] text-slate-400">
                  Update status &amp; end date
                </span>
              </div>

              {existingMedsList.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  No existing medications on file for this clinical encounter.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {existingMedsList.map((med, idx) => {
                    const orig = originalMedsMap[med.patientMedicationId];
                    const isModified =
                      orig &&
                      (Number(med.status) !== Number(orig.status) ||
                        (med.endDate || "") !== (orig.endDate || ""));

                    return (
                      <Card
                        key={med.patientMedicationId}
                        className={`p-3.5 rounded-xl shadow-none transition-colors ${
                          isModified
                            ? "border-amber-400 bg-amber-50/20 ring-1 ring-amber-400/40"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          {/* Medication Info (Read-only historical data) */}
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span>{med.medicationName}</span>
                              </div>
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                                {med.dosage}
                              </span>
                              {isModified && (
                                <Badge className="text-[10px] bg-amber-100 text-amber-800 border-amber-300 font-semibold">
                                  Modified
                                </Badge>
                              )}
                            </div>
                            {med.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 ml-5">
                                {med.description}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 ml-5">
                              Started: <strong>{med.startDate}</strong>
                            </p>
                          </div>

                          {/* Status & End Date controls */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className="w-36">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                Status
                              </label>
                              <Select
                                value={med.status}
                                onChange={(e) =>
                                  handleExistingMedStatusChange(idx, Number(e.target.value))
                                }
                                className="h-8 text-xs rounded-lg bg-slate-50 font-semibold"
                              >
                                <option value={1}>1 - Active</option>
                                <option value={2}>2 - Completed</option>
                                <option value={3}>3 - Discontinued</option>
                                <option value={4}>4 - On Hold</option>
                              </Select>
                            </div>

                            <div className="w-36">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                End Date
                              </label>
                              <Input
                                type="date"
                                value={med.endDate || ""}
                                onChange={(e) =>
                                  handleExistingMedEndDateChange(idx, e.target.value)
                                }
                                className="text-xs rounded-lg h-8 bg-slate-50"
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Prescribe New Medications */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-teal-600" />
                    2. Prescribe New Medications
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Newly added medications will start as Active without an initial end date.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewMedRow}
                  className="text-xs border-teal-200 text-teal-700 hover:bg-teal-50 h-8 px-2.5 rounded-xl cursor-pointer font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Medication
                </Button>
              </div>

              {newMedsList.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  No new medications added. Click &ldquo;Add Medication&rdquo; above to prescribe new drugs.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {newMedsList.map((med, idx) => (
                    <Card
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border-slate-200 shadow-none space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full sm:w-auto">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Drug Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. Metformin 500mg"
                            value={med.medicationName}
                            onChange={(e) =>
                              handleUpdateNewMedRow(idx, "medicationName", e.target.value)
                            }
                            required
                            className="text-xs rounded-lg h-8 bg-white"
                          />
                        </div>

                        <div className="w-full sm:w-44">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Dosage / Frequency <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. 1-0-1 After Food"
                            value={med.dosage}
                            onChange={(e) =>
                              handleUpdateNewMedRow(idx, "dosage", e.target.value)
                            }
                            required
                            className="text-xs rounded-lg h-8 bg-white"
                          />
                        </div>

                        <div className="w-full sm:w-36">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="date"
                            value={med.startDate}
                            onChange={(e) =>
                              handleUpdateNewMedRow(idx, "startDate", e.target.value)
                            }
                            required
                            className="text-xs rounded-lg h-8 bg-white"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNewMedRow(idx)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg cursor-pointer shrink-0 mt-4 sm:mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Medication Notes / Instructions (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Take with breakfast, monitor blood sugar weekly..."
                          value={med.description || ""}
                          onChange={(e) =>
                            handleUpdateNewMedRow(idx, "description", e.target.value)
                          }
                          className="text-xs rounded-lg h-8 bg-white"
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
              disabled={submitting || totalChangesCount === 0}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-teal-600/20 px-4 flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating Medications...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {totalChangesCount > 0
                      ? `Update & Sync (${totalChangesCount} Change${totalChangesCount > 1 ? "s" : ""})`
                      : "Update & Sync Medications"}
                  </span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

