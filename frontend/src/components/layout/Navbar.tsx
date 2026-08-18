import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Menu,
  X,
  Stethoscope,
  Building2,
  ChevronDown,
  LogIn,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAuthDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Arogya<span className="text-teal-700">Link</span>
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block ml-0.5"></span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-[5px]">
                National Health Network
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isActive("/")
                  ? "text-teal-700 font-bold"
                  : "text-slate-600 hover:text-teal-700"
              }`}
            >
              Home
            </Link>
            <a
              href="#features"
              className="text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors"
            >
              Features & Interoperability
            </a>
            <a
              href="#emergency-sandbox"
              className="text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors flex items-center gap-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Emergency Access
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-600 hover:text-teal-700 transition-colors"
            >
              How It Works
            </a>
          </nav>

          {/* Right Action Dropdown */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="emerald"
                onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                className="font-bold shadow-teal-600/20 py-2.5 px-4 flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Access Portals</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${authDropdownOpen ? "rotate-180" : ""}`}
                />
              </Button>

              {/* Dropdown Menu */}
              {authDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Doctor Section */}
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50/80 rounded-lg flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      Doctor Portal
                    </div>
                    <Link
                      to="/login"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100/70 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                          Doctor Sign In
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Access patient medical records
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100/70 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                          Register Doctor
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Create NMC verified profile
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="my-2 border-t border-slate-100" />

                  {/* Health Institute Section */}
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50/80 rounded-lg flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                      Health Institute Portal
                    </div>
                    <Link
                      to="/health-institute/login"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-100/70 text-cyan-700 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700">
                          Institute Sign In
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Hospital & clinic login
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/health-institute/register"
                      onClick={() => setAuthDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-100/70 text-cyan-700 flex items-center justify-center shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700">
                          Register Institute
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Register your hospital & clinic
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-teal-700"
          >
            Home
          </Link>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-teal-700"
          >
            Features & Interoperability
          </a>
          <a
            href="#emergency-sandbox"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-red-600 font-semibold"
          >
            Emergency Access Lookup
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-teal-700"
          >
            How It Works
          </a>

          {/* Mobile Auth Portals Group */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Access Portals
            </div>

            {/* Doctor Routes */}
            <div className="space-y-1.5 pl-2 border-l-2 border-teal-500">
              <div className="text-xs font-bold text-teal-800 flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Doctor
                Portal
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold"
                  >
                    Doctor Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="emerald"
                    size="sm"
                    className="w-full text-xs font-semibold"
                  >
                    Register Doctor
                  </Button>
                </Link>
              </div>
            </div>

            {/* Institute Routes */}
            <div className="space-y-1.5 pl-2 border-l-2 border-cyan-500 pt-1">
              <div className="text-xs font-bold text-cyan-800 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-600" /> Health
                Institute Portal
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/health-institute/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold"
                  >
                    Institute Login
                  </Button>
                </Link>
                <Link
                  to="/health-institute/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="emerald"
                    size="sm"
                    className="w-full text-xs font-semibold"
                  >
                    Register Facility
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
