import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Hospital, EmergencyRequest } from '../types';
import { getMatchStatus, score } from '../services/matching';
import { useGPS } from '../context/GPSContext';
import { getDrivingRoute } from '../services/gps';

// Helper to render a resource status pill inside the popup HTML
function resourcePill(status: string | undefined): string {
  if (!status || status === 'Unknown')
    return `<span style="background:#f1f5f9;color:#64748b;padding:1px 7px;border-radius:9px;font-size:10px;font-weight:700;">Unknown</span>`;
  if (status === 'Available')
    return `<span style="background:#d1fae5;color:#065f46;padding:1px 7px;border-radius:9px;font-size:10px;font-weight:700;">✓ Available</span>`;
  return `<span style="background:#fee2e2;color:#991b1b;padding:1px 7px;border-radius:9px;font-size:10px;font-weight:700;">✗ Unavailable</span>`;
}

function phoneLink(phone: string | undefined, label: string): string {
  if (!phone || phone === 'Unknown') return `<span style="color:#94a3b8">${label}: Unknown</span>`;
  return `<a href="tel:${phone}" style="color:#0f766e;font-weight:700;text-decoration:none;">${label}: ${phone}</a>`;
}

export function HospitalMap({
  hospitals,
  request,
  selected,
  onSelect,
}: {
  hospitals: Hospital[];
  request?: EmergencyRequest;
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const gps = useGPS();

  const userLat = gps.coords.lat;
  const userLng = gps.coords.lng;
  const userAccuracy = gps.coords.accuracy || 12;

  useEffect(() => {
    if (!ref.current) return;

    // Use current user GPS coordinates as center
    const centerLat = userLat || request?.location.lat || 22.8378;
    const centerLng = userLng || request?.location.lng || 89.5403;

    const map = L.map(ref.current, { zoomControl: false }).setView([centerLat, centerLng], 13);
    mapInstanceRef.current = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors | MediRoute GPS',
      maxZoom: 19,
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    // ──────────────────────────────────────────
    // 1. Render User's Real GPS Location Marker
    // ──────────────────────────────────────────
    const userGpsIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(14, 165, 233, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position:relative; width:22px; height:22px; border-radius:50%; background:#0284c7; border:3px solid #ffffff; box-shadow:0 3px 12px rgba(2, 132, 199, 0.5); display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold;">
            📍
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const userMarker = L.marker([userLat, userLng], { icon: userGpsIcon, zIndexOffset: 1000 }).addTo(map);

    // Accuracy Circle
    const accuracyCircle = L.circle([userLat, userLng], {
      radius: Math.max(15, userAccuracy),
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.15,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);

    const userPopupContent = `
      <div style="font-family: Inter, system-ui, sans-serif; font-size: 12px; line-height: 1.4; width: 220px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          <span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;">
            📍 Live Real-time GPS Fix
          </span>
        </div>
        <b style="font-size:13px;color:#0f172a;display:block;margin-bottom:2px;">${gps.locationLabel}</b>
        <div style="font-family:monospace;font-size:11px;color:#64748b;margin-bottom:4px;">
          ${userLat.toFixed(5)}°N, ${userLng.toFixed(5)}°E
        </div>
        <div style="border-top:1px solid #e2e8f0;padding-top:4px;font-size:11px;color:#475569;">
          <span>Accuracy: ±${userAccuracy} meters</span><br/>
          <span>Speed: ${gps.speedKmh} km/h · Heading: ${gps.headingDegrees ?? 0}°</span>
        </div>
      </div>
    `;
    userMarker.bindPopup(userPopupContent);
    bounds.extend([userLat, userLng]);

    // ──────────────────────────────────────────
    // 2. Render Hospital Markers with Real-time Distances
    // ──────────────────────────────────────────
    hospitals.forEach((h) => {
      const matchStatus = request ? getMatchStatus(h, request) : 'full';
      const matchScore = request ? score(h, request) : 90;
      const isSelected = h.id === selected;

      bounds.extend([h.lat, h.lng]);

      const color =
        matchStatus === 'full'
          ? '#10b981'
          : matchStatus === 'partial'
          ? '#f59e0b'
          : '#f43f5e';

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            border-radius: 50%;
            background: ${color};
            border: 3px solid ${isSelected ? '#0f172a' : '#ffffff'};
            box-shadow: 0 4px 14px rgba(15,23,42,0.3);
            display: grid;
            place-items: center;
            color: white;
            font-weight: 800;
            font-size: ${isSelected ? '13px' : '11px'};
            transition: all 0.2s ease;
          ">
            ${isSelected ? '★' : `${matchScore}%`}
          </div>
        `,
        iconSize: isSelected ? [38, 38] : [32, 32],
        iconAnchor: isSelected ? [19, 19] : [16, 16],
      });

      const matchLabel =
        matchStatus === 'full' ? '🟢 Full Match' : matchStatus === 'partial' ? '🟡 Partial Match' : '🔴 Unsuitable';
      const categoryLabel = h.category || 'Hospital';

      const oxygenSystemsText =
        h.oxygenSystems && h.oxygenSystems.length > 0
          ? h.oxygenSystems.join(', ')
          : 'Not specified';

      const websiteLink = h.website
        ? `<a href="${h.website}" target="_blank" rel="noopener noreferrer" style="color:#0f766e;font-weight:700;text-decoration:none;">🌐 Official Website</a>`
        : `<span style="color:#94a3b8">Website: Not available</span>`;

      // Google Maps navigation with real GPS origin to hospital destination
      const googleMapsLink = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${h.lat},${h.lng}&travelmode=driving`;

      const verifiedBadge = h.verified
        ? `<span style="background:#d1fae5;color:#065f46;padding:1px 8px;border-radius:9px;font-size:10px;font-weight:700;">✓ Verified</span>`
        : `<span style="background:#fef3c7;color:#92400e;padding:1px 8px;border-radius:9px;font-size:10px;font-weight:700;">⚠ Pending Verification</span>`;

      const popupContent = `
        <div style="font-family: Inter, system-ui, sans-serif; font-size: 12px; line-height: 1.5; width: 280px; max-width: 290px;">
          <!-- Header -->
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">
              ${verifiedBadge}
              <span style="background:#f1f5f9;color:#475569;padding:1px 7px;border-radius:9px;font-size:10px;font-weight:600;">${categoryLabel}</span>
            </div>
            <b style="font-size:14px;color:#0f172a;display:block;line-height:1.3;margin-bottom:2px;">${h.name}</b>
            <span style="color:${color};font-weight:700;font-size:11px;">${matchLabel} (${matchScore}%)</span>
          </div>

          <!-- Real-Time Distance from Current Location -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:7px 9px;margin-bottom:8px;">
            <div style="color:#166534;font-weight:700;font-size:12px;display:flex;justify-content:space-between;align-items:center;">
              <span>🚗 ${h.distance.toFixed(1)} km driving</span>
              <span>⚡ ~${h.travelTime} min ETA</span>
            </div>
            <div style="color:#15803d;font-size:10px;margin-top:2px;">
              Calculated dynamically from your live GPS coordinates
            </div>
          </div>

          <div style="margin-bottom:8px;">
            <div style="color:#475569;margin-bottom:3px;">📍 ${h.address || h.area}</div>
          </div>

          <!-- Contacts -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px;margin-bottom:8px;display:flex;flex-direction:column;gap:4px;">
            ${phoneLink(h.phone, '📞 Main')}
            ${h.emergencyPhone ? phoneLink(h.emergencyPhone, '🆘 Emergency') : '<span style="color:#94a3b8;font-size:11px;">Emergency line: Not available</span>'}
          </div>

          <!-- Resources -->
          <div style="margin-bottom:8px;">
            <div style="font-weight:700;color:#374151;margin-bottom:5px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Resource Status</div>
            <table style="width:100%;border-collapse:collapse;font-size:11px;">
              <tr>
                <td style="padding:2px 0;color:#64748b;">Oxygen</td>
                <td style="padding:2px 0;text-align:right;">${resourcePill(h.oxygenStatus)}</td>
              </tr>
              <tr>
                <td style="padding:2px 0;color:#64748b;">O₂ Systems</td>
                <td style="padding:2px 0;text-align:right;color:#374151;font-size:10px;">${oxygenSystemsText}</td>
              </tr>
              <tr>
                <td style="padding:2px 0;color:#64748b;">Ventilators</td>
                <td style="padding:2px 0;text-align:right;">${resourcePill(h.ventilatorStatus)}</td>
              </tr>
              <tr>
                <td style="padding:2px 0;color:#64748b;">ICU</td>
                <td style="padding:2px 0;text-align:right;">${resourcePill(h.icuStatus)}</td>
              </tr>
              <tr>
                <td style="padding:2px 0;color:#64748b;">Emergency Dept</td>
                <td style="padding:2px 0;text-align:right;">
                  ${h.emergencyOpen
                    ? '<span style="background:#d1fae5;color:#065f46;padding:1px 7px;border-radius:9px;font-size:10px;font-weight:700;">Open 24/7</span>'
                    : '<span style="background:#fee2e2;color:#991b1b;padding:1px 7px;border-radius:9px;font-size:10px;font-weight:700;">Closed</span>'
                  }
                </td>
              </tr>
            </table>
          </div>

          <!-- Links Row -->
          <div style="display:flex;gap:8px;align-items:center;border-top:1px solid #e2e8f0;padding-top:8px;flex-wrap:wrap;">
            ${websiteLink}
            <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer"
               style="background:#0f766e;color:white;padding:3px 10px;border-radius:6px;font-weight:700;text-decoration:none;margin-left:auto;display:inline-flex;align-items:center;gap:4px;font-size:11px;">
              🗺 Live Turn-by-Turn
            </a>
          </div>

          <!-- Verification note -->
          <div style="margin-top:6px;color:#94a3b8;font-size:10px;line-height:1.4;border-top:1px solid #f1f5f9;padding-top:6px;">
            🕐 Last updated: ${h.lastUpdated}
            ${!h.verified ? '<br>⚠ Data unverified — contact hospital directly.' : ''}
          </div>
        </div>
      `;

      L.marker([h.lat, h.lng], { icon })
        .addTo(map)
        .on('click', () => onSelect(h.id))
        .bindPopup(popupContent, {
          maxWidth: 310,
          className: 'mediroute-popup',
        });
    });

    // ──────────────────────────────────────────
    // 3. Draw Route Polyline from GPS to Selected Hospital
    // ──────────────────────────────────────────
    const targetHospital = hospitals.find((h) => h.id === selected) || (hospitals.length > 0 ? hospitals[0] : null);

    if (targetHospital) {
      getDrivingRoute(userLat, userLng, targetHospital.lat, targetHospital.lng).then((route) => {
        if (!mapInstanceRef.current) return;

        if (routePolylineRef.current) {
          mapInstanceRef.current.removeLayer(routePolylineRef.current);
        }

        const polylineCoords = route.geometry || [
          [userLat, userLng],
          [targetHospital.lat, targetHospital.lng],
        ];

        const polyline = L.polyline(polylineCoords, {
          color: '#0d9488',
          weight: 5,
          opacity: 0.85,
          dashArray: route.source === 'haversine-model' ? '6, 6' : undefined,
        }).addTo(mapInstanceRef.current);

        polyline.bindTooltip(
          `🚗 ${route.distanceKm} km · ${route.durationMins} mins to ${targetHospital.name.split('(')[0]}`,
          {
            permanent: true,
            direction: 'center',
            className: 'bg-teal-900 text-white font-bold text-xs px-2 py-1 rounded shadow-md border border-teal-500',
          }
        );

        routePolylineRef.current = polyline;
      });
    }

    if (hospitals.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [hospitals, request, selected, onSelect, userLat, userLng, userAccuracy, gps.speedKmh, gps.headingDegrees, gps.locationLabel]);

  const handleCenterOnGPS = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLat, userLng], 14, { animate: true });
    }
  };

  return (
    <div className="relative h-[430px] w-full overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xs">
      <div ref={ref} className="h-full w-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
        <button
          onClick={handleCenterOnGPS}
          className="flex items-center gap-1.5 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-slate-800 shadow-md backdrop-blur hover:bg-white hover:text-teal-700 transition border border-slate-200/80 active:scale-95"
          title="Recenter Map on Real GPS Location"
        >
          <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
          <span>🎯 My Location</span>
        </button>
      </div>

      {/* Bottom overlay status */}
      <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 rounded-xl bg-slate-900/80 backdrop-blur-md px-3 py-1.5 text-xs text-white shadow-lg pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold">Live GPS Active:</span>
        <span className="text-slate-300 font-mono">
          {userLat.toFixed(4)}, {userLng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
