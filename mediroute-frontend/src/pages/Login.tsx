import { useState, type FormEvent } from 'react';
import {
  Activity,
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Hospital as HospitalIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Radio,
  Stethoscope,
  Building2,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../types';
import { Button, Card } from '../components/UI';

interface RoleOption {
  id: Role;
  title: string;
  badge: string;
  description: string;
  icon: typeof HeartPulse;
  placeholderEmail: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'caregiver',
    title: 'Emergency Seeker',
    badge: 'Patient & Family',
    description: 'Find matching emergency capacity & specialized care in real time.',
    icon: HeartPulse,
    placeholderEmail: 'emergency.seeker@mediroute.org',
  },
  {
    id: 'hospital_admin',
    title: 'Hospital Admin',
    badge: 'Facility Ops',
    description: 'Manage live ICU, CCU, oxygen, bed availability & resources.',
    icon: HospitalIcon,
    placeholderEmail: 'admin@hospital.gov.bd',
  },
  {
    id: 'system_admin',
    title: 'System Admin',
    badge: 'Network Ops',
    description: 'Monitor DGHS hospital telemetry, status & inter-hub routing.',
    icon: ShieldCheck,
    placeholderEmail: 'sysadmin@dghs.gov.bd',
  },
];

export function Login({ login }: { login: (r: Role) => void }) {
  const nav = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>('caregiver');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const activeRoleOption = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(selectedRole);
      nav(
        selectedRole === 'caregiver'
          ? '/caregiver'
          : selectedRole === 'hospital_admin'
          ? '/hospital-admin'
          : '/system-admin'
      );
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-teal-600 selection:text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Side: Professional Healthcare Network Showcase */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-12 text-white lg:flex">
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40 backdrop-blur-md">
                  <Activity size={22} className="animate-pulse" />
                </span>
                <div>
                  <span className="text-xl font-bold tracking-tight text-white">
                    Medi<span className="text-teal-400">Route</span>
                  </span>
                  <span className="ml-2 rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-300 ring-1 ring-teal-500/30">
                    Health Network
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-950/60 px-3 py-1 text-xs text-teal-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>DGHS Integrated Network</span>
              </div>
            </div>

            {/* Main Value Proposition */}
            <div className="mt-14 max-w-lg">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
                Capability-Aware Emergency Hospital Coordination.
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                Centralized decision-support system routing critical patients to verified hospital capacity — matching ICU, surgical, ventilator, and specialty capabilities in real time.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-10 grid gap-4 max-w-lg">
              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-500/20 text-teal-300">
                  <Radio size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-Time Resource Telemetry</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Continuous tracking of available ICU beds, CCU facilities, ventilators, and central oxygen reserves across regional facilities.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-500/20 text-teal-300">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Precision Clinical Matching</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Algorithms match patient emergency requirements directly with verified hospital capabilities to minimize transfer delays.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-500/20 text-teal-300">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Inter-Facility Coordination Hub</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Seamless protocol synchronization between hospital administrators, regional blood banks, and ambulance dispatches.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security & Metrics Bar */}
          <div className="relative z-10 pt-8 border-t border-white/10">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold text-white">18+</p>
                <p className="text-xs text-slate-400">Connected Facilities</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-400">100%</p>
                <p className="text-xs text-slate-400">DGHS Registered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">24/7</p>
                <p className="text-xs text-slate-400">Real-Time Sync</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Shield size={13} className="text-teal-400 shrink-0" />
              <span>National Healthcare Emergency Resource System • Encrypted Transmission</span>
            </p>
          </div>
        </section>

        {/* Right Side: Professional Sign In Portal */}
        <section className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Header Branding */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-700/20">
                  <Activity size={20} />
                </span>
                <div>
                  <b className="text-xl tracking-tight text-slate-900">
                    Medi<span className="text-teal-700">Route</span>
                  </b>
                  <p className="text-[11px] font-medium text-slate-500">Healthcare Portal</p>
                </div>
              </div>
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
                Official Access
              </span>
            </div>

            {/* Portal Heading */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Portal Authentication
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Select your access portal and sign in with authorized credentials.
              </p>
            </div>

            {/* Role / Portal Segmented Tabs */}
            <div className="mb-6">
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Access Role
              </label>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1.5 border border-slate-200/80">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg py-2.5 px-2 text-center transition-all ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
                      }`}
                    >
                      <Icon size={17} className={isSelected ? 'text-white' : 'text-slate-500'} />
                      <span className="text-xs leading-none">{r.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Role Description */}
              <div className="mt-3 flex items-center justify-between rounded-lg bg-teal-50/70 border border-teal-200/60 px-3 py-2 text-xs text-teal-900">
                <span className="font-medium text-teal-950">{activeRoleOption.description}</span>
                <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 shrink-0 ml-2">
                  {activeRoleOption.badge}
                </span>
              </div>
            </div>

            {/* Sign-In Card */}
            <Card className="p-6 sm:p-7 border border-slate-200/80 shadow-lg shadow-slate-200/50">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email / ID Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address / Healthcare ID
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeRoleOption.placeholderEmail}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                    <a
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Please contact your facility system administrator or IT helpdesk to reset your password.');
                      }}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-xs font-medium text-slate-600">
                      Remember this terminal
                    </span>
                  </label>
                  <span className="text-xs text-slate-400">TLS 1.3 Encrypted</span>
                </div>

                {/* Submit Action Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  icon={!isLoading ? <ArrowRight size={17} /> : undefined}
                  className="mt-2 w-full justify-center py-2.5 text-sm font-bold shadow-md shadow-teal-700/20 active:scale-98 transition"
                >
                  {isLoading ? 'Authenticating...' : `Sign In as ${activeRoleOption.title}`}
                </Button>
              </form>

              {/* Security & Access Notice */}
              <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <CheckCircle2 size={13} className="text-teal-600 shrink-0" />
                  <span>Authorized medical & emergency personnel access only</span>
                </p>
              </div>
            </Card>

            {/* Support Information */}
            <div className="mt-6 text-center text-xs text-slate-500">
              <p>
                Healthcare Emergency Helpline:{' '}
                <a href="tel:16263" className="font-semibold text-teal-700 hover:underline">
                  16263
                </a>{' '}
                · DGHS Technical Support:{' '}
                <a href="mailto:support@mediroute.gov.bd" className="font-semibold text-teal-700 hover:underline">
                  support@mediroute.gov.bd
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
