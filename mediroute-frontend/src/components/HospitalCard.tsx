import { ChevronRight, MapPin, ShieldCheck, Activity, Wind, Flame, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import type { EmergencyRequest, Hospital } from '../types';
import { Badge, Card, Freshness, Status } from './UI';
import { getMatchStatus, score, getRecommendationRationale } from '../services/matching';

export function HospitalCard({
  h,
  request,
  onDetails,
  isCompared = false,
  onCompareToggle,
}: {
  h: Hospital;
  request: EmergencyRequest;
  onDetails: () => void;
  isCompared?: boolean;
  onCompareToggle?: (h: Hospital) => void;
}) {
  const matchStatus = getMatchStatus(h, request);
  const matchScore = h.matchScore || score(h, request);
  const rationale = getRecommendationRationale(h, request);

  const statusBadge =
    matchStatus === 'full' ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-2xs">
        <CheckCircle2 size={13} className="text-emerald-600" /> Full Match ({matchScore}%)
      </span>
    ) : matchStatus === 'partial' ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200 shadow-2xs">
        <Activity size={13} className="text-amber-600" /> Partial Match ({matchScore}%)
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200 shadow-2xs">
        <AlertCircle size={13} className="text-rose-600" /> Unsuitable ({matchScore}%)
      </span>
    );

  return (
    <Card
      className={`hover-lift overflow-hidden transition-all duration-300 border-slate-200/90 ${
        matchStatus === 'full'
          ? 'bg-white shadow-xs hover:border-teal-500/40 ring-1 ring-emerald-500/10'
          : matchStatus === 'partial'
          ? 'bg-white/90 hover:border-amber-500/40'
          : 'bg-slate-50/60 opacity-85 hover:opacity-100'
      }`}
    >
      <div className="p-5 space-y-3.5">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-950 text-base group-hover:text-teal-700 transition-colors">
                {h.name}
              </h3>
              {h.verified && (
                <Badge tone="teal">
                  <ShieldCheck size={13} className="text-teal-600" /> Verified
                </Badge>
              )}
            </div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <MapPin size={14} className="text-rose-500 shrink-0" />
              <span>{h.area}</span> ·{' '}
              <strong className="text-slate-800 font-bold">{h.distance.toFixed(1)} km</strong> ·{' '}
              <span className="text-teal-700 font-bold flex items-center gap-1">
                <Clock size={12} /> {h.travelTime} min drive
              </span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            {statusBadge}
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl bg-slate-50/90 p-3 border border-slate-100/90 text-xs">
          <Status ok={h.icu.available > 0} label={`ICU · ${h.icu.available} free`} icon={<Activity size={13} />} />
          <Status ok={h.ventilator.available > 0} label={`Ventilator · ${h.ventilator.available} free`} icon={<Wind size={13} />} />
          <Status ok={h.oxygen === 'Available'} label={`Oxygen · ${h.oxygen}`} icon={<Flame size={13} />} />
          <Status ok={h.emergencyOpen} label={h.emergencyOpen ? 'ED Open 24/7' : 'ED Closed'} icon={<ShieldCheck size={13} />} />
        </div>

        {/* Why Recommended Explanation */}
        <div className="rounded-xl bg-slate-100/70 p-2.5 text-xs text-slate-600 border border-slate-200/50 leading-relaxed">
          <strong className="font-bold text-slate-800">Match Rationale:</strong> {rationale}
        </div>

        {/* Footer info & Compare Checkbox */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <Freshness text={h.lastUpdated} />

          {onCompareToggle && (
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer select-none hover:text-teal-700">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => onCompareToggle(h)}
                className="rounded border-slate-300 text-teal-700 focus:ring-teal-500 h-3.5 w-3.5"
              />
              <span>Compare</span>
            </label>
          )}
        </div>
      </div>

      {/* Button Action */}
      <div className="flex border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onDetails}
          className="flex flex-1 items-center justify-between px-5 py-3 text-xs font-bold text-teal-700 hover:bg-teal-700 hover:text-white transition-all duration-200"
        >
          <span>Inspect Capabilities & Contact</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </Card>
  );
}
