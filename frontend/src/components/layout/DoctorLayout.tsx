import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { User, LogOut, Activity, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export const DoctorLayout: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const doctorId = user?.doctorId || "DOC000001";
  const doctorName =
    localStorage.getItem("arogya_doctor_name") || "Dr. Subham Saha";
  const doctorIdentifier =
    user?.email ||
    user?.mobile ||
    localStorage.getItem("arogya_doctor_identifier") ||
    "dr.saha@arogyalink.org";

  return (
    <div className="h-screen w-full bg-slate-100 text-slate-900 flex flex-col md:flex-row overflow-hidden">
      {/* Fixed Side Navbar on Desktop */}
      <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl md:h-screen md:sticky md:top-0 select-none">
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Sidebar Header / Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-slate-900 shadow-md">
                <Activity className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white">
                  Arogya<span className="text-teal-400">Link</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">
                  Doctor Terminal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Route Links */}
          <nav className="p-4 space-y-2 flex-1">
            <NavLink
              to="/doctor/profile"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <User className="w-5 h-5 shrink-0" />
              <span>Doctor Profile Details</span>
            </NavLink>

            <NavLink
              to="/doctor/associated-institutes"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <Building2 className="w-5 h-5 shrink-0" />
              <span>Associated Institutes</span>
            </NavLink>

            <NavLink
              to="/doctor/dashboard"
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <Search className="w-5 h-5 shrink-0" />
              <span>Patient History Search</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer - Doctor Account Summary & Sign Out */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3 shrink-0">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center border border-teal-500/30 text-sm shrink-0">
              {doctorName.charAt(0) || "D"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                {doctorName}
              </span>
              <span className="text-[10px] text-teal-400 font-mono truncate">
                {doctorId}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {doctorIdentifier}
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

export default DoctorLayout;
