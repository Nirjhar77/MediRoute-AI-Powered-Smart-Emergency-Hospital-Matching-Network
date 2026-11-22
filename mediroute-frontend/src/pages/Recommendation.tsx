import { useMemo } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Info,
  Radio,
  RefreshCw,
  Navigation,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EmergencyRequest, Hospital } from '../types';
import { rank, score, reasons } from '../services/matching';
import { Badge, Button, Card, Disclaimer, SectionTitle, Stepper } from '../components/UI';
import { useGPS } from '../context/GPSContext';

export function Recommendation({
  hospitals,
  request,
}: {
  hospitals: Hospital[];
  request: EmergencyRequest;
}) {
  const nav = useNavigate();
  const gps = useGPS();
  const ranked = useMemo(() => rank(hospitals, request), [hospitals, request]);
  const best = ranked[0];

  const handleOpenTurnByTurn = () => {
    if (!best) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${gps.coords.lat},${gps.coords.lng}&destination=${best.lat},${best.lng}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Stepper step={3} />
      <SectionTitle
        eyebrow="Step 4 of 4 · Routing Analysis"
        title="Best Hospital Recommendation"
        sub="Recommendation prioritizes clinical capability eligibility first, then real-time road proximity and live resource readiness."
      />
      <Disclaimer />

      {best ? (
        <>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <Card className="overflow-hidden border-teal-200">
              <div className="border-b border-teal-100 bg-teal-50 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-700/20">
                      <CheckCircle2 />
                    </span>
                    <div>
                      <Badge tone="good">Top Match · {best.matchScore}% Score</Badge>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">{best.name}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-950">
                      {best.distance.toFixed(1)} km
                    </div>
                    <div className="text-xs font-semibold text-teal-800">
                      ~{best.travelTime} mins from current GPS
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {reasons(best, request).map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 p-3"
                    >
                      <CheckCircle2 size={17} className="text-emerald-600" />
                      <span className="text-sm font-semibold">{r.label} available</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Info size={16} className="text-teal-700" /> Why this hospital?
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    It satisfies 100% of required emergency capabilities for {request.type}, is located{' '}
                    <strong className="text-slate-900">{best.distance.toFixed(1)} km</strong> away (approx.{' '}
                    <strong>{best.travelTime} min drive</strong> via road network from {gps.locationLabel}), is verified, and has active critical resource availability.
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={() => nav('/caregiver/hospital/' + best.id)}
                    icon={<ArrowRight size={17} />}
                  >
                    View hospital details
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Navigation size={17} className="text-teal-700" />}
                    onClick={handleOpenTurnByTurn}
                  >
                    Launch Live Navigation
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-slate-900">Transparent Multi-Factor Ranking</h3>
              <p className="mt-1 text-sm text-slate-500">
                Score {Math.round(score(best, request))} · Evaluated with live GPS distance.
              </p>

              <div className="mt-5 space-y-4">
                {[
                  ['Capability fit', 'Required resources satisfied', 55],
                  [
                    'GPS Proximity',
                    `${best.distance.toFixed(1)} km road transit (~${best.travelTime}m)`,
                    Math.max(10, 35 - best.distance * 3),
                  ],
                  ['Freshness', best.lastUpdated, 20],
                  ['Verification', 'Accredited Facility', 5],
                ].map(([a, b, v]) => (
                  <div key={a as string}>
                    <div className="flex justify-between text-sm">
                      <b>{a}</b>
                      <span className="text-slate-500">{b}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-teal-700 transition-all duration-500"
                        style={{ width: `${Math.min(100, Number(v))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center gap-2 text-sm font-bold text-teal-900">
                  <Radio size={16} className="text-teal-700 animate-pulse" /> Live GPS Active
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Routing dynamically adapts if your location changes or as your ambulance moves through Khulna.
                </p>
              </div>
            </Card>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Live distance calculated using real GPS geodesic coordinates & urban road curvature factors.
            </p>
            <Button
              variant="ghost"
              onClick={() => nav('/caregiver/discover')}
              icon={<RefreshCw size={16} />}
            >
              Review all hospitals
            </Button>
          </div>
        </>
      ) : (
        <NoMatch />
      )}
    </>
  );
}

function NoMatch() {
  return (
    <Card className="mt-6 p-10 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600">
        <Radio />
      </div>
      <h2 className="mt-4 text-xl font-bold">No eligible hospital found</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
        No hospital in the current network satisfies every selected capability. Review ineligible hospitals or adjust requirements.
      </p>
    </Card>
  );
}
