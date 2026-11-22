import { useState } from 'react';
import {
  ArrowRight,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Stethoscope,
  Navigation,
  RotateCcw,
  Check,
  Activity,
  HeartPulse,
  Wind,
  Flame,
  Award,
  Brain,
  ShieldAlert,
  HelpCircle,
  Droplet,
  Scissors,
  Sparkles,
  Play,
  Radio,
  Crosshair,
  AlertTriangle,
  Square,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Disclaimer, SectionTitle } from '../components/UI';
import { emergencyTypePresets, capabilityTooltips, initialRecentSearches } from '../data/mockData';
import { northwesternBloodDonors } from '../data/northwesternBloodDonors';
import type { EmergencyRequest, Capability, EmergencyType, RecentSearch } from '../types';
import { SearchSequenceModal } from '../components/SearchSequenceModal';
import { GeminiAssistantModal } from '../components/GeminiAssistantModal';
import { useGPS } from '../context/GPSContext';
import { KHULNA_GPS_PRESETS } from '../services/gps';

const allCapabilities: Capability[] = [
  'Emergency Department',
  'ICU',
  'Ventilator',
  'Oxygen',
  'Surgery',
  'Blood',
  'Cardiology',
  'Neurology',
];

const getEmergencyTypeIcon = (type: EmergencyType) => {
  switch (type) {
    case 'Trauma':
      return <ShieldAlert size={20} className="text-rose-600" />;
    case 'Cardiac':
      return <HeartPulse size={20} className="text-red-600 animate-pulse" />;
    case 'Respiratory':
      return <Wind size={20} className="text-sky-600" />;
    case 'General Emergency':
      return <Activity size={20} className="text-teal-600" />;
  }
};

const getCapIcon = (c: Capability) => {
  switch (c) {
    case 'Emergency Department':
      return <ShieldCheck size={16} className="text-teal-600" />;
    case 'ICU':
      return <Activity size={16} className="text-teal-600" />;
    case 'Ventilator':
      return <Wind size={16} className="text-sky-600" />;
    case 'Oxygen':
      return <Flame size={16} className="text-amber-500" />;
    case 'Surgery':
      return <Scissors size={16} className="text-indigo-600" />;
    case 'Blood':
      return <Droplet size={16} className="text-rose-600" />;
    case 'Cardiology':
      return <HeartPulse size={16} className="text-red-600" />;
    case 'Neurology':
      return <Brain size={16} className="text-purple-600" />;
  }
};

