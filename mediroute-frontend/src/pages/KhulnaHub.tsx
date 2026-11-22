import { useState, useMemo } from 'react';
import {
  MapPin,
  Building2,
  Stethoscope,
  Phone,
  ShieldCheck,
  Activity,
  Droplet,
  Filter,
  Search,
  Wind,
  Flame,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Globe,
} from 'lucide-react';
import { Doctors } from './Doctors';
import { NorthwesternBloodBank } from './NorthwesternBloodBank';
import { initialHospitals } from '../data/mockData';
import { Card, Badge } from '../components/UI';
import type { HospitalCategory, ResourceStatus } from '../types';

// ── Resource Status Badge ──────────────────────────────────────────────────
function ResourceBadge({ status, label }: { status: ResourceStatus | undefined; label: string }) {
  if (!status || status === 'Unknown') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
        <HelpCircle size={11} /> {label}: Unknown
      </span>
    );
  }
  if (status === 'Available') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <CheckCircle2 size={11} /> {label}: Available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
      <XCircle size={11} /> {label}: Unavailable
    </span>
  );
}

const CATEGORY_OPTIONS: (HospitalCategory | 'All')[] = [
  'All',
  'Government',
  'Medical College',
  'Private',
  'Specialized',
];

const RESOURCE_OPTIONS = ['All', 'Available', 'Unknown'] as const;
type ResourceFilter = (typeof RESOURCE_OPTIONS)[number];

