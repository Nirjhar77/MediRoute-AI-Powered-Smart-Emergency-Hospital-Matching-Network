import type { ReactNode } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock3,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const Card = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`rounded-2xl border border-slate-200/90 bg-white shadow-xs ${className}`}>
    {children}
  </div>
);

export const Badge = ({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'good' | 'warn' | 'bad' | 'neutral' | 'teal';
}) => {
  const c = {
    good: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs',
    warn: 'bg-amber-50 text-amber-800 border-amber-200/80 shadow-2xs',
    bad: 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-2xs',
    teal: 'bg-teal-50 text-teal-800 border-teal-200/80 shadow-2xs',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80 shadow-2xs',
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c}`}>
      {children}
    </span>
  );
};

export const Status = ({
  ok,
  label,
  icon,
}: {
  ok: boolean;
  label: string;
  icon?: ReactNode;
}) => (
  <span className={`flex items-center gap-2 text-xs font-medium ${ok ? 'text-slate-800' : 'text-slate-400'}`}>
    {ok ? (
      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
    ) : (
      <XCircle size={15} className="text-rose-400 shrink-0" />
    )}
    <span className="flex items-center gap-1">
      {icon && <span className="text-slate-400">{icon}</span>}
      {label}
    </span>
  </span>
);

export const Freshness = ({ text }: { text?: string }) => {
  const safeText = text || 'just now';
  const isFresh = safeText === 'just now' || (safeText.includes('min') && parseInt(safeText) < 15);
  return (
    <Badge tone={isFresh ? 'good' : 'warn'}>
      <Clock3 size={13} className="shrink-0" />
      <span>{safeText}</span>
    </Badge>
  );
};

export const SectionTitle = ({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) => (
  <div className="mb-6 space-y-1">
    {eyebrow && (
      <div className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-widest text-teal-700">
        <Sparkles size={13} className="text-teal-600" />
        <span>{eyebrow}</span>
      </div>
    )}
    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
    {sub && <p className="text-sm font-medium text-slate-500">{sub}</p>}
  </div>
);

export const Disclaimer = () => (
  <div className="flex gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-2xs leading-relaxed">
    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-700" />
    <div>
      <b className="font-bold text-amber-950">Clinical decision-support only.</b> MediRoute provides verified network resource matching and specialist cataloging. It does not diagnose, treat, or guarantee admission. In medical emergencies, call local dispatch or go to the nearest emergency room.
    </div>
  </div>
);

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  icon,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${
      variant === 'primary'
        ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20 hover:bg-teal-800 hover:shadow-lg hover:shadow-teal-700/30'
        : variant === 'danger'
        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 hover:bg-rose-700'
        : variant === 'secondary'
        ? 'border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300'
        : 'text-slate-600 hover:bg-slate-100/80'
    } ${className}`}
  >
    {icon}
    {children}
  </button>
);

export const Stepper = ({ step }: { step: number }) => (
  <div className="mb-8 flex items-center gap-2">
    {['Emergency', 'Location', 'Hospitals', 'Best Match'].map((x, i) => (
      <div key={x} className="flex min-w-0 flex-1 items-center gap-2">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold transition-all duration-300 ${
            i <= step
              ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/20 ring-4 ring-teal-700/10'
              : 'bg-slate-100 text-slate-400'
          }`}
        >
          {i < step ? '✓' : i + 1}
        </div>
        <span
          className={`hidden truncate text-xs font-bold sm:block ${
            i <= step ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          {x}
        </span>
        {i < 3 && (
          <div
            className={`h-0.5 flex-1 transition-all duration-300 ${
              i < step ? 'bg-teal-600' : 'bg-slate-200'
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

export const EmptyState = ({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) => (
  <Card className="p-10 text-center space-y-3">
    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
      <MapPin size={22} />
    </div>
    <h3 className="text-base font-bold text-slate-900">{title}</h3>
    <p className="mx-auto max-w-md text-xs text-slate-500">{body}</p>
    {onRetry && (
      <div className="pt-2">
        <Button variant="secondary" onClick={onRetry} icon={<RefreshCw size={16} />}>
          Try again
        </Button>
      </div>
    )}
  </Card>
);

export const MiniArrow = () => <ArrowRight size={16} />;
export const Verify = () => <ShieldCheck size={15} />;
