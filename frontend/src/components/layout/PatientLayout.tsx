import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { User, LogOut, HeartPulse, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export const PatientLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const patientId = user?.patientId || "PATIENT";
  const patientIdentifier = user?.email || user?.mobile || "patient@arogyalink.org";

  return (
    <div className="h-screen w-full bg-slate-100 text-slate-900 flex flex-col md:flex-row overflow-hidden">
      {/* Fixed Side Navbar on Desktop */}
      <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl md:h-screen md:sticky md:top-0 select-none">
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Sidebar Header / Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-900 shadow-md">
                <HeartPulse className="w-6 h-6 text-white font-bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white">
                  Arogya<span className="text-emerald-400">Link</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Patient Health Vault
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Route Links */}
          <nav className="p-4 space-y-2 flex-1">
            <NavLink
              to="/patient/profile"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <User className="w-5 h-5 shrink-0" />
              <span>Personal Profile</span>
            </NavLink>

            <NavLink
              to="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <Home className="w-5 h-5 shrink-0" />
              <span>National Network</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer - Patient Account Summary & Sign Out */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3 shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center border border-emerald-500/30 text-sm shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                Patient Account
              </span>
              <span className="text-[10px] text-emerald-400 font-mono truncate">
                {patientId}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {patientIdentifier}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-center bg-slate-900 border-slate-800 text-slate-300 hover:bg-red-950 hover:text-red-300 hover:border-red-800 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area - Independently Scrollable */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PatientLayout;
