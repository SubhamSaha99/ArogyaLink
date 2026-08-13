import React from "react";
import { Link } from "react-router-dom";
import { Activity, ShieldCheck, Lock, Hospital, Heart, PhoneCall, Award } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Problem Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-900 font-bold shadow-md shadow-teal-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Arogya<span className="text-teal-400">Link</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              Bridging India’s fragmented healthcare ecosystem. ArogyaLink provides verified doctors and emergency care providers instant, secure, and interoperable access to consolidated patient medical histories, drug allergy alerts, and prescription regimens across hospitals.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-teal-400 bg-teal-950/80 px-3 py-1.5 rounded-full border border-teal-800/60">
                <ShieldCheck className="w-4 h-4" />
                ABDM Compliant
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-800/60">
                <Lock className="w-4 h-4" />
                256-Bit Encrypted
              </div>
            </div>
          </div>

          {/* Quick Links for Doctors */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              For Doctors & Clinics
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-teal-400 transition-colors">
                  Doctor Login Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-400 transition-colors">
                  Medical Registration
                </Link>
              </li>
              <li>
                <a href="#emergency-sandbox" className="hover:text-teal-400 transition-colors">
                  Emergency History Access Protocol
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-teal-400 transition-colors">
                  Cross-Hospital Rx Lookup
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-teal-400 transition-colors">
                  Drug Allergy Warning System
                </a>
              </li>
            </ul>
          </div>

          {/* For Hospitals & Enterprise */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Hospitals & EMR/EHR
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-teal-400 transition-colors">
                  FHIR / HL7 Interoperability
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-teal-400 transition-colors">
                  Hospital Onboarding & Node Setup
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-teal-400 transition-colors">
                  ICU & Trauma Center Integration
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-teal-400 transition-colors">
                  Consent Management Layer
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Emergency Network
            </h4>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <PhoneCall className="w-4 h-4 animate-pulse" />
                24/7 Hotline Support
              </div>
              <p className="text-xs text-slate-400">
                Hospital ER teams needing emergency break-glass authorization:
              </p>
              <div className="text-lg font-extrabold text-white font-mono">
                1800-AROGYA-HELP
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ArogyaLink Unified Health Network. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">NMC Medical Compliance</a>
            <a href="#" className="hover:text-slate-300">Data Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
