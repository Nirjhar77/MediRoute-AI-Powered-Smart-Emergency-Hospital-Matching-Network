import { X, Phone, Navigation, ShieldCheck, MapPin, Clock3, Activity, Wind, Flame, Heart, Brain, Award, ExternalLink, CheckCircle2, XCircle, Globe, AlertTriangle } from 'lucide-react';
import type { Hospital, EmergencyRequest } from '../types';
import { getMatchStatus, score, reasons } from '../services/matching';
import { Badge, Button } from './UI';

export function HospitalDrawer({
  hospital,
  request,
  onClose,
  onCompareToggle,
  isCompared,
}: {
  hospital: Hospital | null;
  request: EmergencyRequest;
  onClose: () => void;
  onCompareToggle: (h: Hospital) => void;
  isCompared: boolean;
}) {
  if (!hospital) return null;

  const matchStatus = getMatchStatus(hospital, request);
  const matchScore = hospital.matchScore || score(hospital, request);
  const evaluations = reasons(hospital, request);

  const statusBadge =
    matchStatus === 'full' ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
        <CheckCircle2 size={14} className="text-emerald-600" /> Full Match ({matchScore}%)
      </span>
    ) : matchStatus === 'partial' ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
        <Activity size={14} className="text-amber-600" /> Partial Match ({matchScore}%)
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
        <XCircle size={14} className="text-rose-600" /> Ineligible ({matchScore}%)
      </span>
    );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className="relative w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-slate-200 bg-slate-50/80 p-6 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                {statusBadge}
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{hospital.name}</h2>
                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <MapPin size={14} className="text-rose-500 shrink-0" />
                  <span>{hospital.address || hospital.area}</span> ·{' '}
                  <strong className="text-slate-800">{hospital.distance.toFixed(1)} km ({hospital.travelTime} mins)</strong>
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <a
                href={`tel:${hospital.phone}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 py-2.5 px-3 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
              >
                <Phone size={15} /> Call Hospital
              </a>

              <a
                href={`https://maps.google.com/?q=${hospital.lat},${hospital.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 px-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <Navigation size={15} /> Navigate
              </a>

              <Button
                variant={isCompared ? 'primary' : 'secondary'}
                onClick={() => onCompareToggle(hospital)}
                className="text-xs py-2.5"
              >
                {isCompared ? '✓ Compared' : '+ Compare'}
              </Button>
            </div>
          </div>

          {/* Drawer Body Details */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Capability Evaluation breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Requested Capabilities Evaluation
              </h3>
              <div className="grid gap-2">
                {evaluations.map((ev) => (
                  <div
                    key={ev.label}
                    className={`flex items-center justify-between rounded-xl p-3 text-xs font-semibold border ${
                      ev.ok
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/60 border-rose-200 text-rose-950'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {ev.ok ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle size={16} className="text-rose-600 shrink-0" />
                      )}
                      <span>{ev.label}</span>
                    </span>
                    <span>{ev.ok ? 'Available & Verified' : 'Currently Unavailable'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehensive Capabilities Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Facility Resource Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Activity size={15} className="text-teal-700" /> ICU Capacity
                  </div>
                  <p className="text-lg font-black text-slate-900">
                    {hospital.icu.available} <span className="text-xs font-medium text-slate-500">/ {hospital.icu.capacity} beds free</span>
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Wind size={15} className="text-teal-700" /> Ventilators
                  </div>
                  <p className="text-lg font-black text-slate-900">
                    {hospital.ventilator.available} <span className="text-xs font-medium text-slate-500">/ {hospital.ventilator.capacity} ready</span>
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Flame size={15} className="text-teal-700" /> Oxygen Reserves
                  </div>
                  <p className={`text-sm font-bold ${hospital.oxygen === 'Available' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {hospital.oxygen}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Award size={15} className="text-teal-700" /> Surgical Suites
                  </div>
                  <p className={`text-sm font-bold ${hospital.surgery ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {hospital.surgery ? 'Active Operating Rooms' : 'Unavailable'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Heart size={15} className="text-teal-700" /> Cardiology Unit
                  </div>
                  <p className={`text-sm font-bold ${hospital.cardiology ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {hospital.cardiology ? 'Cath Lab On-Standby' : 'No Specialist Unit'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Brain size={15} className="text-teal-700" /> Neuro-Trauma
                  </div>
                  <p className={`text-sm font-bold ${hospital.neurology ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {hospital.neurology ? 'CT & Neuro Specialist' : 'No Neuro Service'}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Metadata */}
            <div className="rounded-2xl bg-slate-100 p-4 space-y-2 text-xs text-slate-600 border border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Hospital Administrator:</span>
                <span>{hospital.admin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Main Phone:</span>
                {hospital.phone && hospital.phone !== 'Unknown' ? (
                  <a href={`tel:${hospital.phone}`} className="font-bold text-teal-700 hover:underline">
                    {hospital.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">Unknown</span>
                )}
              </div>
              {hospital.emergencyPhone && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">🆘 Emergency Phone:</span>
                  <a href={`tel:${hospital.emergencyPhone}`} className="font-bold text-rose-600 hover:underline">
                    {hospital.emergencyPhone}
                  </a>
                </div>
              )}
              {hospital.website && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Globe size={13} className="text-indigo-600" /> Website:
                  </span>
                  <a
                    href={hospital.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink size={11} />
                  </a>
                </div>
              )}
              {hospital.oxygenSystems && hospital.oxygenSystems.length > 0 && (
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-800 shrink-0">O₂ Systems:</span>
                  <span className="text-right">{hospital.oxygenSystems.join(', ')}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Clock3 size={13} className="text-teal-700" /> Last Verified:
                </span>
                <span className="font-bold text-emerald-700">{hospital.lastUpdated}</span>
              </div>
              {!hospital.verified && hospital.verificationNote && (
                <div className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
                  <AlertTriangle size={11} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>{hospital.verificationNote}</span>
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Close Hospital Detail Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