export function KhulnaHub() {
  const [activeTab, setActiveTab] = useState<'doctors' | 'hospitals' | 'blood'>('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<HospitalCategory | 'All'>('All');
  const [oxygenFilter, setOxygenFilter] = useState<ResourceFilter>('All');
  const [ventilatorFilter, setVentilatorFilter] = useState<ResourceFilter>('All');
  const [icuFilter, setIcuFilter] = useState<ResourceFilter>('All');
  const [emergencyFilter, setEmergencyFilter] = useState<'All' | 'Open' | 'Closed'>('All');
  const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(false);

  // All hospitals in Khulna area
  const khulnaHospitals = initialHospitals.filter(
    (h) => h.area.toLowerCase().includes('khulna') || h.address?.toLowerCase().includes('khulna')
  );

  // Apply all active filters
  const filteredHospitals = useMemo(() => {
    return khulnaHospitals.filter((h) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!h.name.toLowerCase().includes(q) && !h.area.toLowerCase().includes(q) && !h.address?.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Category filter
      if (categoryFilter !== 'All' && h.category !== categoryFilter) return false;
      // Oxygen filter
      if (oxygenFilter === 'Available' && h.oxygenStatus !== 'Available') return false;
      if (oxygenFilter === 'Unknown' && h.oxygenStatus !== 'Unknown') return false;
      // Ventilator filter
      if (ventilatorFilter === 'Available' && h.ventilatorStatus !== 'Available') return false;
      if (ventilatorFilter === 'Unknown' && h.ventilatorStatus !== 'Unknown') return false;
      // ICU filter
      if (icuFilter === 'Available' && h.icuStatus !== 'Available') return false;
      if (icuFilter === 'Unknown' && h.icuStatus !== 'Unknown') return false;
      // Emergency filter
      if (emergencyFilter === 'Open' && !h.emergencyOpen) return false;
      if (emergencyFilter === 'Closed' && h.emergencyOpen) return false;
      // Unverified filter
      if (showUnverifiedOnly && h.verified) return false;
      return true;
    });
  }, [khulnaHospitals, searchQuery, categoryFilter, oxygenFilter, ventilatorFilter, icuFilter, emergencyFilter, showUnverifiedOnly]);

  // Dynamic stats for dashboard panel
  const stats = useMemo(() => ({
    total: khulnaHospitals.length,
    oxygenConfirmed: khulnaHospitals.filter((h) => h.oxygenStatus === 'Available').length,
    ventilatorConfirmed: khulnaHospitals.filter((h) => h.ventilatorStatus === 'Available').length,
    icuConfirmed: khulnaHospitals.filter((h) => h.icuStatus === 'Available').length,
    edOpen: khulnaHospitals.filter((h) => h.emergencyOpen).length,
    unverified: khulnaHospitals.filter((h) => !h.verified).length,
  }), [khulnaHospitals]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Khulna Hub Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-teal-800/40">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md border border-emerald-400/30">
            <MapPin size={14} className="text-emerald-400 animate-bounce" /> Khulna Division Healthcare Hub
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Khulna Medical, Hospital & Blood Bank Network
          </h1>

          <p className="text-sm text-emerald-100 font-medium leading-relaxed">
            খুলনা বিভাগের সকল বিশেষজ্ঞ চিকিৎসক (431+ Specialists), জরুরি হাসপাতাল নেটওয়ার্ক এবং নর্থ ওয়েস্টার্ন বিশ্ববিদ্যালয় ব্লাড ব্যাংক সমন্বিত ডিরেক্টরি।
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-xs font-semibold text-emerald-200">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Stethoscope size={15} className="text-emerald-300" />
              <span>431 Khulna Doctors</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Building2 size={15} className="text-teal-300" />
              <span>{khulnaHospitals.length} Hospitals Registered</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
              <Droplet size={15} className="text-rose-300" />
              <span>109 NWU Blood Donors</span>
            </div>
          </div>
        </div>

        {/* Decorative Lighting */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Hub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all shrink-0 ${
            activeTab === 'doctors'
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Stethoscope size={18} />
          <span>Khulna Doctors (431)</span>
        </button>

        <button
          onClick={() => setActiveTab('hospitals')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all shrink-0 ${
            activeTab === 'hospitals'
              ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 size={18} />
          <span>Khulna Hospitals ({khulnaHospitals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('blood')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all shrink-0 ${
            activeTab === 'blood'
              ? 'bg-rose-700 text-white shadow-md shadow-rose-700/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Droplet size={18} className="text-rose-500" />
          <span>NWU Blood Bank (109 Donors)</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'doctors' ? (
        <Doctors />
      ) : activeTab === 'blood' ? (
        <NorthwesternBloodBank />
      ) : (
        <div className="space-y-5 animate-fade-in">

          {/* ── Dynamic Stats Dashboard ─────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Hospitals', value: stats.total, color: 'teal', icon: <Building2 size={16} /> },
              { label: 'Oxygen Confirmed', value: stats.oxygenConfirmed, color: 'emerald', icon: <Flame size={16} /> },
              { label: 'Ventilators Confirmed', value: stats.ventilatorConfirmed, color: 'sky', icon: <Wind size={16} /> },
              { label: 'ICU Confirmed', value: stats.icuConfirmed, color: 'indigo', icon: <Activity size={16} /> },
              { label: 'ED Open 24/7', value: stats.edOpen, color: 'green', icon: <CheckCircle2 size={16} /> },
              { label: 'Needs Verification', value: stats.unverified, color: 'amber', icon: <AlertTriangle size={16} /> },
            ].map((s) => (
              <Card key={s.label} className="p-4 text-center space-y-1 hover-lift">
                <div className={`mx-auto w-8 h-8 rounded-xl flex items-center justify-center text-${s.color}-600 bg-${s.color}-50`}>
                  {s.icon}
                </div>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-tight">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* ── Search & Filters ────────────────────────────────────── */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Filter size={16} className="text-teal-700" /> Filters & Search
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by hospital name or location…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-500"
              />
            </div>

            {/* Filter grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {/* Category */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as HospitalCategory | 'All')}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Oxygen */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Oxygen</label>
                <select
                  value={oxygenFilter}
                  onChange={(e) => setOxygenFilter(e.target.value as ResourceFilter)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {RESOURCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Ventilators */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Ventilator</label>
                <select
                  value={ventilatorFilter}
                  onChange={(e) => setVentilatorFilter(e.target.value as ResourceFilter)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {RESOURCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* ICU */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider">ICU</label>
                <select
                  value={icuFilter}
                  onChange={(e) => setIcuFilter(e.target.value as ResourceFilter)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {RESOURCE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Emergency */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Emergency Dept</label>
                <select
                  value={emergencyFilter}
                  onChange={(e) => setEmergencyFilter(e.target.value as 'All' | 'Open' | 'Closed')}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option>All</option>
                  <option>Open</option>
                  <option>Closed</option>
                </select>
              </div>

              {/* Verification */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-500 uppercase tracking-wider">Verification</label>
                <button
                  onClick={() => setShowUnverifiedOnly(!showUnverifiedOnly)}
                  className={`w-full rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all ${
                    showUnverifiedOnly
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {showUnverifiedOnly ? '⚠ Unverified Only' : 'All Hospitals'}
                </button>
              </div>
            </div>

            {/* Active filter summary */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Showing <strong className="text-slate-900">{filteredHospitals.length}</strong> of {khulnaHospitals.length} hospitals
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                  setOxygenFilter('All');
                  setVentilatorFilter('All');
                  setIcuFilter('All');
                  setEmergencyFilter('All');
                  setShowUnverifiedOnly(false);
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </Card>

          {/* ── Hospital Cards Grid ─────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Registered Hospitals in Khulna Division</h2>
            <span className="text-xs text-slate-500">ICU Bed & Resource Status</span>
          </div>

          {filteredHospitals.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Building2 size={22} />
              </div>
              <h3 className="font-bold text-slate-900">No hospitals match your filters</h3>
              <p className="text-xs text-slate-500">Try adjusting the filters above to see more results.</p>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {filteredHospitals.map((h) => (
                <Card key={h.id} className="p-5 hover-lift space-y-3.5 border-slate-200">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base text-slate-900 leading-tight">{h.name}</h3>
                        {h.verified ? (
                          <Badge tone="teal">
                            <ShieldCheck size={13} /> Verified
                          </Badge>
                        ) : (
                          <Badge tone="warn">
                            <AlertTriangle size={13} /> Needs Verification
                          </Badge>
                        )}
                      </div>
                      {h.category && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {h.category}
                        </span>
                      )}
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <MapPin size={13} className="text-rose-500 shrink-0" /> {h.address || h.area}
                      </p>
                    </div>

                    <Badge tone={h.emergencyOpen ? 'good' : 'bad'}>
                      {h.emergencyOpen ? 'ED Open' : 'ED Closed'}
                    </Badge>
                  </div>

                  {/* Resource Status Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <ResourceBadge status={h.oxygenStatus} label="O₂" />
                    <ResourceBadge status={h.ventilatorStatus} label="Ventilator" />
                    <ResourceBadge status={h.icuStatus} label="ICU" />
                  </div>

                  {/* Oxygen Systems */}
                  {h.oxygenSystems && h.oxygenSystems.length > 0 && (
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">O₂ Systems: </span>
                      {h.oxygenSystems.join(' · ')}
                    </div>
                  )}

                  {/* Capacity Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium block">ICU Beds</span>
                      <strong className="text-slate-900 font-bold">{h.icu.available} / {h.icu.capacity} free</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Ventilators</span>
                      <strong className="text-slate-900 font-bold">
                        {h.ventilatorCount != null ? `${h.ventilatorCount} total` : `${h.ventilator.available} ready`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block">Oxygen</span>
                      <strong
                        className={
                          h.oxygen === 'Available'
                            ? 'text-emerald-700'
                            : h.oxygen === 'Limited'
                            ? 'text-amber-700'
                            : 'text-rose-600'
                        }
                      >
                        {h.oxygen}
                      </strong>
                    </div>
                  </div>

                  {/* Footer: contact + links */}
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        Admin: <strong className="text-slate-800">{h.admin}</strong>
                      </span>
                      <span className="text-slate-400">Last updated: {h.lastUpdated}</span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {h.phone && h.phone !== 'Unknown' ? (
                        <a
                          href={`tel:${h.phone}`}
                          className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline"
                        >
                          <Phone size={13} /> {h.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Phone not available</span>
                      )}
                      {h.emergencyPhone && (
                        <a
                          href={`tel:${h.emergencyPhone}`}
                          className="inline-flex items-center gap-1 font-bold text-rose-600 hover:underline"
                        >
                          🆘 {h.emergencyPhone}
                        </a>
                      )}
                      {h.website && (
                        <a
                          href={h.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline ml-auto"
                        >
                          <Globe size={13} /> Website <ExternalLink size={11} />
                        </a>
                      )}
                    </div>

                    {/* Verification note */}
                    {!h.verified && h.verificationNote && (
                      <div className="mt-1 flex items-start gap-1.5 text-[10px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
                        <AlertTriangle size={11} className="shrink-0 mt-0.5 text-amber-600" />
                        <span>{h.verificationNote}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* DGHS Registry Reference */}
          <Card className="p-4 border-blue-200 bg-blue-50/60">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 shrink-0 mt-0.5"><Globe size={18} /></div>
              <div className="text-xs text-blue-900 space-y-1">
                <p className="font-bold">Official Verification Sources</p>
                <p>
                  Hospitals marked "Needs Verification" require confirmation from:{' '}
                  <a
                    href="https://hris.mohfw.gov.bd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold"
                  >
                    Bangladesh DGHS HRIS Facility Registry
                  </a>{' '}
                  or direct hospital contact. Resource statuses labeled "Unknown" should never be used for clinical decisions.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
