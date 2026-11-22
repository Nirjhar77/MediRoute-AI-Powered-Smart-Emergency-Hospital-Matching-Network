import { useState } from 'react';
import {
  Navigation,
  Compass,
  Radio,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Play,
  Square,
  Crosshair,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useGPS } from '../context/GPSContext';
import { KHULNA_GPS_PRESETS } from '../services/gps';
import type { Hospital } from '../types';

export function LiveGPSWidget({
  hospitals,
  compact = false,
}: {
  hospitals?: Hospital[];
  compact?: boolean;
}) {
  const gps = useGPS();
  const [isOpen, setIsOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // Find nearest hospital based on current GPS distance
  const nearestHospital = hospitals && hospitals.length > 0
    ? [...hospitals].sort((a, b) => a.distance - b.distance)[0]
    : null;

  const handleAcquire = async () => {
    setDetecting(true);
    await gps.requestRealGPS();
    setDetecting(false);
  };

  const getStatusBadge = () => {
    if (gps.status === 'requesting' || detecting) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <RefreshCw size={11} className="animate-spin" />
          Acquiring Satellite Fix...
        </span>
      );
    }
    if (gps.status === 'active' && gps.source === 'hardware-gps') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          Real GPS Active (±{gps.accuracyMeters}m)
        </span>
      );
    }
    if (gps.isSimulatingMotion) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
          <Radio size={11} className="animate-pulse" />
          Ambulance In Motion ({gps.speedKmh} km/h)
        </span>
      );
    }
    if (gps.status === 'simulated' || gps.source === 'preset') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
          <MapPin size={11} />
          Location Preset Active
        </span>
      );
    }
    if (gps.status === 'denied') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertTriangle size={11} />
          GPS Denied (Fallback Active)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
        <Crosshair size={11} />
        GPS Ready
      </span>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleAcquire}
          disabled={detecting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition shadow-2xs active:scale-95"
          title="Click to detect real device GPS"
        >
          <Navigation size={13} className={detecting ? 'animate-spin text-teal-600' : 'text-teal-600'} />
          <span>{detecting ? 'Locating...' : 'Use Real GPS'}</span>
        </button>
        {getStatusBadge()}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-teal-200/90 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-slate-50 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-700/20">
            <Navigation size={20} className={gps.isLiveTracking ? 'animate-bounce' : ''} />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-900">
                Live GPS Telemetry
              </span>
              {getStatusBadge()}
              {gps.isLiveTracking && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  LIVE STREAM
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <MapPin size={14} className="text-teal-700 shrink-0" />
              <span className="truncate max-w-md">{gps.locationLabel}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-mono">
                {gps.coords.lat.toFixed(5)}°N, {gps.coords.lng.toFixed(5)}°E
              </span>
              {nearestHospital && (
                <span className="font-semibold text-teal-800">
                  🚗 Nearest: <strong className="text-slate-900">{nearestHospital.name.split('(')[0]}</strong> (
                  {nearestHospital.distance.toFixed(1)} km · {nearestHospital.travelTime} mins)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAcquire}
            disabled={detecting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 transition shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Crosshair size={14} className={detecting ? 'animate-spin' : ''} />
            <span>{detecting ? 'Locating...' : 'Real GPS Fix'}</span>
          </button>

          <button
            onClick={() => gps.toggleLiveTracking()}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 ${
              gps.isLiveTracking
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Radio size={14} className={gps.isLiveTracking ? 'animate-pulse' : ''} />
            <span>{gps.isLiveTracking ? 'Stop Live GPS' : 'Track Live'}</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 text-xs font-semibold"
            title="Expand GPS Diagnostics & Presets"
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {gps.error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">
          <AlertTriangle size={15} />
          <span>{gps.error}</span>
        </div>
      )}

      {/* Expanded Diagnostics Panel */}
      {isOpen && (
        <div className="mt-4 border-t border-teal-200/60 pt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">GPS Accuracy</span>
              <p className="text-sm font-extrabold text-teal-800">
                {gps.accuracyMeters ? `±${gps.accuracyMeters} m` : 'Calibrated'}
              </p>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Transit Speed</span>
              <p className="text-sm font-extrabold text-slate-800">
                {gps.speedKmh} km/h
              </p>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Compass Heading</span>
              <p className="text-sm font-extrabold text-slate-800 flex items-center justify-center gap-1">
                <Compass size={13} className="text-teal-600" />
                {gps.headingDegrees !== null ? `${gps.headingDegrees}°` : '0° N'}
              </p>
            </div>

            <div className="rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Signal Source</span>
              <p className="text-xs font-bold text-slate-700 capitalize">
                {gps.source.replace('-', ' ')}
              </p>
            </div>
          </div>

          {/* Quick Simulation Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Khulna Location Testing Presets
              </span>
              {gps.isSimulatingMotion ? (
                <button
                  onClick={gps.stopAmbulanceMotion}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                >
                  <Square size={12} /> Stop Motion
                </button>
              ) : (
                <button
                  onClick={() => gps.simulateAmbulanceMotion(22.8378, 89.5403)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline"
                >
                  <Play size={12} /> Simulate Ambulance to KMCH
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {KHULNA_GPS_PRESETS.map((p) => {
                const isCurrent =
                  Math.abs(gps.coords.lat - p.lat) < 0.001 &&
                  Math.abs(gps.coords.lng - p.lng) < 0.001;
                return (
                  <button
                    key={p.id}
                    onClick={() => gps.setPresetLocation(p)}
                    className={`text-left p-2.5 rounded-xl border transition-all text-xs ${
                      isCurrent
                        ? 'border-teal-600 bg-teal-50/80 font-bold text-teal-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate">{p.name}</span>
                      {isCurrent && <CheckCircle2 size={13} className="text-teal-700 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">{p.area}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
