import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Shield, UserCheck, Menu, X, AlertTriangle, ChevronRight, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest -mt-1">
                National Health Network
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${
                isActive("/") ? "text-teal-700 font-bold" : "text-slate-600 hover:text-teal-700"
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

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="font-semibold text-slate-700 border-slate-300 hover:border-teal-600 hover:text-teal-700">
                <Stethoscope className="w-4 h-4 mr-2 text-teal-600" />
                Doctor Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="emerald" className="font-semibold shadow-teal-600/20">
                <UserCheck className="w-4 h-4 mr-2" />
                Register Doctor
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/login" className="mr-1">
              <Button size="sm" variant="outline" className="text-xs py-1 h-8">
                Login
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
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
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Doctor Login
              </Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="emerald" className="w-full justify-center">
                Register Doctor Profile
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
