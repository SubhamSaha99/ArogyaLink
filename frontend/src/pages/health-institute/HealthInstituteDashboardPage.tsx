import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  Stethoscope,
  Activity,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { callApi } from "@/utils/axios";
import { API_ROUTES } from "@/utils/apiRoutes";

export const HealthInstituteDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [instituteData, setInstituteData] = useState<any>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await callApi(API_ROUTES.getHealthInstituteDetails, null, "GET");
        const data = response?.data?.healthInstituteId
          ? response.data
          : response?.healthInstituteId
          ? response
          : response?.data;
        if (data) {
          setInstituteData(data);
        }
      } catch (err) {
        console.error("Dashboard failed to fetch institute details:", err);
      }
    };
    fetchDetails();
  }, []);

  const instituteName =
    instituteData?.profileDetails?.healthInstituteName ||
    user?.healthInstituteName;
  const instituteId =
    instituteData?.healthInstituteId || user?.healthInstituteId;

  const STATS = [
    {
      label: "Affiliated Doctors",
      value: "24",
      change: "+3 this month",
      icon: <Stethoscope className="w-5 h-5 text-teal-600" />,
      color: "bg-teal-50 border-teal-200 text-teal-900",
    },
    {
      label: "OPD Patient Records",
      value: "1,248",
      change: "+12% overall",
      icon: <Users className="w-5 h-5 text-cyan-600" />,
      color: "bg-cyan-50 border-cyan-200 text-cyan-900",
    },
    {
      label: "Diagnostic Systems",
      value: "8 Active",
      change: "All online",
      icon: <Activity className="w-5 h-5 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    {
      label: "ABDM Gateway Sync",
      value: "99.9%",
      change: "Fully Compliant",
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      color: "bg-indigo-50 border-indigo-200 text-indigo-900",
    },
  ];

  const RECENT_ACTIVITIES = [
    {
      id: 1,
      title: "Doctor Affiliation Verified",
      time: "10 mins ago",
      desc: "Dr. Ananya Sharma (Cardiology) profile linked to institute.",
    },
    {
      id: 2,
      title: "Health Record Pushed to ABDM",
      time: "45 mins ago",
      desc: "OPD Visit Summary #AB-8849 synced with National Health Vault.",
    },
    {
      id: 3,
      title: "Institute License Verified",
      time: "2 hours ago",
      desc: "Annual Hospital Registration license verified with State Council.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal" className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs px-3 py-1">
              <Building2 className="w-3.5 h-3.5 mr-1" />
              Official Facility Terminal
            </Badge>
            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-950/40">
              ABDM Gateway Connected
            </Badge>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {instituteName}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl font-mono">
              Health Institute ID: <span className="text-teal-300 font-bold">{instituteId}</span>
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/health-institute/profile">
              <Button variant="emerald" className="font-bold text-xs px-5">
                View Institute Profile
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-xs hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className={`p-3 rounded-2xl border ${stat.color}`}>
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions & Overview */}
        <Card className="lg:col-span-7 border-slate-200 shadow-xs bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-700" />
              Facility Operations & Quick Shortcuts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all bg-slate-50/50 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Institute Profile</h4>
                <p className="text-xs text-slate-500">
                  Manage hospital name, category, license number, and location details.
                </p>
                <Link to="/health-institute/profile" className="inline-block pt-1 text-xs font-bold text-teal-700 hover:underline">
                  Go to Profile →
                </Link>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-sm transition-all bg-slate-50/50 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Doctor Roster</h4>
                <p className="text-xs text-slate-500">
                  View and manage doctors affiliated with your healthcare facility.
                </p>
                <span className="inline-block pt-1 text-xs font-bold text-slate-400">
                  Coming Soon
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit / Event Log */}
        <Card className="lg:col-span-5 border-slate-200 shadow-xs bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-700" />
              Recent Facility Audit Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {RECENT_ACTIVITIES.map((act) => (
                <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-teal-600 mt-2 shrink-0"></div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">{act.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthInstituteDashboardPage;
