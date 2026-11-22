import { ArrowLeft, Phone, ShieldCheck, Navigation } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { EmergencyRequest, Hospital } from '../types';
import { Badge, Button, Card, Freshness, SectionTitle } from '../components/UI';
import { useGPS } from '../context/GPSContext';

export function HospitalDetails({
  hospitals,
  request,
}: {
  hospitals: Hospital[];
  request: EmergencyRequest;
}) {
  const { id } = useParams();
  const nav = useNavigate();
  const gps = useGPS();
  const h = hospitals.find((x) => x.id === id);

  if (!h) {
    return (
      <Card className="p-8">
        <h2 className="font-bold">Hospital not found</h2>
        <Button onClick={() => nav('/caregiver/discover')} variant="secondary">
          Back
        </Button>
      </Card>
    );
  }

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${gps.coords.lat},${gps.coords.lng}&destination=${h.lat},${h.lng}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <button
        onClick={() => nav('/caregiver/discover')}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back to discovery
      </button>

      <SectionTitle
        eyebrow="Hospital Dispatch Profile"
        title={h.name}
        sub={`${h.area} · ${h.distance.toFixed(1)} km (~${h.travelTime} min drive) from your live GPS coordinates`}
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={h.emergencyOpen ? 'good' : 'bad'}>
              {h.emergencyOpen ? 'Emergency department open' : 'Emergency department closed'}
            </Badge>
            {h.verified && (
              <Badge tone="teal">
                <ShieldCheck size={13} /> Verified
              </Badge>
            )}
            <Freshness text={h.lastUpdated} />
          </div>

          <div className="mt-5 rounded-xl bg-teal-50/80 border border-teal-200/80 p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
                Live Road Navigation
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {h.distance.toFixed(1)} km road transit · Estimated {h.travelTime} mins
              </p>
            </div>
            <Button
              onClick={handleNavigate}
              icon={<Navigation size={15} />}
              className="text-xs py-2 px-3.5"
            >
              Start GPS Route
            </Button>
          </div>

          <h3 className="mt-7 font-bold text-slate-900">Critical Clinical Resources</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Resource title="ICU" available={h.icu.available} capacity={h.icu.capacity} />
            <Resource
              title="Ventilator"
              available={h.ventilator.available}
              capacity={h.ventilator.capacity}
            />
            <Resource title="Oxygen" status={h.oxygen} />
            <Resource
              title="Emergency Department"
              status={h.emergencyOpen ? 'Open 24/7' : 'Closed'}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-900">Facility Contact & Dispatch Data</h3>
          <div className="mt-4 space-y-3 text-sm">
            <p>
              <span className="text-slate-400">Hospital administrator</span>
              <br />
              <b className="text-slate-800">{h.admin}</b>
            </p>
            <p>
              <span className="text-slate-400">Phone</span>
              <br />
              <a href={`tel:${h.phone}`} className="text-teal-700 font-bold hover:underline">
                {h.phone}
              </a>
            </p>
            {h.emergencyPhone && (
              <p>
                <span className="text-slate-400">Emergency Hot Line</span>
                <br />
                <a
                  href={`tel:${h.emergencyPhone}`}
                  className="text-rose-600 font-bold hover:underline"
                >
                  {h.emergencyPhone}
                </a>
              </p>
            )}

            <div className="flex items-center gap-2 border-t border-slate-100 pt-4">
              <ShieldCheck size={16} className="text-teal-700" />
              <span className="font-semibold text-slate-800">Hospital-reported data</span>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Information is verified against official records. Live distances dynamically update as your GPS location changes.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <a
              href={`tel:${h.emergencyPhone || h.phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 transition"
            >
              <Phone size={16} /> Call Emergency Desk
            </a>
          </div>
        </Card>
      </div>
    </>
  );
}

function Resource({
  title,
  available,
  capacity,
  status,
}: {
  title: string;
  available?: number;
  capacity?: number;
  status?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <b className="text-sm">{title}</b>
        <Badge
          tone={
            status === 'Closed' || status === 'Unavailable'
              ? 'bad'
              : status === 'Limited'
              ? 'warn'
              : 'good'
          }
        >
          {status ?? `${available} available`}
        </Badge>
      </div>
      {available !== undefined && (
        <>
          <div className="mt-4 flex justify-between text-xs text-slate-500">
            <span>Available</span>
            <b>
              {available} / {capacity}
            </b>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-teal-700"
              style={{ width: `${capacity ? (available / capacity) * 100 : 0}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
