import { X, CheckCircle2, XCircle, Phone, Navigation, MapPin } from 'lucide-react';
import type { Hospital, EmergencyRequest } from '../types';
import { score } from '../services/matching';

export function HospitalCompareModal({
  hospitals,
  request,
  onClose,
  onRemove,
}: {
  hospitals: Hospital[];
  request: EmergencyRequest;
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  if (!hospitals.length) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Side-By-Side Comparison
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Hospital Capabilities Matrix ({hospitals.length}/3 Selected)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-400 uppercase tracking-wider w-1/4">Metric / Requirement</th>
                {hospitals.map((h) => {
                  const matchScore = h.matchScore || score(h, request);
                  return (
                    <th key={h.id} className="py-3 px-4 font-bold text-slate-900 border-l border-slate-100 min-w-[200px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-black">{h.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{h.area}</div>
                          <div className="mt-1 inline-block text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            Match Score: {matchScore}%
                          </div>
                        </div>
                        <button
                          onClick={() => onRemove(h.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove from comparison"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Emergency Open */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Emergency Room (ED)</td>
                {hospitals.map((h) => (
                  <td key={h.id} className="py-3 px-4 border-l border-slate-100">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        h.emergencyOpen ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {h.emergencyOpen ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {h.emergencyOpen ? 'Open 24/7' : 'ED Closed'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Distance & Travel Time */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Travel Time & Distance</td>
                {hospitals.map((h) => (
                  <td key={h.id} className="py-3 px-4 border-l border-slate-100 font-bold text-slate-900">
                    {h.travelTime} mins ({h.distance.toFixed(1)} km)
                  </td>
                ))}
              </tr>

              {/* ICU Beds */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">ICU Beds Available</td>
                {hospitals.map((h) => (
                  <td key={h.id} className="py-3 px-4 border-l border-slate-100">
                    <span className={`font-bold ${h.icu.available > 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                      {h.icu.available} free / {h.icu.capacity} total
                    </span>
                  </td>
                ))}
              </tr>

              {/* Ventilators */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Ventilator Equipment</td>
                {hospitals.map((h) => (
                  <td key={h.id} className="py-3 px-4 border-l border-slate-100">
                    <span className={`font-bold ${h.ventilator.available > 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                      {h.ventilator.available} free / {h.ventilator.capacity} ready
                    </span>
                  </td>
                ))}
              </tr>

              {/* Oxygen Status */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Oxygen Reserves</td>
                {hospitals.map((h) => (
                  <td key={h.id} className="py-3 px-4 border-l border-slate-100 font-bold text-slate-800">
                    {h.oxygen}
                  </td>
                ))}
              </tr>

              {/* Operating Surgery Suites */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Surgical Suites</td>
                {hospitals.map((h) => (
                  <td key={h.id} className="py-3 px-4 border-l border-slate-100">
                    {h.surgery ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Active OR
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <XCircle size={14} /> Unavailable
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Blood Bank */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Accredited Blood Bank</td>
                {hospitals.map((h) => (
                  <td key={h.id} className="py-3 px-4 border-l border-slate-100">
                    {h.bloodBank ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Ready
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <XCircle size={14} /> Unavailable
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Cardiology */}
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700">Cardiology Specialist</td>
                {hospitals.map((h) => (
                  <td key={h.id} className="py-3 px-4 border-l border-slate-100">
                    {h.cardiology ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> On-Duty
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">None</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Actions row */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-400">Actions</td>
                {hospitals.map((h) => (
                  <td key={h.id} className="py-4 px-4 border-l border-slate-100">
                    <div className="flex flex-col gap-2">
                      <a
                        href={`tel:${h.phone}`}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-teal-700 py-1.5 px-3 text-[11px] font-bold text-white hover:bg-teal-800 transition-colors"
                      >
                        <Phone size={13} /> Call
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${h.lat},${h.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-900 py-1.5 px-3 text-[11px] font-bold text-white hover:bg-slate-800 transition-colors"
                      >
                        <Navigation size={13} /> Route
                      </a>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
          <span>Comparing {hospitals.length} facilities against active requirements</span>
          <button onClick={onClose} className="text-teal-700 hover:underline">
            Done Comparing
          </button>
        </div>
      </div>
    </div>
  );
}
