import React, { useState } from "react";
import {
  Search,
  AlertTriangle,
  Pill,
  Clock,
  ShieldCheck,
  CheckCircle2,
  User,
  Plus,
  Zap,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

// Mock Database of Patients for Dashboard Search
const DASHBOARD_PATIENTS: Record<string, any> = {
  "ABHA-9988-7712": {
    abhaId: "ABHA-9988-7712",
    name: "Rajesh Sharma",
    age: 48,
    gender: "Male",
    bloodGroup: "O+",
    contact: "+91 98102-34567",
    emergencyContact: "+91 98102-99887 (Wife)",
    allergies: [
      { drug: "Penicillin", severity: "HIGH (Anaphylaxis)", recordedBy: "AIIMS New Delhi Emergency (2024)" },
      { drug: "Aspirin / NSAIDs", severity: "MODERATE (Gastric Bleed)", recordedBy: "Fortis Gurugram (2025)" }
    ],
    activeMedications: [
      { drug: "Metformin 500mg", dosage: "1-0-1", prescribedBy: "Dr. S. Mehta (Endocrinology)", hospital: "Apollo Hospital, New Delhi", startDate: "12 Jul 2026" },
      { drug: "Telmisartan 40mg", dosage: "1-0-0", prescribedBy: "Dr. V. K. Sen (Cardiology)", hospital: "Fortis Healthcare, Gurugram", startDate: "01 Aug 2026" }
    ],
    encounterHistory: [
      { date: "24 Jul 2026", hospital: "Max Super Specialty, Saket", diagnosis: "Acute Angina / Chest Pain Evaluation", doctor: "Dr. A. K. Verma", type: "Inpatient OPD" },
      { date: "12 May 2026", hospital: "Apollo Hospital, Sarita Vihar", diagnosis: "Type 2 Diabetes Routine Checkup", doctor: "Dr. S. Mehta", type: "Outpatient" },
      { date: "10 Nov 2024", hospital: "AIIMS Emergency Trauma Centre", diagnosis: "Severe Drug Reaction to Amoxicillin", doctor: "Dr. P. Sharma", type: "Emergency ER" }
    ]
  },
  "ABHA-4411-9023": {
    abhaId: "ABHA-4411-9023",
    name: "Priya Sundaram",
    age: 34,
    gender: "Female",
    bloodGroup: "B-",
    contact: "+91 97412-88210",
    emergencyContact: "+91 97412-11223 (Husband)",
    allergies: [
      { drug: "Ibuprofen / Naproxen", severity: "HIGH (Severe Urticaria)", recordedBy: "Manipal Hospital Bangalore (2025)" }
    ],
    activeMedications: [
      { drug: "Levothyroxine 50mcg", dosage: "1-0-0 (Morning Empty Stomach)", prescribedBy: "Dr. V. Rao", hospital: "Manipal Hospital, Bangalore", startDate: "15 Jan 2026" }
    ],
    encounterHistory: [
      { date: "02 Aug 2026", hospital: "Columbia Asia, Hebbal", diagnosis: "Laparoscopic Appendectomy", doctor: "Dr. R. Nair", type: "Surgical ER" },
      { date: "15 Jan 2026", hospital: "Manipal Hospital", diagnosis: "Hypothyroidism Initial Workup", doctor: "Dr. V. Rao", type: "OPD Consultation" }
    ]
  }
};

export const DoctorDashboardPreview: React.FC = () => {
  const { user } = useAuth();
  const doctorName = localStorage.getItem("arogya_doctor_name") || "Dr. Subham Saha";

  const [searchQuery, setSearchQuery] = useState("ABHA-9988-7712");
  const [activePatientKey, setActivePatientKey] = useState<string>("ABHA-9988-7712");
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("1-0-1");
  const [prescriptionSuccessMsg, setPrescriptionSuccessMsg] = useState("");

  const patient = DASHBOARD_PATIENTS[activePatientKey] || DASHBOARD_PATIENTS["ABHA-9988-7712"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim().toUpperCase();
    if (DASHBOARD_PATIENTS[clean]) {
      setActivePatientKey(clean);
    } else {
      setActivePatientKey("ABHA-9988-7712");
    }
  };

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const medLower = newMedName.toLowerCase();
    const hasAllergyConflict = patient.allergies.some((a: any) =>
      medLower.includes(a.drug.toLowerCase().split(" ")[0])
    );

    if (hasAllergyConflict) {
      alert(`⚠️ ALLERGY CONTRAINDICATION ALERT!\n\nPatient is allergic to ${newMedName}. Prescription blocked by ArogyaLink Safety Guard.`);
      return;
    }

    patient.activeMedications.unshift({
      drug: newMedName,
      dosage: newMedDosage,
      prescribedBy: `${doctorName} (Current Doctor)`,
      hospital: "Your Current Hospital Center",
      startDate: "Today (Just Now)"
    });

    setNewMedName("");
    setPrescriptionSuccessMsg(`Successfully added ${newMedName} to patient's cross-hospital regimen.`);
    setTimeout(() => setPrescriptionSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Patient Search Banner */}
      <Card className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white border-slate-800 shadow-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs text-teal-300 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                National Patient History Query Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Consolidated Medical Record Lookup
              </h1>
              <p className="text-sm text-slate-300">
                Search by ABHA Health ID or Mobile number to aggregate records from all connected hospital nodes.
              </p>
            </div>

            {/* Quick Search Form */}
            <form onSubmit={handleSearch} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter ABHA ID (e.g. ABHA-9988-7712)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <Button type="submit" variant="emerald" className="font-bold">
                <Zap className="w-4 h-4 mr-1.5" />
                Fetch History
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Patient Record Main Detail Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Profile & Allergies */}
        <div className="lg:col-span-4 space-y-6">
          {/* Patient Identity Card */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <Badge variant="teal" className="text-[10px]">
                  ABHA: {patient.abhaId}
                </Badge>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Active Session
                </span>
              </div>
              <CardTitle className="text-xl font-extrabold text-slate-900 mt-2 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-700" />
                {patient.name}
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">
                {patient.age} Yrs • {patient.gender} • Blood Group: <strong className="text-slate-900">{patient.bloodGroup}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 font-semibold block">Contact:</span>
                <span className="font-mono font-medium">{patient.contact}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Emergency Contact:</span>
                <span className="font-mono text-red-700 font-medium">{patient.emergencyContact}</span>
              </div>
            </CardContent>
          </Card>

          {/* Critical Allergies Card */}
          <Card className="border-red-300 bg-red-50/50 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                Consolidated Drug Allergies ({patient.allergies.length})
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.allergies.map((allergy: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-white border border-red-200 shadow-xs space-y-1">
                  <div className="font-bold text-red-900 text-sm flex items-center justify-between">
                    <span>⚠️ {allergy.drug}</span>
                    <Badge variant="emergency" className="text-[9px] px-1.5 py-0">
                      {allergy.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Reported by: {allergy.recordedBy}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Add Prescription Form */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-700" />
                Add Cross-Hospital Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPrescription} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Medication Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Paracetamol 650mg or Penicillin"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dosage Frequency</label>
                  <select
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs"
                  >
                    <option value="1-0-1">1-0-1 (Morning & Night)</option>
                    <option value="1-1-1">1-1-1 (Thrice daily)</option>
                    <option value="1-0-0">1-0-0 (Morning only)</option>
                    <option value="0-0-1">0-0-1 (Night only)</option>
                    <option value="SOS">SOS (As needed)</option>
                  </select>
                </div>

                {prescriptionSuccessMsg && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {prescriptionSuccessMsg}
                  </div>
                )}

                <Button type="submit" variant="emerald" className="w-full text-xs font-bold py-2.5">
                  Save to Patient's Regimen
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Regimens & Hospital Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Medications Across Hospitals */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-700" />
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Active Medications Across All Connected Hospitals
                  </CardTitle>
                </div>
                <Badge variant="teal">
                  {patient.activeMedications.length} Prescriptions Synchronized
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {patient.activeMedications.map((rx: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{rx.drug}</span>
                      <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-mono text-xs">
                        {rx.dosage}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-3">
                      <span>🏥 <strong>Hospital:</strong> {rx.hospital}</span>
                      <span>👨‍⚕️ <strong>Prescribed By:</strong> {rx.prescribedBy}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    Started: {rx.startDate}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Consolidated Historical Timeline */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-700" />
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Consolidated Multi-Hospital Encounter History
                  </CardTitle>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Export Case File
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="relative border-l-2 border-slate-200 pl-6 space-y-6 ml-2">
                {patient.encounterHistory.map((enc: any, i: number) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-teal-600 border-4 border-white shadow-sm"></div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-teal-300 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          {enc.date}
                        </span>
                        <Badge variant="outline" className="text-[11px]">
                          {enc.type}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {enc.diagnosis}
                      </h4>
                      <div className="text-xs text-slate-600 flex flex-wrap gap-4">
                        <span>🏥 {enc.hospital}</span>
                        <span>👨‍⚕️ {enc.doctor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboardPreview;
