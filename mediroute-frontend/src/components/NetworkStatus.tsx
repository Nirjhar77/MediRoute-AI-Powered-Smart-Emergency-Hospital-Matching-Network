import { Activity, ShieldCheck, RefreshCw, Radio } from 'lucide-react';
import type { Hospital } from '../types';

export function NetworkStatus({ hospitals }: { hospitals: Hospital[] }) {
  const totalHospitals = hospitals.length;
  const activeEDs = hospitals.filter((h) => h.emergencyOpen).length;
  const availableICU = hospitals.reduce((sum, h) => sum + h.icu.available, 0);
  const totalICU = hospitals.reduce((sum, h) => sum + h.icu.capacity, 0);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Hospital Coordination Network
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <Radio size={10} className="animate-pulse" /> LIVE SYNC
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Real-time resource synchronization active across Regional Health Zone
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-700 border-t border-slate-100 sm:border-t-0 sm:pt-0 pt-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
            <Activity size={14} className="text-teal-700" />
            <span>
              <strong className="text-slate-900">{activeEDs}/{totalHospitals}</strong> EDs Open
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
            <ShieldCheck size={14} className="text-teal-700" />
            <span>
              <strong className="text-slate-900">{availableICU}/{totalICU}</strong> ICU Beds Free
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-normal">
            <RefreshCw size={12} className="animate-spin text-slate-400" style={{ animationDuration: '6s' }} />
            <span>Synced 2m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
