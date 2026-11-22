import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Activity, ShieldCheck, MapPin, Navigation } from 'lucide-react';
import type { EmergencyRequest } from '../types';

const steps = [
  { label: 'Identifying clinical requirements', icon: Activity },
  { label: 'Checking hospital capability profiles', icon: ShieldCheck },
  { label: 'Verifying real-time resource availability', icon: Activity },
  { label: 'Calculating road travel time & traffic', icon: Navigation },
  { label: 'Ranking optimal match scores', icon: MapPin },
];

export function SearchSequenceModal({
  request,
  onComplete,
}: {
  request: EmergencyRequest;
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        setTimeout(onComplete, 500);
        return prev;
      });
    }, 450);

    return () => clearInterval(timer);
  }, [onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / steps.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 shadow-xs">
            <Activity size={28} className="animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Intelligent Emergency Search Sequence
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Coordinating capability-aware routing for <strong className="text-teal-700 font-bold">{request.type} Emergency</strong>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Coordination Progress</span>
            <span className="text-teal-700">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-teal-700 to-emerald-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step List */}
        <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 rounded-xl p-2.5 transition-all ${
                  isCurrent
                    ? 'bg-white shadow-xs border border-teal-200 text-teal-900 font-bold'
                    : isDone
                    ? 'text-slate-700 font-medium'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 size={18} className="animate-spin text-teal-700" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>

                <span className="text-xs flex-1">{step.label}</span>

                {isCurrent && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Skip */}
        <div className="pt-2 text-center">
          <button
            onClick={onComplete}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip sequence & view results directly →
          </button>
        </div>
      </div>
    </div>
  );
}