export function Caregiver({
  request,
  setRequest,
}: {
  request: EmergencyRequest;
  setRequest: (r: EmergencyRequest) => void;
}) {
  const nav = useNavigate();
  const [type, setType] = useState<EmergencyType>(request.type);
  const [reqs, setReqs] = useState<Capability[]>(request.requirements);
  const [targetBloodGroup, setTargetBloodGroup] = useState<string>(request.targetBloodGroup || 'O-');
  const [activeTooltip, setActiveTooltip] = useState<Capability | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeminiOpen, setIsGeminiOpen] = useState(false);
  const [recentSearches] = useState<RecentSearch[]>(initialRecentSearches);

  const handleTypeSelect = (selectedType: EmergencyType) => {
    setType(selectedType);
    const preset = emergencyTypePresets[selectedType];
    if (preset) {
      setReqs(preset.recommended);
    }
  };

  const toggleCap = (c: Capability) => {
    setReqs((r) => (r.includes(c) ? r.filter((x) => x !== c) : [...r, c]));
  };

  const matchingDonorsCount = northwesternBloodDonors.filter(
    (d) => d.bloodGroup === targetBloodGroup
  ).length;

  const handleStartSearch = () => {
    const updatedRequest: EmergencyRequest = {
      ...request,
      type,
      requirements: reqs,
      targetBloodGroup: reqs.includes('Blood') || type === 'Cardiac' || type === 'Trauma' ? targetBloodGroup : undefined,
    };
    setRequest(updatedRequest);
    setIsSearching(true);
  };

  const handleReRunSearch = (search: RecentSearch) => {
    setType(search.type);
    setReqs(search.requirements);
    const updatedRequest: EmergencyRequest = {
      ...request,
      type: search.type,
      requirements: search.requirements,
      targetBloodGroup: search.requirements.includes('Blood') || search.type === 'Cardiac' || search.type === 'Trauma' ? targetBloodGroup : undefined,
    };
    setRequest(updatedRequest);
    setIsSearching(true);
  };

  return (
    <>
      {isSearching && (
        <SearchSequenceModal
          request={{ ...request, type, requirements: reqs }}
          onComplete={() => {
            setIsSearching(false);
            nav('/caregiver/discover');
          }}
        />
      )}

      {isGeminiOpen && (
        <GeminiAssistantModal
          onClose={() => setIsGeminiOpen(false)}
          onApplyPreset={(newType, newCaps) => {
            setType(newType);
            setReqs(newCaps);
          }}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionTitle
            eyebrow="Emergency Seeker Workspace"
            title="Intelligent Hospital Search"
            sub="Specify the clinical emergency type. MediRoute recommends required capabilities before capability-aware routing."
          />
          
          <button
            onClick={() => setIsGeminiOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 via-indigo-700 to-purple-700 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:shadow-lg transition-all active:scale-95 border border-white/20"
          >
            <Sparkles size={16} className="text-teal-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Consult MediRoute AI Assistant</span>
          </button>
        </div>

        <Disclaimer />

        {/* Main Search Card */}
        <Card className="overflow-hidden border-slate-200 shadow-md">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/30 p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-700 text-white shadow-md shadow-teal-700/20">
                <Search size={22} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Start an Emergency Coordination Request</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Capability-driven triage. No patient personal records required.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Step 1: Emergency Type Cards with Feature Icons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-700 text-white text-xs">1</span>
                  Select Emergency Type
                </h3>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Auto-recommends Capabilities
                </span>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {(['Trauma', 'Cardiac', 'Respiratory', 'General Emergency'] as EmergencyType[]).map((x) => {
                  const isSelected = type === x;
                  const preset = emergencyTypePresets[x];
                  const icon = getEmergencyTypeIcon(x);

                  return (
                    <button
                      key={x}
                      onClick={() => handleTypeSelect(x)}
                      className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-100'}`}>
                          {icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {preset?.protocolBadge && (
                            <span className="text-[10px] font-extrabold text-teal-800 bg-teal-100/90 px-2 py-0.5 rounded-full border border-teal-200">
                              {preset.protocolBadge}
                            </span>
                          )}
                          {isSelected && <Check size={18} className="text-teal-700 font-bold" />}
                        </div>
                      </div>

                      <h4 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {x}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {preset?.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rationale Banner */}
            {type && (
              <div className="rounded-2xl bg-teal-50/60 p-4 border border-teal-100 text-xs text-teal-950 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-teal-900">MediRoute Clinical Rationale ({emergencyTypePresets[type]?.protocolBadge}):</strong>{' '}
                  {emergencyTypePresets[type]?.rationale}
                </div>
              </div>
            )}

            {/* Step 2: Required Capabilities Cards with Feature Icons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-700 text-white text-xs">2</span>
                  Verify Required Capabilities
                </h3>
                <span className="text-xs text-slate-400 font-medium">Click icon for clinical info</span>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {allCapabilities.map((c) => {
                  const isChecked = reqs.includes(c);
                  const tooltip = capabilityTooltips[c];
                  const isTooltipOpen = activeTooltip === c;

                  return (
                    <div
                      key={c}
                      className={`relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 ${
                        isChecked
                          ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleCap(c)}
                          className="flex items-center gap-2.5 text-left min-w-0 flex-1"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100">{getCapIcon(c)}</div>
                          <span className="text-xs font-bold text-slate-900 truncate">{c}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setActiveTooltip(isTooltipOpen ? null : c)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title="Clinical info"
                          >
                            <HelpCircle size={14} />
                          </button>

                          <button
                            onClick={() => toggleCap(c)}
                            className={`grid h-5 w-5 place-items-center rounded-md border text-xs font-bold transition-colors ${
                              isChecked
                                ? 'border-teal-700 bg-teal-700 text-white'
                                : 'border-slate-300 bg-white text-transparent'
                            }`}
                          >
                            ✓
                          </button>
                        </div>
                      </div>

                      {/* Tooltip Popover */}
                      {isTooltipOpen && (
                        <div className="mt-2 rounded-xl bg-slate-900 p-2.5 text-[11px] text-white shadow-xl animate-fade-in space-y-1">
                          <div className="flex items-center justify-between font-bold text-teal-300">
                            <span>{c} Requirement</span>
                            <button onClick={() => setActiveTooltip(null)} className="text-slate-400 hover:text-white">
                              ×
                            </button>
                          </div>
                          <p className="text-slate-200 leading-snug">{tooltip}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2.5: Target Patient Blood Group (Clinical Emergency Triage) */}
            {(reqs.includes('Blood') || type === 'Cardiac' || type === 'Trauma') && (
              <div className="space-y-3 rounded-2xl bg-rose-50/60 p-4 border border-rose-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                      <Droplet size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Patient Target Blood Group (Emergency Triage)
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Auto-matches hospital blood reserves & North Western University Donor Directory
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">
                    <span>⚡ {matchingDonorsCount} NWU Donors Available for {targetBloodGroup}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => {
                    const count = northwesternBloodDonors.filter((d) => d.bloodGroup === bg).length;
                    const isSelected = targetBloodGroup === bg;
                    return (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setTargetBloodGroup(bg)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/30'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{bg}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-rose-700 text-rose-100' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <ShieldCheck size={16} className="text-teal-700" />
                <span>{reqs.length} capabilities selected for routing analysis.</span>
              </div>

              <button
                disabled={!reqs.length}
                onClick={handleStartSearch}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-rose-600/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 border border-rose-400/30 uppercase tracking-wider"
              >
                <Play size={18} className="fill-white animate-pulse" />
                <span>Run Emergency Search</span>
              </button>
            </div>
          </div>
        </Card>

        {/* Recent Searches */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock3 size={18} className="text-teal-700" /> Recent Coordination Searches
            </h3>
            <span className="text-xs text-slate-400 font-medium">1-click re-run capability search</span>
          </div>

          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {recentSearches.map((s) => (
              <Card key={s.id} className="p-4 hover-lift border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="teal">{s.type}</Badge>
                      <span className="text-xs text-slate-400 font-medium">{s.time}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 pt-1">
                      <strong className="text-slate-800">Requirements:</strong> {s.requirements.join(' · ')}
                    </p>
                    <p className="text-xs font-bold text-teal-700 pt-0.5">Top Match: {s.match}</p>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => handleReRunSearch(s)}
                    className="text-xs py-1.5 px-3"
                    icon={<RotateCcw size={13} />}
                  >
                    Re-run
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function Location({
  request,
  setRequest,
}: {
  request: EmergencyRequest;
  setRequest: (r: EmergencyRequest) => void;
}) {
  const nav = useNavigate();
  const gps = useGPS();
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(request.location.label);
  const [manualLat, setManualLat] = useState(String(request.location.lat));
  const [manualLng, setManualLng] = useState(String(request.location.lng));

  const handleAcquireGPS = async () => {
    setLoading(true);
    await gps.requestRealGPS();
    setLoading(false);
  };

  const handleManualApply = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      gps.setManualLocation(lat, lng, manual);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle
        eyebrow="Real-Time GPS Dispatch"
        title="Live GPS Location System"
        sub="MediRoute calculates real driving distance and transit times from your live device coordinates."
      />

      <Card className="p-6 sm:p-8 space-y-6 shadow-md border-slate-200">
        {/* Live GPS Telemetry Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 p-6 sm:p-8 text-white relative overflow-hidden border border-teal-700/50 shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <span className="absolute -inset-1 rounded-2xl bg-teal-400 opacity-30 blur-sm animate-pulse" />
              <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-teal-800 text-teal-200 border border-teal-400/40 shadow-inner">
                <Navigation size={32} className={gps.isLiveTracking ? 'animate-bounce text-white' : 'text-teal-200'} />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-widest text-teal-300">
                  Real GPS Sensor Fix
                </span>
                {gps.source === 'hardware-gps' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Device GPS Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    <MapPin size={11} /> Calibrated Coordinates
                  </span>
                )}
                {gps.isLiveTracking && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                    CONTINUOUS TRACKING ON
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white pt-1">
                {gps.locationLabel}
              </h2>

              <p className="font-mono text-sm text-teal-200">
                Lat: {gps.coords.lat.toFixed(6)}° · Lng: {gps.coords.lng.toFixed(6)}°
              </p>
            </div>
          </div>

          {/* Real-time stats grid */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-teal-700/60 pt-5">
            <div className="rounded-xl bg-white/10 backdrop-blur p-3 text-center border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Accuracy</span>
              <p className="text-base font-extrabold text-white mt-0.5">
                {gps.accuracyMeters ? `±${gps.accuracyMeters} m` : '±8 m'}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur p-3 text-center border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Transit Speed</span>
              <p className="text-base font-extrabold text-white mt-0.5">
                {gps.speedKmh} km/h
              </p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur p-3 text-center border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Compass</span>
              <p className="text-base font-extrabold text-white mt-0.5">
                {gps.headingDegrees !== null ? `${gps.headingDegrees}°` : '0° N'}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur p-3 text-center border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Road Model</span>
              <p className="text-xs font-extrabold text-emerald-300 mt-1">
                Live Turn-by-Turn
              </p>
            </div>
          </div>
        </div>

        {gps.error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{gps.error}</span>
          </div>
        )}

        {/* Primary GPS Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              onClick={handleAcquireGPS}
              disabled={loading}
              icon={<Crosshair size={16} className={loading ? 'animate-spin text-teal-700' : 'text-teal-700'} />}
            >
              {loading ? 'Acquiring Real GPS Fix…' : 'Acquire Real GPS Fix'}
            </Button>

            <button
              onClick={() => gps.toggleLiveTracking()}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm active:scale-95 ${
                gps.isLiveTracking
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              <Radio size={16} className={gps.isLiveTracking ? 'animate-pulse' : ''} />
              <span>{gps.isLiveTracking ? 'Stop Live GPS' : 'Start Continuous GPS'}</span>
            </button>
          </div>

          <Button onClick={() => nav('/caregiver/discover')} icon={<ArrowRight size={17} />}>
            Proceed to Results
          </Button>
        </div>

        {/* Testing Presets & Ambulance Simulation */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Khulna Division GPS Presets
            </label>
            {gps.isSimulatingMotion ? (
              <button
                onClick={gps.stopAmbulanceMotion}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
              >
                <Square size={12} /> Stop Ambulance Simulation
              </button>
            ) : (
              <button
                onClick={() => gps.simulateAmbulanceMotion(22.8378, 89.5403)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
              >
                <Play size={12} className="fill-purple-700" /> Simulate Moving Ambulance to KMCH
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {KHULNA_GPS_PRESETS.map((p) => {
              const isSelected =
                Math.abs(gps.coords.lat - p.lat) < 0.001 &&
                Math.abs(gps.coords.lng - p.lng) < 0.001;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    gps.setPresetLocation(p);
                    setManualLat(String(p.lat));
                    setManualLng(String(p.lng));
                    setManual(p.name);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 font-bold text-teal-950 ring-2 ring-teal-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate">{p.name}</span>
                    {isSelected && <Check size={14} className="text-teal-700 shrink-0" />}
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">{p.area}</span>
                  <span className="font-mono text-[10px] text-slate-400 block mt-1">
                    {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Location Override */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Manual Coordinate Override
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Area description..."
              className="sm:col-span-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
            <input
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="Latitude"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
            <input
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="Longitude"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={handleManualApply}>
              Apply Custom Coordinates
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
