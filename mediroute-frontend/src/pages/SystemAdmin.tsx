import {
  Search,
  ShieldCheck,
  Users,
  Hospital as HospitalIcon,
  Activity,
  FileClock,
  Flame,
  Wind,
  AlertTriangle,
  Globe,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Database,
  Server,
} from 'lucide-react';
import type { ReactNode, useState as UseState } from 'react';
import { useState } from 'react';
import { Badge, Card, SectionTitle } from '../components/UI';
import type { Hospital, ResourceStatus } from '../types';

// ── Resource Status Dot ──────────────────────────────────────────────────
function ResourceDot({ status }: { status: ResourceStatus | undefined }) {
  if (!status || status === 'Unknown')
    return <span title="Unknown" className="inline-flex items-center gap-1 text-xs text-slate-400"><HelpCircle size={12} /> Unknown</span>;
  if (status === 'Available')
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={12} /> Confirmed</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600"><XCircle size={12} /> Unavailable</span>;
}

export function SystemAdmin({
  hospitals,
  backendStatus,
}: {
  hospitals: Hospital[];
  backendStatus?: any;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic metrics computed from actual hospital records
  const totalHospitals = hospitals.length;
  const verifiedCount = hospitals.filter((h) => h.verified).length;
  const activeEds = hospitals.filter((h) => h.emergencyOpen).length;
  const oxygenConfirmed = hospitals.filter((h) => h.oxygenStatus === 'Available').length;
  const ventConfirmed = hospitals.filter((h) => h.ventilatorStatus === 'Available').length;
  const icuConfirmed = hospitals.filter((h) => h.icuStatus === 'Available').length;
  const unknownResources = hospitals.filter(
    (h) => h.oxygenStatus === 'Unknown' || h.ventilatorStatus === 'Unknown' || h.icuStatus === 'Unknown'
  ).length;

  const filteredHospitals = hospitals.filter((h) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return h.name.toLowerCase().includes(q) || h.area.toLowerCase().includes(q);
  });

  return (
    <>
      <SectionTitle
        eyebrow="System administrator"
        title="Network operations"
        sub="Monitor hospitals, verification, resource signals, and administrative activity."
      />

      {/* ── Backend Database & API Telemetry Card ── */}
      <div className="mb-5 rounded-2xl border border-teal-200/90 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-slate-50 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-800 text-white shadow-md shadow-teal-800/20">
            <Database size={22} />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-900">
                Backend Database Status
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                {backendStatus ? backendStatus.database : 'FastAPI Connected (Port 8000)'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-800">
                REST API v1.0
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              PostgreSQL schema active · Endpoints: <code className="font-mono text-teal-800 font-bold">/api/hospitals</code>, <code className="font-mono text-teal-800 font-bold">/api/match</code>, <code className="font-mono text-teal-800 font-bold">/api/blood-donors</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 transition shadow-sm active:scale-95"
          >
            <Server size={14} />
            <span>Interactive Swagger API Docs</span>
          </a>
        </div>
      </div>

      {/* ── Dynamic Stats Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <Stat icon={<HospitalIcon />} label="Total Hospitals" value={String(totalHospitals)} />
        <Stat icon={<ShieldCheck />} label="Verified Hospitals" value={String(verifiedCount)} />
        <Stat icon={<Activity />} label="Active EDs (24/7)" value={String(activeEds)} />
        <Stat icon={<Users />} label="Hospital Admins" value={String(verifiedCount)} />
      </div>

      {/* ── Resource Capability Stats ── */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ResourceStat
          icon={<Flame className="text-emerald-600" />}
          label="Oxygen Confirmed"
          value={oxygenConfirmed}
          total={totalHospitals}
          color="emerald"
        />
        <ResourceStat
          icon={<Wind className="text-sky-600" />}
          label="Ventilators Confirmed"
          value={ventConfirmed}
          total={totalHospitals}
          color="sky"
        />
        <ResourceStat
          icon={<Activity className="text-indigo-600" />}
          label="ICU Confirmed"
          value={icuConfirmed}
          total={totalHospitals}
          color="indigo"
        />
        <ResourceStat
          icon={<AlertTriangle className="text-amber-600" />}
          label="Unknown Resources"
          value={unknownResources}
          total={totalHospitals}
          color="amber"
          invert
        />
      </div>

      {/* ── Hospital Management Table ── */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Hospital management</h2>
            <p className="text-xs text-slate-500">Verification, resource monitoring, and oxygen/ventilator/ICU status</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-400 min-w-[200px]">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search hospitals…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-slate-700 text-xs bg-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3">Hospital</th>
                <th>Category</th>
                <th>Verification</th>
                <th>Oxygen</th>
                <th>Ventilators</th>
                <th>ICU</th>
                <th>ED Status</th>
                <th>Last Update</th>
                <th>Website</th>
              </tr>
            </thead>
            <tbody>
              {filteredHospitals.map((h) => (
                <tr key={h.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <b className="text-slate-900">{h.name}</b>
                    <div className="text-xs text-slate-400">{h.area}</div>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 font-medium">{h.category || '—'}</span>
                  </td>
                  <td>
                    <Badge tone={h.verified ? 'good' : 'warn'}>
                      {h.verified ? (
                        <><ShieldCheck size={11} /> Verified</>
                      ) : (
                        <><AlertTriangle size={11} /> Pending</>
                      )}
                    </Badge>
                  </td>
                  <td><ResourceDot status={h.oxygenStatus} /></td>
                  <td><ResourceDot status={h.ventilatorStatus} /></td>
                  <td><ResourceDot status={h.icuStatus} /></td>
                  <td>
                    <Badge tone={h.emergencyOpen ? 'good' : 'bad'}>
                      {h.emergencyOpen ? 'Open' : 'Closed'}
                    </Badge>
                  </td>
                  <td className="text-slate-500 text-xs whitespace-nowrap">{h.lastUpdated}</td>
                  <td>
                    {h.website ? (
                      <a
                        href={h.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Globe size={11} /> Visit
                      </a>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── User management & Audit history ── */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <Users size={18} className="text-teal-700" /> User management
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ['Emergency Seekers', '1,248'],
              ['Hospital admins', String(verifiedCount)],
              ['System admins', '2'],
            ].map(([a, b]) => (
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100" key={a}>
                <p className="text-xs text-slate-500">{a}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{b}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <FileClock size={18} className="text-teal-700" /> Audit history
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {[
              'KMCH · ICU availability updated',
              'Abu Naser Hospital · verification reviewed',
              'Gazi Medical · resource report received',
              '250-Bedded General Hospital · added to registry',
              'Ad-din Akij Medical · oxygen status confirmed',
            ].map((x, i) => (
              <div key={x} className="flex justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-700">{x}</span>
                <span className="text-xs text-slate-400 whitespace-nowrap">{i + 2} min ago</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Verification Queue ── */}
      {hospitals.filter((h) => !h.verified).length > 0 && (
        <Card className="mt-6 p-5 border-amber-200 bg-amber-50/60">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-3 flex-1">
              <div>
                <h3 className="font-bold text-amber-900 text-sm">
                  {hospitals.filter((h) => !h.verified).length} Hospitals Require Manual Verification
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  The following hospitals have unconfirmed capability data. Resource statuses are marked "Unknown" until verified from official sources or direct hospital contact.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {hospitals
                  .filter((h) => !h.verified)
                  .map((h) => (
                    <div
                      key={h.id}
                      className="bg-white border border-amber-200 rounded-xl px-3 py-2.5 text-xs space-y-1"
                    >
                      <p className="font-bold text-slate-900">{h.name}</p>
                      <p className="text-slate-500">{h.area}</p>
                      {h.verificationNote && (
                        <p className="text-amber-700 leading-relaxed line-clamp-2">{h.verificationNote}</p>
                      )}
                      {h.sourceUrl && (
                        <a
                          href={h.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 font-semibold hover:underline block truncate"
                        >
                          {h.sourceUrl}
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

const Stat = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <span className="text-teal-700">{icon}</span>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
    </div>
    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
  </Card>
);

const ResourceStat = ({
  icon,
  label,
  value,
  total,
  color,
  invert = false,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  total: number;
  color: string;
  invert?: boolean;
}) => (
  <Card className="p-5 space-y-2">
    <div className="flex items-center justify-between">
      <span>{icon}</span>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
    </div>
    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full bg-${invert ? 'amber' : color}-500 transition-all duration-500`}
        style={{ width: `${total > 0 ? (value / total) * 100 : 0}%` }}
      />
    </div>
    <p className="text-[10px] text-slate-400">{value} of {total} hospitals</p>
  </Card>
);
