import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, LogOut, Activity, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export const HealthInstituteLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const healthInstituteId = user?.healthInstituteId || "N000001";
  const healthInstituteName =
    user?.healthInstituteName ||
    localStorage.getItem("arogya_institute_name") ||
    "Divine Polyclinic";
  const instituteEmail =
    user?.email ||
    localStorage.getItem("arogya_institute_email") ||
    "divine.polyclinic@gmail.com";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:flex-row">
      {/* Side Navbar - Health Institute Terminal */}
      <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl min-h-screen">
        <div>
          {/* Sidebar Header / Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-slate-950 shadow-md">
                <Activity className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white">
                  Arogya<span className="text-teal-400">Link</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">
                  Institute Terminal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Route Links */}
          <nav className="p-4 space-y-2">
            <NavLink
              to="/health-institute/profile"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <Building2 className="w-5 h-5 shrink-0" />
              <span>Institute Profile Details</span>
            </NavLink>

            <NavLink
              to="/health-institute/dashboard"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span>Institute Dashboard</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer - Health Institute Account Summary & Sign Out */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center border border-teal-500/30 text-sm shrink-0">
              {healthInstituteName.charAt(0) || "H"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                {healthInstituteName}
              </span>
              <span className="text-[10px] text-teal-400 font-mono truncate">
                {healthInstituteId}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {instituteEmail}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full justify-center bg-slate-900 border-slate-800 text-slate-300 hover:bg-red-950 hover:text-red-300 hover:border-red-800 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default HealthInstituteLayout;
