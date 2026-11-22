import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogOut, Menu, ShieldCheck, Stethoscope, LayoutDashboard, Siren, Building, ShieldAlert, MapPin, Sparkles, Droplet, Smartphone, Navigation } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { Role } from '../types';
import { GeminiAssistantModal } from './GeminiAssistantModal';
import { PhoneLoginModal } from './PhoneLoginModal';

export function AppShell({ children, role, onLogout }: { children: ReactNode; role: Role; onLogout: () => void }) {
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);

  const getIcon = (label: string) => {
    if (label.includes('Blood Bank')) return <Droplet size={16} className="text-rose-500 animate-pulse" />;
    if (label.includes('Khulna Hub')) return <MapPin size={16} className="text-emerald-500 animate-bounce" />;
    if (label.includes('Doctors')) return <Stethoscope size={16} className="text-teal-600" />;
    if (label.includes('Emergency')) return <Siren size={16} className="text-rose-500 animate-pulse" />;
    if (label.includes('Hospital')) return <Building size={16} className="text-teal-600" />;
    if (label.includes('System')) return <ShieldAlert size={16} className="text-indigo-600" />;
    return <LayoutDashboard size={16} className="text-teal-600" />;
  };

  const links =
    role === 'caregiver'
      ? [
          ['/caregiver', 'Dashboard'],
          ['/caregiver/emergency', 'Emergency search'],
          ['/blood-bank', 'Blood Bank'],
          ['/khulna-hub', 'Khulna Hub'],
        ]
      : role === 'hospital_admin'
      ? [
          ['/hospital-admin', 'Hospital overview'],
          ['/blood-bank', 'Blood Bank'],
          ['/khulna-hub', 'Khulna Hub'],
        ]
      : [
          ['/system-admin', 'System overview'],
          ['/blood-bank', 'Blood Bank'],
          ['/khulna-hub', 'Khulna Hub'],
        ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {isAiOpen && <GeminiAssistantModal onClose={() => setIsAiOpen(false)} />}
      {isPhoneOpen && <PhoneLoginModal onClose={() => setIsPhoneOpen(false)} />}

      <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to={role === 'caregiver' ? '/caregiver' : role === 'hospital_admin' ? '/hospital-admin' : '/system-admin'}
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-teal-800 to-teal-600 text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
              <Activity size={20} className="animate-pulse" />
            </span>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Medi<span className="text-teal-700">Route</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/caregiver/location"
              className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200"
              title="Live GPS"
            >
              <Navigation size={18} />
            </Link>
            <button
              onClick={() => setIsPhoneOpen(true)}
              className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200"
              title="Phone Link (QR)"
            >
              <Smartphone size={18} />
            </button>
            <button
              onClick={() => setIsAiOpen(true)}
              className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200"
              title="MediRoute AI"
            >
              <Sparkles size={18} />
            </button>
            <button
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setOpen(!open)}
            >
              <Menu size={22} />
            </button>
          </div>

          <nav className="hidden items-center gap-1.5 md:flex">
            {links.map(([to, label]) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20'
                      : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
                  }`}
                  key={to}
                  to={to}
                >
                  <span className={isActive ? 'text-white' : ''}>{getIcon(label)}</span>
                  <span>{label}</span>
                </Link>
              );
            })}

            <Link
              to="/caregiver/location"
              className="ml-1 inline-flex items-center gap-1.5 rounded-xl border border-sky-300/80 bg-sky-50/80 px-3 py-2 text-xs font-bold text-sky-900 shadow-2xs hover:bg-sky-100 transition active:scale-95"
              title="Real-Time GPS Telemetry & Coordinates"
            >
              <Navigation size={13} className="text-sky-600 animate-pulse" />
              <span>Live GPS</span>
            </Link>

            <button
              onClick={() => setIsPhoneOpen(true)}
              className="ml-1 inline-flex items-center gap-1.5 rounded-xl border border-teal-200/80 bg-teal-50/70 px-3 py-2 text-xs font-bold text-teal-800 shadow-2xs hover:bg-teal-100 transition active:scale-95"
              title="Open Phone Link & QR Code"
            >
              <Smartphone size={14} className="text-teal-700" />
              <span>Phone Link</span>
            </button>

            <button
              onClick={() => setIsAiOpen(true)}
              className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:shadow-md transition-all active:scale-95 border border-teal-600/30"
            >
              <Sparkles size={14} className="text-teal-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>MediRoute AI</span>
            </button>

            <div className="ml-2 h-5 w-px bg-slate-200" />

            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600 border border-slate-200/80">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-ping" />
              {role === 'caregiver' ? 'Emergency Seeker' : role.replace('_', ' ')}
            </span>

            <button
              onClick={() => {
                onLogout();
                nav('/login');
              }}
              className="ml-1 rounded-xl p-2.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </nav>
        </div>

        {open && (
          <nav className="border-t border-slate-100 px-4 py-3 md:hidden space-y-1 bg-white/95 backdrop-blur-md animate-slide-up">
            {links.map(([to, label]) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    isActive ? 'bg-teal-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  key={to}
                  to={to}
                >
                  {getIcon(label)}
                  <span>{label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                setOpen(false);
                setIsAiOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-teal-800 bg-teal-50 border border-teal-200"
            >
              <Sparkles size={18} className="text-teal-700" /> Consult MediRoute Clinical AI
            </button>
            <button
              onClick={() => {
                onLogout();
                nav('/login');
              }}
              className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={18} /> Log out
            </button>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export const DemoPill = () => (
  <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 shadow-2xs">
    <ShieldCheck size={14} className="text-teal-600" /> DEMO NETWORK
  </div>
);
