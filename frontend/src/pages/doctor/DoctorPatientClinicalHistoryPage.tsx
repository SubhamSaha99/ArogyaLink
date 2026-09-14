import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Activity,
  Sparkles,
  ShieldCheck,
  Pill,
  ExternalLink,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Building2,
  User,
  MapPin,
  Loader2,
  FileCheck,
  Stethoscope,
  Eye,
  Trash2,
  Upload,
  Users,
  Phone,
  Mail,
  Copy,
  Check,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";
import { themeStyles } from "@/styles/themeStyles";

// --- Interfaces ---

export interface PatientProfileDetails {
  patientProfileId: string;
  patientPrimaryKey: number;
  patientId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  mobile?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: number; // 1: Male, 2: Female, 3: Other
  profileImage?: string;
  address?: string;
  stateId?: number;
  stateName?: string;
  districtId?: number;
  districtName?: string;
  pincode?: number;
}

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

interface PatientLocationState {
  patientPrimaryKey?: number;
  patientId?: string;
}

// Helpers
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

const getGenderBadge = (gender?: number) => {
  switch (gender) {
    case 1:
      return { text: "Male", variant: "teal" as const };
    case 2:
      return { text: "Female", variant: "secondary" as const };
    case 3:
      return { text: "Other", variant: "outline" as const };
    default:
      return { text: "Not Specified", variant: "outline" as const };
  }
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

const PAGE_SIZE = 10;

export const DoctorPatientClinicalHistoryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const stateData = location.state as PatientLocationState | null;

  // Retrieve patient keys from location state or fallback to session storage
  const [activePatientPrimaryKey, setActivePatientPrimaryKey] = useState<number | null>(() => {
    if (stateData?.patientPrimaryKey) return stateData.patientPrimaryKey;
    const stored = sessionStorage.getItem("arogya_current_patient_pk");
    return stored ? Number(stored) : null;
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    if (stateData?.patientId) return stateData.patientId;
    return sessionStorage.getItem("arogya_current_patient_id") || "";
  });

  // Sync with session storage
  useEffect(() => {
    if (stateData?.patientPrimaryKey && stateData.patientPrimaryKey !== activePatientPrimaryKey) {
      setActivePatientPrimaryKey(stateData.patientPrimaryKey);
    }
    if (stateData?.patientId && stateData.patientId !== activePatientId) {
      setActivePatientId(stateData.patientId);
    }
    if (stateData?.patientPrimaryKey) {
      sessionStorage.setItem("arogya_current_patient_pk", String(stateData.patientPrimaryKey));
    }
    if (stateData?.patientId) {
      sessionStorage.setItem("arogya_current_patient_id", stateData.patientId);
    }
  }, [stateData, activePatientPrimaryKey, activePatientId]);

  // Copy-to-clipboard state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Patient profile state
  const [patientDetails, setPatientDetails] = useState<PatientProfileDetails | null>(null);
  const [loadingPatient, setLoadingPatient] = useState<boolean>(true);
  const [patientError, setPatientError] = useState<string | null>(null);

  // Medical records infinite scroll state
  const [records, setRecords] = useState<PatientMedicalRecordItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "1" | "2">("ALL");

  // Record Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [recordDetails, setRecordDetails] = useState<PatientMedicalRecordDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Create Record Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [submittingRecord, setSubmittingRecord] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);

  // Create Form State
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDiagnosis, setNewDiagnosis] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newStartedDate, setNewStartedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [newMedications, setNewMedications] = useState<
    Array<{ medicationName: string; dosage: string; startDate: string }>
  >([]);
  const [newDocuments, setNewDocuments] = useState<
    Array<{
      file: File;
      documentType: number;
      title: string;
      description?: string;
      documentDate: string;
    }>
  >([]);

  // Upload Documents Modal State (for existing record)
  const [isUploadDocsModalOpen, setIsUploadDocsModalOpen] = useState<boolean>(false);
  const [uploadTargetRecordId, setUploadTargetRecordId] = useState<string>("");
  const [uploadDocsList, setUploadDocsList] = useState<
    Array<{
      file: File;
      documentType: number;
      title: string;
      description?: string;
      documentDate: string;
    }>
  >([]);
  const [submittingUploadDocs, setSubmittingUploadDocs] = useState<boolean>(false);
  const [uploadDocsError, setUploadDocsError] = useState<string | null>(null);
  const [uploadDocsSuccessMsg, setUploadDocsSuccessMsg] = useState<string | null>(null);

  // Infinite scroll observer refs & fetch guards
  const observerTargetRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const isFetchingPatientRef = useRef<boolean>(false);

  // 1. Fetch Patient Profile Details (both patientPrimaryKey and patientId in payload body)
  const fetchPatientProfile = useCallback(async () => {
    if (!activePatientPrimaryKey && !activePatientId) {
      setLoadingPatient(false);
      return;
    }
    if (isFetchingPatientRef.current) return;
    isFetchingPatientRef.current = true;

    setLoadingPatient(true);
    setPatientError(null);
    try {
      const payload: Record<string, any> = {};
      if (activePatientPrimaryKey) {
        payload.patientPrimaryKey = Number(activePatientPrimaryKey);
      }
      if (activePatientId) {
        payload.patientId = activePatientId;
      }

      const response = await callApi(
        API_ROUTES.getPatientDetails,
        payload,
        "POST"
      );
      const data = response?.data || response;
      const profile = data?.patientProfile || data;
      if (!profile || (!data.patientId && !profile.patientProfileId)) {
        throw new Error("Patient record could not be found.");
      }
      setPatientDetails({
        patientProfileId: profile.patientProfileId || "",
        patientPrimaryKey: Number(data?.patientPrimaryKey || profile.patientPrimaryKey || activePatientPrimaryKey || 0),
        patientId: data?.patientId || profile.patientId || activePatientId,
        firstName: profile.firstName || "",
        middleName: profile.middleName || "",
        lastName: profile.lastName || "",
        email: profile.email || data?.email || "",
        mobile: profile.mobile || data?.mobile || "",
        dateOfBirth: profile.dateOfBirth || "",
        age: profile.age !== undefined && profile.age !== null ? Number(profile.age) : undefined,
        gender: profile.gender !== undefined && profile.gender !== null ? Number(profile.gender) : undefined,
        profileImage: profile.profileImage || "",
        address: profile.address || "",
        stateId: profile.stateId,
        stateName: profile.stateName,
        districtId: profile.districtId,
        districtName: profile.districtName,
        pincode: profile.pincode,
      });
    } catch (err: any) {
      console.error("Failed to load patient profile:", err);
      setPatientError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load patient profile details."
      );
    } finally {
      setLoadingPatient(false);
      isFetchingPatientRef.current = false;
    }
  }, [activePatientPrimaryKey, activePatientId]);

  // 2. Fetch Patient Medical Records page (both patientPrimaryKey and patientId in payload body)
  const fetchMedicalRecords = useCallback(
    async (targetOffset: number, isInitial = false) => {
      if ((!activePatientPrimaryKey && !activePatientId) || isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isInitial) {
        setLoadingInitial(true);
        setRecordsError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const payload: Record<string, any> = {
          offset: targetOffset,
          limit: PAGE_SIZE,
        };
        if (activePatientPrimaryKey) {
          payload.patientPrimaryKey = Number(activePatientPrimaryKey);
        }
        if (activePatientId) {
          payload.patientId = activePatientId;
        }

        const response = await callApi(
          API_ROUTES.getPatientMedicalRecords,
          payload,
          "POST"
        );

        const data = response?.data || response;
        const fetchedRecords: PatientMedicalRecordItem[] = Array.isArray(
          data?.medical_records
        )
          ? data.medical_records
          : Array.isArray(data?.medicalRecords)
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
          const existingIds = new Set(
            prev.map((r) => r.patientMedicalRecordId)
          );
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
          "Failed to load medical records.";
        setRecordsError(Array.isArray(errMsg) ? errMsg.join(", ") : errMsg);
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [activePatientPrimaryKey, activePatientId]
  );

  // Initial load - triggered once per active patient
  useEffect(() => {
    if (activePatientPrimaryKey || activePatientId) {
      void fetchPatientProfile();
      setOffset(0);
      setHasMore(true);
      void fetchMedicalRecords(0, true);
    } else {
      setLoadingPatient(false);
      setLoadingInitial(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePatientPrimaryKey, activePatientId]);

  // Infinite Scroll Intersection Observer
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
          void fetchMedicalRecords(offset, false);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadingInitial, loadingMore, offset, fetchMedicalRecords]);

  // Fetch Record Details Modal Content
  const handleOpenRecordDetails = async (recordId: string) => {
    setIsDetailsModalOpen(true);
    setLoadingDetails(true);
    setDetailsError(null);
    setRecordDetails(null);

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
      setDetailsError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load details for this clinical record."
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  // Add / Remove Medications in Create Modal
  const handleAddMedication = () => {
    setNewMedications((prev) => [
      ...prev,
      {
        medicationName: "",
        dosage: "",
        startDate: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleUpdateMedication = (
    index: number,
    field: "medicationName" | "dosage" | "startDate",
    value: string
  ) => {
    setNewMedications((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    );
  };

  const handleRemoveMedication = (index: number) => {
    setNewMedications((prev) => prev.filter((_, i) => i !== index));
  };

  // Add / Remove Document files in Create Modal
  const handleAddDocumentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setNewDocuments((prev) => [
      ...prev,
      {
        file,
        documentType: 1, // Default to Prescription
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
    setNewDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const handleRemoveDocument = (index: number) => {
    setNewDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit New Medical Record
  const handleCreateMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientDetails) return;
    if (!newTitle.trim() || !newDiagnosis.trim()) {
      setCreateError("Please provide both a Title and Diagnosis for the clinical record.");
      return;
    }

    setSubmittingRecord(true);
    setCreateError(null);
    setCreateSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("patientPrimaryKey", String(patientDetails.patientPrimaryKey));
      formData.append("patientId", patientDetails.patientId);
      formData.append("title", newTitle.trim());
      formData.append("diagnosis", newDiagnosis.trim());
      if (newDescription.trim()) {
        formData.append("description", newDescription.trim());
      }
      formData.append("startedDate", newStartedDate);

      // Append medications array
      const validMedications = newMedications.filter(
        (m) => m.medicationName.trim() && m.dosage.trim()
      );
      validMedications.forEach((med, idx) => {
        formData.append(`medications[${idx}].medicationName`, med.medicationName.trim());
        formData.append(`medications[${idx}].dosage`, med.dosage.trim());
        formData.append(`medications[${idx}].startDate`, med.startDate);
      });

      // Append documents with files
      newDocuments.forEach((doc, idx) => {
        formData.append(`medicalDocuments[${idx}].file`, doc.file);
        formData.append(`medicalDocuments[${idx}].title`, doc.title || doc.file.name);
        formData.append(`medicalDocuments[${idx}].documentType`, String(doc.documentType));
        formData.append(`medicalDocuments[${idx}].documentDate`, doc.documentDate);
        if (doc.description?.trim()) {
          formData.append(`medicalDocuments[${idx}].description`, doc.description.trim());
        }
      });

      await callApi(API_ROUTES.createPatientMedicalRecord, formData, "POST");

      setCreateSuccessMsg("New clinical record created and synced with ABDM registry.");
      
      // Reset form fields
      setNewTitle("");
      setNewDiagnosis("");
      setNewDescription("");
      setNewMedications([]);
      setNewDocuments([]);
      
      // Refresh list
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setCreateSuccessMsg(null);
        setOffset(0);
        setHasMore(true);
        void fetchMedicalRecords(0, true);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to create medical record:", err);
      setCreateError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create patient medical record."
      );
    } finally {
      setSubmittingRecord(false);
    }
  };

  // Upload Additional Documents to existing record
  const handleOpenUploadDocs = (recordId: string) => {
    setUploadTargetRecordId(recordId);
    setUploadDocsList([]);
    setUploadDocsError(null);
    setUploadDocsSuccessMsg(null);
    setIsUploadDocsModalOpen(true);
  };

  const handleAddUploadDocFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadDocsList((prev) => [
      ...prev,
      {
        file,
        documentType: 1,
        title: file.name.replace(/\.[^/.]+$/, ""),
        description: "",
        documentDate: new Date().toISOString().split("T")[0],
      },
    ]);
    e.target.value = "";
  };

  const handleUpdateUploadDocMeta = (
    index: number,
    field: "title" | "documentType" | "documentDate" | "description",
    value: any
  ) => {
    setUploadDocsList((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [field]: value } : doc))
    );
  };

  const handleRemoveUploadDoc = (index: number) => {
    setUploadDocsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitUploadDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTargetRecordId || !patientDetails?.patientId) {
      setUploadDocsError("Patient or Medical Record reference is missing.");
      return;
    }
    if (uploadDocsList.length === 0) {
      setUploadDocsError("Please attach at least one document to upload.");
      return;
    }

    setSubmittingUploadDocs(true);
    setUploadDocsError(null);
    setUploadDocsSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("patientId", patientDetails.patientId);
      formData.append("medicalRecordId", uploadTargetRecordId);

      uploadDocsList.forEach((doc, idx) => {
        formData.append(`medicalDocuments[${idx}].file`, doc.file);
        formData.append(`medicalDocuments[${idx}].title`, doc.title || doc.file.name);
        formData.append(`medicalDocuments[${idx}].documentType`, String(doc.documentType));
        formData.append(`medicalDocuments[${idx}].documentDate`, doc.documentDate);
        if (doc.description?.trim()) {
          formData.append(`medicalDocuments[${idx}].description`, doc.description.trim());
        }
      });

      await callApi(API_ROUTES.uploadMedicalDocuments, formData, "POST");

      setUploadDocsSuccessMsg("Medical documents uploaded successfully.");

      // Refresh currently viewed record details if open
      if (recordDetails?.patientMedicalRecordId === uploadTargetRecordId) {
        void handleOpenRecordDetails(uploadTargetRecordId);
      }

      setTimeout(() => {
        setIsUploadDocsModalOpen(false);
        setUploadDocsSuccessMsg(null);
        setUploadDocsList([]);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to upload medical documents:", err);
      setUploadDocsError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload medical documents."
      );
    } finally {
      setSubmittingUploadDocs(false);
    }
  };

  // Filter records in memory for immediate responsiveness
  const filteredRecords = records.filter((rec) => {
    if (statusFilter !== "ALL" && String(rec.status) !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = rec.title?.toLowerCase().includes(q);
      const matchDiagnosis = rec.diagnosis?.toLowerCase().includes(q);
      return matchTitle || matchDiagnosis;
    }
    return true;
  });

  const activeRecordsCount = records.filter((r) => r.status === 1).length;
  const resolvedRecordsCount = records.filter((r) => r.status === 2).length;

  const patientFullName = patientDetails
    ? [patientDetails.firstName, patientDetails.middleName, patientDetails.lastName]
        .filter(Boolean)
        .join(" ")
    : "Patient Details";

  const patientInitials = patientDetails
    ? [patientDetails.firstName?.charAt(0), patientDetails.lastName?.charAt(0)]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "PT"
    : "PT";

  const genderInfo = getGenderBadge(patientDetails?.gender);

  const fullLocationString = patientDetails
    ? [
        patientDetails.address,
        patientDetails.districtName,
        [patientDetails.stateName, patientDetails.pincode ? `${patientDetails.pincode}` : ""]
          .filter(Boolean)
          .join(" - "),
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  // If no active patient is selected
  if (!activePatientPrimaryKey && !activePatientId) {
    return (
      <div className={themeStyles.layout.pageContainer}>
        <div className={themeStyles.layout.headerBannerLight}>
          <div className="space-y-1">
            <h1 className={themeStyles.combine(themeStyles.typography.h1, "flex items-center gap-2.5")}>
              <Stethoscope className="w-6 h-6 text-teal-700" />
              Patient Clinical History
            </h1>
            <p className={themeStyles.typography.subtext}>
              Review comprehensive diagnostic history, medications, and attached health records.
            </p>
          </div>
        </div>

        <div className={themeStyles.state.empty}>
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-100">
            <Users className="w-8 h-8 text-teal-600" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              No Patient Selected
            </h3>
            <p className={themeStyles.typography.subtext}>
              Please select a registered patient from the directory to inspect their clinical encounters and digital health records.
            </p>
          </div>
          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => navigate("/doctor/patients")}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer rounded-xl h-9 px-4 shadow-sm flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              Browse Registered Patients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={themeStyles.layout.pageContainer}>
      {/* Top Header & Breadcrumb */}
      <div className={themeStyles.layout.headerBannerLight}>
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-teal-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/doctor/patients")}
              className="text-xs text-slate-600 hover:text-slate-900 -ml-2 h-8 px-2.5 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 text-teal-600" />
              <span>Back to Patients</span>
            </Button>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-mono font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
              {patientDetails?.patientId || activePatientId || (activePatientPrimaryKey ? `Record #${activePatientPrimaryKey}` : "")}
            </span>
          </div>

          <h1
            className={themeStyles.combine(
              themeStyles.typography.h1,
              "flex items-center gap-3"
            )}
          >
            <Stethoscope className="w-7 h-7 text-teal-700" />
            Patient Clinical History & Records
          </h1>
          <p className={themeStyles.typography.subtext}>
            Comprehensive electronic health records, past clinical encounters, diagnostic reports, and active medications.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void fetchPatientProfile();
              setOffset(0);
              setHasMore(true);
              void fetchMedicalRecords(0, true);
            }}
            disabled={loadingInitial || loadingPatient}
            className="text-xs border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer h-9 px-3.5 rounded-xl shadow-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${
                loadingInitial || loadingPatient ? "animate-spin text-teal-600" : ""
              }`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setCreateError(null);
              setCreateSuccessMsg(null);
              setIsCreateModalOpen(true);
            }}
            className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer h-9 px-4 rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Clinical Encounter
          </Button>
        </div>
      </div>

      {/* Patient Demographic Summary, Contact & Location Section */}
      {loadingPatient ? (
        <Card className={themeStyles.card.base}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : patientError ? (
        <Alert variant="destructive" className="p-4">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <AlertDescription className="text-xs">{patientError}</AlertDescription>
        </Alert>
      ) : patientDetails ? (
        <div className="space-y-4">
          {/* Main Demographic Header Banner */}
          <Card className={themeStyles.combine(themeStyles.card.base, "overflow-hidden border-teal-200/60 bg-white")}>
            <div className="p-6 bg-linear-to-r from-teal-900 via-slate-900 to-cyan-950 text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-teal-400 to-cyan-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-lg ring-4 ring-white/10">
                    {patientInitials}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {patientFullName}
                      </h2>
                      <Badge variant="verified" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                        ABDM Linked
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
                      <span>Patient ID: <strong className="text-white font-bold">{patientDetails.patientId}</strong></span>
                      <span>•</span>
                      <span>Record Key: #{patientDetails.patientPrimaryKey}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant={genderInfo.variant} className="text-xs px-3 py-1 font-semibold">
                    {genderInfo.text}
                  </Badge>
                  {patientDetails.age && (
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-white/10 text-white border-white/20 font-semibold">
                      {patientDetails.age} Years Old
                    </Badge>
                  )}
                  {patientDetails.dateOfBirth && (
                    <Badge variant="outline" className="text-xs px-3 py-1 bg-white/10 text-white border-white/20 font-semibold">
                      DOB: {patientDetails.dateOfBirth}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Meta Strip */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/60">
                <User className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Demographics</span>
                  <span className="font-semibold text-slate-800">{genderInfo.text}, {patientDetails.age ? `${patientDetails.age} Yrs` : "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/60">
                <Calendar className="w-4 h-4 text-cyan-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Birth Date</span>
                  <span className="font-semibold text-slate-800 font-mono">{patientDetails.dateOfBirth || "Not Recorded"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">EHR Status</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Profile
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/60">
                <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Attending Doctor</span>
                  <span className="font-semibold text-slate-800">{user?.doctorId || "Doctor Terminal"}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Cards Row: Patient Contacts & Full Residential Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. Patient Contact Card */}
            <Card className={themeStyles.card.base}>
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                    <Phone className="w-4 h-4" />
                  </div>
                  Patient Contacts & Reachability
                </CardTitle>
                <Badge variant="verified" className="text-[10px] bg-teal-50 text-teal-700 border-teal-200">
                  Direct Channel
                </Badge>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
                {/* Mobile Contact */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white text-teal-600 flex items-center justify-center border border-slate-200 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Primary Mobile Contact
                      </span>
                      <p className="font-bold text-slate-900 font-mono text-sm truncate">
                        {patientDetails.mobile || "Not Provided"}
                      </p>
                    </div>
                  </div>
                  {patientDetails.mobile ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(patientDetails.mobile!, "mobile")}
                        className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer rounded-lg border border-slate-200 bg-white"
                        title="Copy Phone Number"
                      >
                        {copiedField === "mobile" ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Copy
                          </span>
                        )}
                      </Button>
                      <a
                        href={`tel:${patientDetails.mobile}`}
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-slate-400">
                      No Phone
                    </Badge>
                  )}
                </div>

                {/* Email Contact */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white text-cyan-600 flex items-center justify-center border border-slate-200 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Registered Email Address
                      </span>
                      <p className="font-bold text-slate-900 text-xs truncate" title={patientDetails.email || "Not Provided"}>
                        {patientDetails.email || "Not Provided"}
                      </p>
                    </div>
                  </div>
                  {patientDetails.email ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(patientDetails.email!, "email")}
                        className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer rounded-lg border border-slate-200 bg-white"
                        title="Copy Email Address"
                      >
                        {copiedField === "email" ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Copy
                          </span>
                        )}
                      </Button>
                      <a
                        href={`mailto:${patientDetails.email}`}
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-xs transition-colors"
                      >
                        <Mail className="w-3 h-3" /> Email
                      </a>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-slate-400">
                      No Email
                    </Badge>
                  )}
                </div>

                {/* Communication note */}
                <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    Emergency notifications and digital prescription follow-ups will be transmitted to these verified credentials.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 2. Full Residential Location Card */}
            <Card className={themeStyles.card.base}>
              <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <MapPin className="w-4 h-4" />
                  </div>
                  Full Residential & Geographic Location
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-semibold text-slate-600">
                  EHR Location Record
                </Badge>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3.5 text-xs">
                {/* Full Address Block */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Complete Residential Address
                    </span>
                    {fullLocationString && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(fullLocationString, "address")}
                        className="h-6 px-2 text-[10px] text-slate-600 hover:text-slate-900 cursor-pointer rounded-md border border-slate-200 bg-white"
                        title="Copy Full Address"
                      >
                        {copiedField === "address" ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-2.5 h-2.5" /> Copy Full Address
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="font-semibold text-slate-800 text-xs leading-relaxed wrap-break-word">
                    {patientDetails.address || "No street address recorded in patient profile."}
                  </p>
                </div>

                {/* Sub-grid of District, State, and Pincode */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      District / City
                    </span>
                    <p className="font-bold text-slate-800 text-xs truncate" title={patientDetails.districtName || "N/A"}>
                      {patientDetails.districtName || (patientDetails.districtId ? `ID: ${patientDetails.districtId}` : "Not Specified")}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      State / Region
                    </span>
                    <p className="font-bold text-slate-800 text-xs truncate" title={patientDetails.stateName || "N/A"}>
                      {patientDetails.stateName || (patientDetails.stateId ? `ID: ${patientDetails.stateId}` : "Not Specified")}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Postal Pincode
                    </span>
                    <p className="font-bold font-mono text-teal-700 text-xs">
                      {patientDetails.pincode ? String(patientDetails.pincode) : "Not Specified"}
                    </p>
                  </div>
                </div>

                {/* Geolocation status */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> ABDM Geocoded Address Verified
                  </span>
                  {patientDetails.pincode && (
                    <span className="font-mono text-slate-400">PIN: {patientDetails.pincode}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Metrics Row */}
      <div className={themeStyles.layout.grid4}>
        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Total Medical Records
              </span>
              <p className="text-2xl font-black text-slate-900">
                {totalCount}
              </p>
            </div>
            <div className={themeStyles.iconBadge.teal}>
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Active Diagnoses
              </span>
              <p className="text-2xl font-black text-amber-600">
                {activeRecordsCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                Resolved Encounters
              </span>
              <p className="text-2xl font-black text-emerald-600">
                {resolvedRecordsCount}
              </p>
            </div>
            <div className={themeStyles.iconBadge.emerald}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={themeStyles.card.metric}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className={themeStyles.form.label}>
                EHR Compatibility
              </span>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ABDM Standards
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
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by diagnosis, clinical title, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs rounded-xl h-9 bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 shrink-0">
              Status:
            </span>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("1")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "1"
                    ? "bg-amber-500 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active ({activeRecordsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("2")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "2"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Resolved ({resolvedRecordsCount})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {recordsError && (
        <Alert variant="destructive" className="p-4">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <AlertDescription className="text-xs">{recordsError}</AlertDescription>
        </Alert>
      )}

      {/* Medical Records List Area */}
      {loadingInitial ? (
        <div className={themeStyles.state.loading}>
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            Loading patient clinical records...
          </p>
          <p className={themeStyles.typography.subtext}>
            Fetching diagnoses, active medications, and attached diagnostic documents.
          </p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className={themeStyles.state.empty}>
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center border border-teal-100">
            <FileText className="w-8 h-8 text-teal-600" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              {searchTerm || statusFilter !== "ALL"
                ? "No matching clinical records found"
                : "No clinical records recorded yet"}
            </h3>
            <p className={themeStyles.typography.subtext}>
              {searchTerm || statusFilter !== "ALL"
                ? "Try adjusting your search criteria or status filter."
                : "This patient does not have any medical records or encounter notes registered in the system."}
            </p>
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => {
                setCreateError(null);
                setCreateSuccessMsg(null);
                setIsCreateModalOpen(true);
              }}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer rounded-xl h-9 px-4 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Clinical Record
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Showing {filteredRecords.length} of {totalCount} clinical records</span>
            <span>Click any record to inspect medications and documents</span>
          </div>

          {/* Grid of Medical Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecords.map((record) => {
              const isActive = record.status === 1;

              return (
                <Card
                  key={record.patientMedicalRecordId}
                  onClick={() => handleOpenRecordDetails(record.patientMedicalRecordId)}
                  className={themeStyles.combine(
                    themeStyles.card.interactive,
                    "flex flex-col justify-between overflow-hidden group hover:border-teal-500/60"
                  )}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-[10px] font-bold ${
                              isActive
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isActive ? "Active Case" : "Resolved / Completed"}
                          </Badge>
                          <span className="text-[11px] font-mono text-slate-400">
                            #{record.patientMedicalRecordId.slice(-6)}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                          {record.title || "Clinical Record"}
                        </h4>
                      </div>

                      <div className="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-teal-50 text-slate-400 group-hover:text-teal-600 flex items-center justify-center shrink-0 border border-slate-200 transition-colors">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Diagnosis & Assessment
                      </span>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                        {record.diagnosis || "No diagnosis details specified."}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Facility: {record.healthInstituteId || "Direct Encounter"}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-slate-400">
                        <User className="w-3.5 h-3.5" />
                        <span>Dr: {record.doctorId || user?.doctorId || "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-teal-700 font-medium flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      EHR Synced
                    </span>
                    <span className="text-teal-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      View Full Details &rarr;
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Infinite Scroll Bottom Intersection Sentinel */}
          <div ref={observerTargetRef} className="h-4 w-full" />

          {/* Loading More Spinner Indicator */}
          {loadingMore && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center gap-3 text-slate-600 text-xs font-medium animate-in fade-in">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Loading more clinical records...</span>
            </div>
          )}

          {/* End of List Notification */}
          {!hasMore && filteredRecords.length > 0 && (
            <div className="text-center py-6 border-t border-slate-200/80">
              <p className="text-xs text-slate-400 font-medium">
                All clinical records loaded for this patient ({records.length} records total)
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. Medical Record Details Modal */}
      {/* ========================================================================= */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border-slate-200 shadow-2xl">
          <div className="p-6 bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 text-white sticky top-0 z-20">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
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
                <h3 className="text-xl font-black text-white">
                  {loadingDetails ? "Loading clinical details..." : recordDetails?.title || "Clinical Record"}
                </h3>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {loadingDetails ? (
              <div className="space-y-4 py-8 text-center">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading clinical history and attached artifacts...</p>
              </div>
            ) : detailsError ? (
              <Alert variant="destructive" className="p-4">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs">{detailsError}</AlertDescription>
              </Alert>
            ) : recordDetails ? (
              <div className="space-y-6">
                {/* Diagnosis and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                      Diagnosis
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {recordDetails.diagnosis}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Clinical Timeline
                    </span>
                    <div className="flex items-center justify-between text-xs text-slate-800 pt-0.5">
                      <span>Started: <strong>{recordDetails.startedDate || "Not recorded"}</strong></span>
                      {recordDetails.resolvedDate && (
                        <span>Resolved: <strong>{recordDetails.resolvedDate}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {recordDetails.description && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Clinical Notes & Description
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {recordDetails.description}
                    </p>
                  </div>
                )}

                {/* Prescribed Medications */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-600" />
                      Prescribed Medications ({recordDetails.medications.length})
                    </h4>
                  </div>

                  {recordDetails.medications.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No prescription items recorded for this encounter.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Medication</th>
                            <th className="p-3">Dosage / Frequency</th>
                            <th className="p-3">Started Date</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {recordDetails.medications.map((med) => {
                            const badgeInfo = getMedicationStatusBadge(med.status);
                            return (
                              <tr key={med.patientMedicationId} className="hover:bg-slate-50/50">
                                <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                                  <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                  {med.medicationName}
                                </td>
                                <td className="p-3 font-semibold text-slate-700 font-mono">
                                  {med.dosage}
                                </td>
                                <td className="p-3 text-slate-600">
                                  {med.startDate}
                                </td>
                                <td className="p-3">
                                  <Badge className={`text-[10px] font-semibold ${badgeInfo.bg}`}>
                                    {badgeInfo.label}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Attached Clinical Documents */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      Attached Clinical Documents ({recordDetails.medicalDocuments.length})
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleOpenUploadDocs(recordDetails.patientMedicalRecordId)}
                      className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl cursor-pointer h-7 px-2.5 flex items-center gap-1 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Documents
                    </Button>
                  </div>

                  {recordDetails.medicalDocuments.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      No documents or lab reports attached to this record.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recordDetails.medicalDocuments.map((doc) => {
                        const fileUrl = getDocumentFullUrl(doc.documentUrl);

                        return (
                          <div
                            key={doc.patientMedicalDocumentId}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-2.5 hover:border-teal-400 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate" title={doc.title}>
                                    {doc.title || "Clinical Document"}
                                  </p>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
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
                                    className="h-8 px-2.5 text-xs text-teal-700 hover:text-teal-800 hover:bg-teal-50 border-teal-200 rounded-xl flex items-center gap-1 cursor-pointer font-semibold"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    View
                                  </Button>
                                </a>
                              )}
                            </div>

                            {doc.description && (
                              <p className="text-xs text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100 leading-relaxed">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailsModalOpen(false)}
              className="text-xs rounded-xl cursor-pointer"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 2. Create New Medical Record Modal */}
      {/* ========================================================================= */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-slate-200 shadow-2xl">
          <form onSubmit={handleCreateMedicalRecord}>
            <div className="p-6 bg-linear-to-r from-teal-900 via-slate-900 to-cyan-950 text-white sticky top-0 z-20">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Badge variant="verified" className="text-[10px] bg-teal-500/20 text-teal-300 border-teal-400/30">
                    New Clinical Encounter
                  </Badge>
                  <h3 className="text-xl font-black text-white">
                    Add Medical Record for {patientFullName}
                  </h3>
                  <p className="text-xs text-teal-200/80">
                    Record diagnosis, treatment plan, prescribed medications, and upload clinical reports.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {createError && (
                <Alert variant="destructive" className="p-4">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <AlertDescription className="text-xs">{createError}</AlertDescription>
                </Alert>
              )}

              {createSuccessMsg && (
                <Alert className="p-4 bg-emerald-50 text-emerald-800 border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <AlertDescription className="text-xs font-semibold">{createSuccessMsg}</AlertDescription>
                </Alert>
              )}

              {/* Section 1: Encounter Basics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  1. Clinical Assessment & Diagnosis
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={themeStyles.form.label}>
                      Record Title / Visit Reason <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Acute Bronchitis Evaluation"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="text-xs rounded-xl h-9 bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={themeStyles.form.label}>
                      Encounter Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={newStartedDate}
                      onChange={(e) => setNewStartedDate(e.target.value)}
                      required
                      className="text-xs rounded-xl h-9 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={themeStyles.form.label}>
                    Diagnosis / Clinical Findings <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Type 2 Diabetes with Peripheral Neuropathy, HbA1c 8.2%"
                    value={newDiagnosis}
                    onChange={(e) => setNewDiagnosis(e.target.value)}
                    required
                    className="text-xs rounded-xl h-9 bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={themeStyles.form.label}>
                    Attending Doctor
                  </label>
                  <Input
                    type="text"
                    disabled
                    value={`${user?.doctorId || "Doctor"} (${user?.email || user?.mobile || "Authenticated"})`}
                    className="text-xs rounded-xl h-9 bg-slate-100 text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={themeStyles.form.label}>
                    Clinical Notes, Observations & Advice
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter detailed clinical examination findings, treatment notes, diet/lifestyle recommendations..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Section 2: Medications */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-600" />
                    2. Prescribe Medications
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMedication}
                    className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50 h-8 px-2.5 rounded-xl cursor-pointer font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Medication
                  </Button>
                </div>

                {newMedications.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    No medications added yet. Click &ldquo;Add Medication&rdquo; to prescribe drugs with dosage.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {newMedications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
                      >
                        <div className="flex-1 w-full sm:w-auto">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Drug Name
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. Paracetamol 650mg"
                            value={med.medicationName}
                            onChange={(e) =>
                              handleUpdateMedication(idx, "medicationName", e.target.value)
                            }
                            required
                            className="text-xs rounded-xl h-8 bg-white"
                          />
                        </div>

                        <div className="w-full sm:w-44">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Dosage / Frequency
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. 1-0-1 After Meals"
                            value={med.dosage}
                            onChange={(e) =>
                              handleUpdateMedication(idx, "dosage", e.target.value)
                            }
                            required
                            className="text-xs rounded-xl h-8 bg-white"
                          />
                        </div>

                        <div className="w-full sm:w-36">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Start Date
                          </label>
                          <Input
                            type="date"
                            value={med.startDate}
                            onChange={(e) =>
                              handleUpdateMedication(idx, "startDate", e.target.value)
                            }
                            required
                            className="text-xs rounded-xl h-8 bg-white"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMedication(idx)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8 p-0 rounded-xl cursor-pointer shrink-0 mt-4 sm:mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Document Attachments */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-teal-600" />
                    3. Upload Clinical Documents / Reports
                  </h4>

                  <label className="inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    Upload File
                    <input
                      type="file"
                      onChange={handleAddDocumentFile}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                    />
                  </label>
                </div>

                {newDocuments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    No files attached. Upload prescriptions, blood test reports, or scan results (PDF / Images).
                  </p>
                ) : (
                    <div className="space-y-2.5">
                    {newDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
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
                              className="text-xs rounded-xl h-8 bg-slate-50"
                            />
                          </div>

                          <div className="w-full sm:w-44">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Document Type
                            </label>
                            <select
                              value={doc.documentType}
                              onChange={(e) =>
                                handleUpdateDocumentMeta(idx, "documentType", Number(e.target.value))
                              }
                              className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                            >
                              <option value={1}>Prescription</option>
                              <option value={2}>Lab Test Report</option>
                              <option value={3}>Discharge Summary</option>
                              <option value={4}>Diagnostic Scan</option>
                              <option value={5}>Other Medical Record</option>
                            </select>
                          </div>

                          <div className="w-full sm:w-36">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              Document Date
                            </label>
                            <Input
                              type="date"
                              value={doc.documentDate}
                              onChange={(e) =>
                                handleUpdateDocumentMeta(idx, "documentDate", e.target.value)
                              }
                              required
                              className="text-xs rounded-xl h-8 bg-slate-50"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument(idx)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8 p-0 rounded-xl cursor-pointer shrink-0 mt-4 sm:mt-5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Document Description / Clinical Notes (Optional)
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. Fasting glucose report, Dr. Roy handwritten notes..."
                            value={doc.description || ""}
                            onChange={(e) =>
                              handleUpdateDocumentMeta(idx, "description", e.target.value)
                            }
                            className="text-xs rounded-xl h-8 bg-slate-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={submittingRecord}
                className="text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingRecord}
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-teal-600/20 px-4 flex items-center gap-1.5"
              >
                {submittingRecord ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Record...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save & Sync Record</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 3. Upload More Documents Modal (Existing Medical Record) */}
      {/* ========================================================================= */}
      <Dialog open={isUploadDocsModalOpen} onOpenChange={setIsUploadDocsModalOpen}>
        <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl">
          <div className="p-6 bg-linear-to-r from-teal-700 via-teal-800 to-emerald-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Upload Clinical Documents
                </h3>
                <p className="text-xs text-teal-100 font-medium">
                  Attach more prescriptions, reports, or scans to this clinical encounter
                </p>
              </div>
            </div>
            {patientDetails?.patientId && (
              <Badge className="bg-white/10 text-white border-white/20 text-xs font-mono">
                {patientDetails.patientId}
              </Badge>
            )}
          </div>

          <form onSubmit={handleSubmitUploadDocs}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {uploadDocsError && (
                <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <AlertDescription className="text-xs font-medium ml-2">
                    {uploadDocsError}
                  </AlertDescription>
                </Alert>
              )}

              {uploadDocsSuccessMsg && (
                <Alert className="bg-teal-50 border-teal-200 text-teal-800 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <AlertDescription className="text-xs font-medium ml-2">
                    {uploadDocsSuccessMsg}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Select & Attach Files
                </h4>

                <label className="inline-flex items-center gap-1.5 text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  Choose File(s)
                  <input
                    type="file"
                    onChange={handleAddUploadDocFile}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                  />
                </label>
              </div>

              {uploadDocsList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-2">
                  <Upload className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-500">
                    No documents selected yet.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Upload medical prescriptions, blood tests, radiology scans, or discharge summaries (PDF / JPEG / PNG).
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadDocsList.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
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
                              handleUpdateUploadDocMeta(idx, "title", e.target.value)
                            }
                            required
                            className="text-xs rounded-xl h-8 bg-slate-50"
                          />
                        </div>

                        <div className="w-full sm:w-44">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Document Type
                          </label>
                          <select
                            value={doc.documentType}
                            onChange={(e) =>
                              handleUpdateUploadDocMeta(idx, "documentType", Number(e.target.value))
                            }
                            className="w-full h-8 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value={1}>Prescription</option>
                            <option value={2}>Lab Test Report</option>
                            <option value={3}>Discharge Summary</option>
                            <option value={4}>Diagnostic Scan</option>
                            <option value={5}>Other Medical Record</option>
                          </select>
                        </div>

                        <div className="w-full sm:w-36">
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            Document Date
                          </label>
                          <Input
                            type="date"
                            value={doc.documentDate}
                            onChange={(e) =>
                              handleUpdateUploadDocMeta(idx, "documentDate", e.target.value)
                            }
                            required
                            className="text-xs rounded-xl h-8 bg-slate-50"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUploadDoc(idx)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8 p-0 rounded-xl cursor-pointer shrink-0 mt-4 sm:mt-5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Document Notes / Clinical Description (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Fasting glucose report, Dr. Roy handwritten notes..."
                          value={doc.description || ""}
                          onChange={(e) =>
                            handleUpdateUploadDocMeta(idx, "description", e.target.value)
                          }
                          className="text-xs rounded-xl h-8 bg-slate-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUploadDocsModalOpen(false)}
                disabled={submittingUploadDocs}
                className="text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingUploadDocs || uploadDocsList.length === 0}
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-teal-600/20 px-4 flex items-center gap-1.5"
              >
                {submittingUploadDocs ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Upload & Attach ({uploadDocsList.length})</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorPatientClinicalHistoryPage;
