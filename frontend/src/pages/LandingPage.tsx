import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  Stethoscope,
  Pill,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Sample Patient Sandbox Data for the interactive preview
const MOCK_PATIENTS = [
  {
    abhaId: "ABHA-9988-7712",
    name: "Rajesh Sharma",
    age: 48,
    gender: "Male",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Sulfonamides", "Aspirin"],
    ongoingMedications: [
      { name: "Metformin 500mg", dosage: "1-0-1", hospital: "Apollo Hospital, Delhi", prescribedDate: "12 Days ago" },
      { name: "Telmisartan 40mg", dosage: "1-0-0", hospital: "Fortis Healthcare, Gurugram", prescribedDate: "1 Month ago" }
    ],
    history: [
      { year: "2026", event: "Acute Coronary Angioplasty", hospital: "Max Super Specialty", doctor: "Dr. A. K. Verma (Cardiology)" },
      { year: "2025", event: "Type 2 Diabetes Diagnosis", hospital: "Apollo Hospital", doctor: "Dr. S. Mehta (Endocrinology)" },
      { year: "2024", event: "Severe Allergic Anaphylaxis to Amoxicillin", hospital: "AIIMS Emergency", doctor: "Dr. P. Sharma (ER)" }
    ]
  },
  {
    abhaId: "ABHA-4411-9023",
    name: "Priya Sundaram",
    age: 34,
    gender: "Female",
    bloodGroup: "B-",
    allergies: ["NSAIDS (Ibuprofen)", "Peanuts"],
    ongoingMedications: [
      { name: "Levothyroxine 50mcg", dosage: "1-0-0", hospital: "Manipal Hospital, Bangalore", prescribedDate: "3 Weeks ago" }
    ],
    history: [
      { year: "2026", event: "Emergency Appendectomy", hospital: "Columbia Asia", doctor: "Dr. R. Nair (General Surgery)" },
      { year: "2023", event: "Hypothyroidism Evaluation", hospital: "Manipal Hospital", doctor: "Dr. V. Rao (Endocrinology)" }
    ]
  }
];

export const LandingPage: React.FC = () => {
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [customAbhaInput, setCustomAbhaInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSandboxResult, setShowSandboxResult] = useState(true);

  const activePatient = MOCK_PATIENTS[selectedPatientIndex];

  const handleSandboxSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowSandboxResult(true);
    }, 600);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-teal-950 via-slate-900 to-slate-900 text-white">
        
        {/* Glowing Ambient Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-900/60 border border-teal-700/60 text-teal-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
                National Interoperable Health Infrastructure
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                Instant Consolidated <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                  Medical History & Allergy Access
                </span>{" "}
                in Emergencies
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                Solving fragmented health records across hospitals. ArogyaLink equips treating physicians with a unified timeline of past prescriptions, drug allergies, and active regimens—saving vital minutes when every second counts.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" variant="emerald" className="w-full text-base py-6 px-8 shadow-xl shadow-emerald-500/25 group">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    Register as Verified Doctor
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full text-base py-6 px-8 bg-slate-800/80 text-white border-slate-700 hover:bg-slate-800 hover:border-teal-500">
                    <UserCheck className="w-5 h-5 mr-2 text-teal-400" />
                    Doctor Portal Login
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  NMC Verified Doctors
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  ABDM & ABHA Integrated
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  End-to-End Encrypted
                </div>
              </div>

            </div>

            {/* Right Side Interactive Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Decorative Frame Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500 to-cyan-500 opacity-30 blur-xl"></div>
                
                <Card className="relative bg-slate-900/90 border-slate-800 text-white shadow-2xl backdrop-blur-xl">
                  <CardHeader className="border-b border-slate-800/80 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                          Live Emergency Feed
                        </span>
                      </div>
                      <Badge variant="teal" className="text-[10px]">
                        ABHA Network Sync: ACTIVE
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white font-bold mt-2 flex items-center justify-between">
                      <span>Emergency Patient Summary</span>
                      <span className="text-xs font-mono font-normal text-slate-400">ID: ABHA-9988-7712</span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4 text-sm">
                    {/* Patient Vital Card */}
                    <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-base">Rajesh Sharma (48M)</div>
                        <div className="text-xs text-slate-400">Blood Group: <span className="text-teal-300 font-bold">O+</span> | Location: ER Bed #04</div>
                      </div>
                      <Badge variant="emerald" className="px-2.5 py-1">
                        Verified Record
                      </Badge>
                    </div>

                    {/* Critical Allergy Alert */}
                    <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-red-400 text-xs uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        CRITICAL DRUG ALLERGY WARNING
                      </div>
                      <p className="text-xs text-red-200">
                        <strong className="text-white">PENICILLIN & ASPIRIN ALLERGY:</strong> Severe past anaphylactic reaction recorded at AIIMS Emergency (2024).
                      </p>
                    </div>

                    {/* Active Medication Regimen */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-400" />
                        Active Rx across 2 Hospitals
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-200">Metformin 500mg</span>
                            <span className="text-slate-400 block text-[11px]">Apollo Hospital • Dr. S. Mehta</span>
                          </div>
                          <span className="text-teal-400 font-mono font-semibold">1-0-1</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-200">Telmisartan 40mg</span>
                            <span className="text-slate-400 block text-[11px]">Fortis Hospital • Dr. V. Sen</span>
                          </div>
                          <span className="text-teal-400 font-mono font-semibold">1-0-0</span>
                        </div>
                      </div>
                    </div>

                    <a href="#emergency-sandbox" className="block pt-1">
                      <Button variant="ghost" className="w-full text-xs text-teal-400 hover:text-teal-300 hover:bg-slate-800/60 justify-center">
                        Test Interactive Lookup Sandbox ↓
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* METRICS & STATS BAR */}
      <section className="bg-slate-900 border-y border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-mono">500+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Hospitals Connected</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">15,000+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Verified Doctors</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">&lt; 2.0s</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Emergency Record Retrieval</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-mono">100%</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Interoperability (FHIR)</div>
            </div>

          </div>
        </div>
      </section>

      {/* PROBLEM STATEMENT & SOLUTION SECTION */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="teal" className="px-3 py-1 text-xs">
              Core Problem Solved
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why Healthcare Fragmentation Costs Lives
            </h2>
            <p className="text-slate-600 leading-relaxed">
              In India, when a patient visits an emergency room or a new clinic, their past diagnostic reports, prescriptions, and allergy records are trapped in separate hospital silos.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* The Old Fragmented Way */}
            <Card className="border-red-200 bg-red-50/40 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500"></div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-700 font-bold">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-red-950">
                      Traditional Fragmented Healthcare
                    </CardTitle>
                    <CardDescription className="text-red-700/80">
                      Isolated Hospital Silos & Paper Records
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 text-red-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✕</span>
                  <p><strong className="text-slate-900">Zero Visibility in Emergencies:</strong> Unconscious ER patients cannot report allergies or active blood thinners.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 text-red-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✕</span>
                  <p><strong className="text-slate-900">Duplicate Medical Tests:</strong> Patients undergo redundant blood tests and CT scans at each new hospital.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-200 text-red-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✕</span>
                  <p><strong className="text-slate-900">Dangerous Prescription Clashing:</strong> Doctors unknowingly prescribe drugs that interact adversely with existing regimens.</p>
                </div>
              </CardContent>
            </Card>

            {/* The ArogyaLink Interoperable Way */}
            <Card className="border-teal-200 bg-teal-50/40 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-600"></div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800 font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-teal-950">
                      With ArogyaLink Network
                    </CardTitle>
                    <CardDescription className="text-teal-800">
                      Unified Interoperable Health Record System
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                  <p><strong className="text-slate-900">Instant Consolidated History:</strong> ER doctors access full medical timeline via ABHA Health ID in seconds.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                  <p><strong className="text-slate-900">Real-Time Allergy Warnings:</strong> Red flags highlight Penicillin, Sulfa, or NSAID sensitivities automatically.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">✓</span>
                  <p><strong className="text-slate-900">Cross-Hospital Prescription Sync:</strong> Sees active regimens prescribed by Apollo, Fortis, Max, or AIIMS.</p>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </section>

      {/* INTERACTIVE EMERGENCY PATIENT LOOKUP SANDBOX */}
      <section className="py-20 bg-slate-900 text-white relative" id="emergency-sandbox">
        
        {/* Background glow */}
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Interactive Emergency Sandbox Demo
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Experience Instant Medical Record Lookup
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Test how treating doctors retrieve consolidated patient history and allergy warnings across multiple hospitals in real time.
            </p>
          </div>

          {/* Sandbox Control Card */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-slate-800/90 border-slate-700 text-white p-6 sm:p-8 shadow-2xl">
              
              {/* Select sample patient toggle */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-700">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Select Test Patient ID:
                  </div>
                  <div className="text-slate-300 text-sm mt-0.5">
                    Click a profile to simulate cross-hospital record aggregation
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  {MOCK_PATIENTS.map((pt, idx) => (
                    <Button
                      key={pt.abhaId}
                      size="sm"
                      variant={selectedPatientIndex === idx ? "emerald" : "outline"}
                      onClick={() => {
                        setSelectedPatientIndex(idx);
                        setShowSandboxResult(true);
                      }}
                      className={selectedPatientIndex !== idx ? "border-slate-600 text-slate-300 hover:bg-slate-700" : ""}
                    >
                      {pt.name} ({pt.abhaId})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Interactive Search Bar */}
              <form onSubmit={handleSandboxSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={customAbhaInput || activePatient.abhaId}
                    onChange={(e) => setCustomAbhaInput(e.target.value)}
                    placeholder="Enter Patient ABHA Health ID (e.g., ABHA-9988-7712)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <Button type="submit" variant="emerald" size="lg" disabled={isSearching} className="sm:w-auto">
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Querying Nodes...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Retrieve Consolidated History
                    </>
                  )}
                </Button>
              </form>

              {/* Sandbox Output Result View */}
              {showSandboxResult && (
                <div className="mt-8 pt-6 border-t border-slate-700 space-y-6">
                  
                  {/* Top Bar: Patient Profile Header */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-900/60 border border-teal-700 flex items-center justify-center font-bold text-teal-300 text-lg">
                        {activePatient.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white flex items-center gap-2">
                          {activePatient.name}
                          <Badge variant="teal" className="text-[10px]">
                            ABHA: {activePatient.abhaId}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400">
                          {activePatient.age} Yrs • {activePatient.gender} • Blood Group: <span className="text-red-400 font-bold">{activePatient.bloodGroup}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="emerald" className="px-3 py-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        3 Hospital Nodes Connected
                      </Badge>
                    </div>
                  </div>

                  {/* Allergy Alert Banner */}
                  <div className="p-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 space-y-2">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      CONSOLIDATED DRUG ALLERGY WARNINGS ({activePatient.allergies.length})
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {activePatient.allergies.map((allergy, i) => (
                        <span key={i} className="px-3 py-1 rounded-md bg-red-900/80 border border-red-600 text-white font-bold text-xs">
                          ⚠️ {allergy}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Two Column Grid: Ongoing Rx vs Medical History */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Ongoing Regimen across Hospitals */}
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 space-y-3">
                      <div className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-teal-400" />
                          Ongoing Medications Across Hospitals
                        </span>
                        <span className="text-[10px] text-slate-400">{activePatient.ongoingMedications.length} Active</span>
                      </div>

                      <div className="space-y-2">
                        {activePatient.ongoingMedications.map((rx, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/70 space-y-1">
                            <div className="flex justify-between font-bold text-slate-200 text-sm">
                              <span>{rx.name}</span>
                              <span className="text-teal-400 font-mono">{rx.dosage}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>🏥 {rx.hospital}</span>
                              <span>{rx.prescribedDate}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Historical Timeline */}
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 space-y-3">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        Consolidated Past Medical Encounters
                      </div>

                      <div className="space-y-2">
                        {activePatient.history.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/70 text-xs space-y-1">
                            <div className="flex justify-between text-slate-200 font-semibold">
                              <span>{item.event}</span>
                              <span className="text-teal-400 font-mono">{item.year}</span>
                            </div>
                            <div className="text-slate-400">
                              {item.hospital} • {item.doctor}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </Card>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS STEP BY STEP */}
      <section className="py-20 bg-slate-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="teal" className="px-3 py-1 text-xs">
              Simple 3-Step Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How ArogyaLink Operates in Real Time
            </h2>
            <p className="text-slate-600">
              Designed for speed and clinical precision during emergencies and routine consultations.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <Card className="bg-white border-slate-200 shadow-md relative hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 font-black text-xl flex items-center justify-center">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Doctor Authentication & Patient Lookup
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Treating physicians log in with NMC credentials and enter the patient's ABHA ID or scan their emergency QR card.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="bg-white border-slate-200 shadow-md relative hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-800 font-black text-xl flex items-center justify-center">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Federated Cross-Hospital Retrieval
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  ArogyaLink securely queries partner hospital nodes (Apollo, Fortis, AIIMS, diagnostic labs) using FHIR standard APIs.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="bg-white border-slate-200 shadow-md relative hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Consolidated View & Allergy Guard
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The doctor reviews a unified timeline of active medications, contraindications, and previous diagnosis before prescribing.
                </p>
              </CardContent>
            </Card>

          </div>

        </div>
      </section>

      {/* FINAL CALL TO ACTION FOR DOCTORS */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-cyan-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">
            Are You a Licensed Medical Professional?
          </h2>
          <p className="text-teal-100 max-w-2xl mx-auto text-base">
            Join thousands of doctors across India providing safer emergency and follow-up care with ArogyaLink’s unified health record network.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button size="lg" variant="emerald" className="py-6 px-8 text-base shadow-lg">
                <UserCheck className="w-5 h-5 mr-2" />
                Create Doctor Registration
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="py-6 px-8 text-base bg-white/10 text-white border-white/30 hover:bg-white/20">
                <Stethoscope className="w-5 h-5 mr-2" />
                Sign In to Doctor Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
