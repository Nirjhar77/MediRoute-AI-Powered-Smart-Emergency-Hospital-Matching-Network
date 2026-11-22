import { useState, useMemo } from 'react';
import { Filter, MapPin, AlertCircle, Info, ChevronDown, ChevronUp, Layers, CheckCircle2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { EmergencyRequest, Hospital } from '../types';
import { HospitalMap } from '../components/Map';
import { HospitalCard } from '../components/HospitalCard';
import { Button, Card, SectionTitle, Stepper, EmptyState } from '../components/UI';
import { rank, getWhyNotNearestRationale, score } from '../services/matching';
import { NetworkStatus } from '../components/NetworkStatus';
import { HospitalDrawer } from '../components/HospitalDrawer';
import { HospitalCompareModal } from '../components/HospitalCompareModal';
import { LiveGPSWidget } from '../components/LiveGPSWidget';

export function Discovery({
  hospitals,
  request,
}: {
  hospitals: Hospital[];
  request: EmergencyRequest;
}) {
  const nav = useNavigate();
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [drawerHospital, setDrawerHospital] = useState<Hospital | null>(null);
  const [comparedHospitals, setComparedHospitals] = useState<Hospital[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'full' | 'partial'>('all');
  const [isRankingExpanded, setIsRankingExpanded] = useState(false);

  // Compute intelligent ranking
  const rankedHospitals = useMemo(() => rank(hospitals, request), [hospitals, request]);

  // Compute why-not-nearest explanation
  const whyNotNearest = useMemo(() => getWhyNotNearestRationale(hospitals, request), [hospitals, request]);

  // Filter visible list based on mode
  const visibleHospitals = useMemo(() => {
    if (filterMode === 'full') {
      return rankedHospitals.filter((h) => h.matchStatus === 'full');
    }
    if (filterMode === 'partial') {
      return rankedHospitals.filter((h) => h.matchStatus === 'full' || h.matchStatus === 'partial');
    }
    return rankedHospitals;
  }, [rankedHospitals, filterMode]);

  const handleCompareToggle = (h: Hospital) => {
    setComparedHospitals((prev) => {
      const exists = prev.some((item) => item.id === h.id);
      if (exists) {
        return prev.filter((item) => item.id === h.id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 hospitals at a time.');
        return prev;
      }
      return [...prev, h];
    });
  };

  const handleCardDetails = (h: Hospital) => {
    setSelectedHospitalId(h.id);
    setDrawerHospital(h);
  };

  const activeDrawerHospital = drawerHospital || (selectedHospitalId ? hospitals.find((h) => h.id === selectedHospitalId) || null : null);

  return (
    <div className="space-y-6 pb-12">
      <Stepper step={2} />

      {/* Network Status Header Bar */}
      <NetworkStatus hospitals={hospitals} />

      {/* Real-Time GPS Tracking Widget */}
      <LiveGPSWidget hospitals={hospitals} />

      {/* Page Title & Controls */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionTitle
          eyebrow="Step 3 of 4 · Routing Analysis"
          title="Intelligent Hospital Matching Dashboard"
          sub={`Evaluated ${rankedHospitals.length} regional facilities for ${request.type} Emergency requirements (${request.requirements.join(', ')}).`}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterMode === 'full' ? 'primary' : 'secondary'}
            onClick={() => setFilterMode('full')}
            className="text-xs py-2"
          >
            🟢 Full Match Only ({rankedHospitals.filter((h) => h.matchStatus === 'full').length})
          </Button>
          <Button
            variant={filterMode === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilterMode('all')}
            className="text-xs py-2"
          >
            All Facilities ({rankedHospitals.length})
          </Button>
        </div>
      </div>

      {/* Prominent "Why Not Nearest Hospital?" Banner (When applicable) */}
      {whyNotNearest && (
        <Card className="border-amber-300/80 bg-amber-50/70 p-5 shadow-xs animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <AlertCircle size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Routing Rationale Notice
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  Why not the nearest hospital?
                </span>
              </div>
              <p className="text-xs font-medium text-amber-950 leading-relaxed">
                {whyNotNearest.explanation}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Expandable "How MediRoute Ranked Hospitals" Explanation */}
      <Card className="border-slate-200 bg-slate-50/60 p-4 shadow-2xs">
        <button
          onClick={() => setIsRankingExpanded(!isRankingExpanded)}
          className="flex w-full items-center justify-between text-xs font-bold text-slate-800 hover:text-teal-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info size={16} className="text-teal-700" /> How MediRoute ranked these hospitals (Ranking Logic Breakdown)
          </span>
          {isRankingExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isRankingExpanded && (
          <div className="mt-3 space-y-2 text-xs text-slate-600 border-t border-slate-200/70 pt-3 animate-fade-in">
            <p className="font-medium leading-relaxed">
              MediRoute calculates the <strong className="text-slate-900">MediRoute Match Score (0–100%)</strong> using a weighted 4-factor scoring model:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <span className="text-teal-700 font-bold block">1. Capability Match (50%)</span>
                <span>Verifies mandatory presence of ICU, Ventilators, Oxygen, Surgical suites, and Specialists.</span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <span className="text-teal-700 font-bold block">2. Bed & Resource Availability (25%)</span>
                <span>Prioritizes real-time available ICU beds and ready equipment over full capacity.</span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <span className="text-teal-700 font-bold block">3. Travel Time & Proximity (20%)</span>
                <span>Calculates actual driving time rather than simple straight-line map distance.</span>
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <span className="text-teal-700 font-bold block">4. Sync Freshness (5%)</span>
                <span>Rewards administrative verification updated within the last 15 minutes.</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Main Dashboard Layout: Map + Cards */}
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        {/* Leaflet Map Card */}
        <Card className="overflow-hidden space-y-0">
          <HospitalMap
            hospitals={hospitals}
            request={request}
            selected={selectedHospitalId || undefined}
            onSelect={(id) => {
              setSelectedHospitalId(id);
              const found = hospitals.find((h) => h.id === id);
              if (found) setDrawerHospital(found);
            }}
          />

          <div className="flex flex-wrap items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600 gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin size={14} className="text-teal-700" /> Interactive Status Markers:
            </span>
            <div className="flex items-center gap-3 font-bold">
              <span className="text-emerald-700">🟢 Full Match</span>
              <span className="text-amber-700">🟡 Partial Match</span>
              <span className="text-rose-600">🔴 Unsuitable</span>
            </div>
          </div>
        </Card>

        {/* Hospital Cards List */}
        <div className="space-y-3">
          {visibleHospitals.length > 0 ? (
            visibleHospitals.map((h) => (
              <HospitalCard
                key={h.id}
                h={h}
                request={request}
                onDetails={() => handleCardDetails(h)}
                isCompared={comparedHospitals.some((item) => item.id === h.id)}
                onCompareToggle={handleCompareToggle}
              />
            ))
          ) : (
            <EmptyState
              title="No facilities match current filter mode"
              body="Try switching to 'All Facilities' to inspect partial matches or update your capability requirements."
              onRetry={() => setFilterMode('all')}
            />
          )}
        </div>
      </div>

      {/* Floating Hospital Comparison Bar */}
      {comparedHospitals.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-slide-up">
          <div className="flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white shadow-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white font-bold">
                <Layers size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Hospital Comparison Selected</h4>
                <p className="text-xs text-slate-400">
                  {comparedHospitals.length} of 3 facilities queued for side-by-side analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => setIsCompareModalOpen(true)}
                className="text-xs py-2"
              >
                Compare ({comparedHospitals.length})
              </Button>
              <button
                onClick={() => setComparedHospitals([])}
                className="text-xs text-slate-400 hover:text-white px-2"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Right Drawer */}
      {activeDrawerHospital && (
        <HospitalDrawer
          hospital={activeDrawerHospital}
          request={request}
          onClose={() => {
            setDrawerHospital(null);
            setSelectedHospitalId(null);
          }}
          onCompareToggle={handleCompareToggle}
          isCompared={comparedHospitals.some((item) => item.id === activeDrawerHospital.id)}
        />
      )}

      {/* Comparison Modal */}
      {isCompareModalOpen && (
        <HospitalCompareModal
          hospitals={comparedHospitals}
          request={request}
          onClose={() => setIsCompareModalOpen(false)}
          onRemove={(id) => setComparedHospitals((prev) => prev.filter((h) => h.id !== id))}
        />
      )}

      {/* Bottom Actions */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
        <Button variant="secondary" onClick={() => nav('/caregiver/emergency')}>
          ← Back to Emergency Setup
        </Button>
        <Button onClick={() => nav('/caregiver/recommendation')} icon={<CheckCircle2 size={17} />}>
          View Top Recommended Match
        </Button>
      </div>
    </div>
  );
}
