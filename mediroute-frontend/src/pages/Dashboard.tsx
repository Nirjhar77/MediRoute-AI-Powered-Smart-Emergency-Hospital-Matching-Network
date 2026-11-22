import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  HeartPulse,
  Wind,
  ShieldAlert,
  ShieldCheck,
  Building,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Radio,
  ChevronRight,
  Stethoscope,
  Scissors,
  Flame,
  Droplet,
  Compass,
  Lock,
  Play,
} from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { emergencyTypePresets } from '../data/mockData';
import type { EmergencyRequest, EmergencyType, Hospital } from '../types';
import { GeminiAssistantModal } from '../components/GeminiAssistantModal';
import { LiveGPSWidget } from '../components/LiveGPSWidget';

export function Dashboard({
  hospitals,
  request,
  setRequest,
}: {
  hospitals: Hospital[];
  request: EmergencyRequest;
  setRequest: (r: EmergencyRequest) => void;
}) {
  const nav = useNavigate();
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Live aggregate metrics
  const totalIcuAvailable = hospitals.reduce((acc, h) => acc + h.icu.available, 0);
  const totalIcuCapacity = hospitals.reduce((acc, h) => acc + h.icu.capacity, 0);
  const totalVentAvailable = hospitals.reduce((acc, h) => acc + h.ventilator.available, 0);
  const totalVentCapacity = hospitals.reduce((acc, h) => acc + h.ventilator.capacity, 0);
  const activeEdsCount = hospitals.filter((h) => h.emergencyOpen).length;
  const verifiedCount = hospitals.filter((h) => h.verified).length;
  const verifiedPct = hospitals.length > 0 ? Math.round((verifiedCount / hospitals.length) * 100) : 0;

  const handleQuickLaunch = (type: EmergencyType) => {
    const preset = emergencyTypePresets[type];
    if (preset) {
      setRequest({
        ...request,
        type,
        requirements: preset.recommended,
        targetBloodGroup: type === 'Cardiac' || type === 'Trauma' ? 'O-' : undefined,
      });
      nav('/caregiver/discover');
    }
  };

  return (
    <>
      {isAiOpen && (
        <GeminiAssistantModal
          onClose={() => setIsAiOpen(false)}
          onApplyPreset={(newType, newCaps) => {
            setRequest({ ...request, type: newType, requirements: newCaps });
            nav('/caregiver/discover');
          }}
        />
      )}

      <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
        {/* Executive Command Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-10 text-white shadow-2xl border border-teal-500/20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse"
            style={{ animationDuration: '6s' }}
          />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/15 text-teal-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>KHULNA EMERGENCY NETWORK · OPERATIONAL SIGNAL ACTIVE</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Emergency Triage & <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">Decision Workspace</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                Intelligent capability-driven emergency hospital matching. ACLS & ATLS clinical protocol verification for Khulna medical district.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => nav('/caregiver/emergency')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-rose-600/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-rose-400/30 uppercase tracking-wider"
                >
                  <Play size={18} className="fill-white animate-pulse" />
                  <span>Run Emergency Search</span>
                </button>

                <button
                  onClick={() => setIsAiOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-md border border-white/15 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles size={18} className="text-teal-300 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Consult MediRoute AI</span>
                </button>
              </div>
            </div>

            {/* System Status Telemetry Card */}
            <div className="rounded-2xl bg-slate-900/90 p-5 backdrop-blur-xl border border-white/10 space-y-3 min-w-[280px]">
              <div className="flex items-center justify-between text-xs font-extrabold text-teal-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Radio size={14} className="text-emerald-400 animate-pulse" /> Network Signals
                </span>
                <span className="text-emerald-400 font-mono">ONLINE</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-400 font-semibold">Hospital Network</span>
                  <span className="font-bold text-white">{hospitals.length} Connected</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-400 font-semibold">Triage Protocols</span>
                  <span className="font-bold text-emerald-300">ACLS / ATLS Verified</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-slate-400 font-semibold">Hospital Verification</span>
                  <span className="font-bold text-teal-300">100% Accredited</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time GPS Telemetry & Status */}
        <LiveGPSWidget hospitals={hospitals} />

        {/* Live Operational Metrics Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5 border-slate-200/80 shadow-xs relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">ICU Capacity Signal</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">
                  {totalIcuAvailable} <span className="text-sm font-semibold text-slate-400">/ {totalIcuCapacity} Beds</span>
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-700 group-hover:scale-110 transition-transform">
                <Activity size={22} className="animate-pulse" />
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(totalIcuAvailable / totalIcuCapacity) * 100}%` }}
              />
            </div>
          </Card>

          <Card className="p-5 border-slate-200/80 shadow-xs relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Ventilators Ready</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">
                  {totalVentAvailable} <span className="text-sm font-semibold text-slate-400">/ {totalVentCapacity} Units</span>
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                <Wind size={22} />
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(totalVentAvailable / totalVentCapacity) * 100}%` }}
              />
            </div>
          </Card>

          <Card className="p-5 border-slate-200/80 shadow-xs relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Emergency Depts</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">
                  {activeEdsCount} <span className="text-sm font-semibold text-emerald-600">Open 24/7</span>
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <Building size={22} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 font-medium">Accepting critical triage cases</p>
          </Card>

          <Card className="p-5 border-slate-200/80 shadow-xs relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Hospital Verification</p>
                <h3 className="text-3xl font-black text-slate-900 mt-1">
                  {verifiedPct}% <span className="text-sm font-semibold text-teal-600">Verified</span>
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <ShieldCheck size={22} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 font-medium">{verifiedCount} of {hospitals.length} facilities verified</p>
          </Card>
        </div>

        {/* Primary Emergency Triage Workstation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Zap size={20} className="text-amber-500" /> Clinical Emergency Triage Launchpad
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Select an emergency type below to auto-select clinical requirements and execute capability routing.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => nav('/caregiver/emergency')}
              className="text-xs py-2 px-3.5"
              icon={<ArrowRight size={14} />}
            >
              Custom Capability Selection
            </Button>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => handleQuickLaunch('Cardiac')}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-300"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
                  <HeartPulse size={26} className="animate-pulse" />
                </div>
                <span className="text-[10px] font-extrabold text-red-800 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 uppercase">
                  ACLS Protocol
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-red-700 transition-colors">
                Cardiac Emergency
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                Chest pain, severe arrhythmia, suspected infarction. Auto-selects Cath Lab, ICU, Ventilator, Cardiology.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-400">6 Required Capabilities</span>
                <span className="text-xs font-extrabold text-red-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Execute Triage <ChevronRight size={14} />
                </span>
              </div>
            </button>

            <button
              onClick={() => handleQuickLaunch('Trauma')}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-rose-300"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                  <ShieldAlert size={26} />
                </div>
                <span className="text-[10px] font-extrabold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 uppercase">
                  ATLS Protocol
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors">
                Severe Trauma
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                Accidents, severe hemorrhage, major fractures. Auto-selects Surgical Suite, Blood Reserves, ICU.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-400">6 Required Capabilities</span>
                <span className="text-xs font-extrabold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Execute Triage <ChevronRight size={14} />
                </span>
              </div>
            </button>

            <button
              onClick={() => handleQuickLaunch('Respiratory')}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-300"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                  <Wind size={26} />
                </div>
                <span className="text-[10px] font-extrabold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 uppercase">
                  WHO SARI Protocol
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                Respiratory Crisis
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                Acute shortness of breath, low SpO2, severe asthma. Auto-selects Ventilator, High-Flow O2, ICU.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-400">4 Required Capabilities</span>
                <span className="text-xs font-extrabold text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Execute Triage <ChevronRight size={14} />
                </span>
              </div>
            </button>

            <button
              onClick={() => handleQuickLaunch('General Emergency')}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-teal-300"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-teal-50 text-teal-700 group-hover:scale-110 transition-transform">
                  <Activity size={26} />
                </div>
                <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 uppercase">
                  Standard Triage
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                General Emergency
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-medium leading-relaxed">
                High fever, severe pain, disorientation. Auto-selects 24/7 Emergency Department triage.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-bold text-slate-400">1 Required Capability</span>
                <span className="text-xs font-extrabold text-teal-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Execute Triage <ChevronRight size={14} />
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Clinical Decision Principles & System Architecture Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Transparent Matching Rules Card */}
          <Card className="p-6 space-y-4 border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Explainable Capability Matching Rules</h3>
                <p className="text-xs text-slate-500 font-medium">Transparent ranking policy for emergency triage</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-700 text-white font-bold text-[11px] shrink-0">
                  1
                </span>
                <div>
                  <strong className="font-extrabold text-slate-900 block">Strict Capability Eligibility First</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Hospitals missing even a single selected capability (e.g. ICU or Cath Lab) are immediately filtered out.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-700 text-white font-bold text-[11px] shrink-0">
                  2
                </span>
                <div>
                  <strong className="font-extrabold text-slate-900 block">Proximity & Travel Time Evaluation</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Among strictly eligible hospitals, distance and travel time determine optimal routing order.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-700 text-white font-bold text-[11px] shrink-0">
                  3
                </span>
                <div>
                  <strong className="font-extrabold text-slate-900 block">Verified Telemetry & Accreditation Weighting</strong>
                  <p className="text-slate-600 leading-relaxed">
                    Hospital resource levels are directly verified and reported by authorized hospital administrators.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Hub Directory & Dedicated Sub-System Shortcuts */}
          <Card className="p-6 space-y-4 border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
                <Stethoscope size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Regional Khulna Healthcare Resources</h3>
                <p className="text-xs text-slate-500 font-medium">Dedicated sub-systems & directories</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => nav('/khulna-hub')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/40 border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700 group-hover:scale-105 transition-transform">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                      Khulna Healthcare Hub ({hospitals.length} Hospitals · 431 Doctors)
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Specialist doctor directory & hospital administrator directory for Khulna
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => nav('/blood-bank')}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-rose-50/40 border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 group-hover:scale-105 transition-transform">
                    <Droplet size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-rose-700 transition-colors">
                      NWU Blood Bank Directory (109 Donors)
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      North Western University emergency student blood donor roster
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
