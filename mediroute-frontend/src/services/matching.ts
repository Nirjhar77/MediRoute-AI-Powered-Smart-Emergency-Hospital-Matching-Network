import type { Capability, EmergencyRequest, Hospital, MatchStatus } from '../types';

/**
 * Evaluates whether a hospital meets all requirements in the request.
 */
export const checkCapability = (h: Hospital, req: Capability): boolean => {
  switch (req) {
    case 'Emergency Department':
      return h.emergencyOpen;
    case 'ICU':
      return h.icu.available > 0;
    case 'Ventilator':
      return h.ventilator.available > 0;
    case 'Oxygen':
      return h.oxygen === 'Available';
    case 'Surgery':
      return !!h.surgery;
    case 'Blood':
      return !!h.bloodBank;
    case 'Cardiology':
      return !!h.cardiology;
    case 'Neurology':
      return !!h.neurology;
    default:
      return true;
  }
};

/**
 * Evaluates detailed reason per capability.
 */
export const reasons = (h: Hospital, req: EmergencyRequest) => {
  return req.requirements.map((r) => ({
    label: r,
    ok: checkCapability(h, r),
  }));
};

/**
 * Determines match status: full, partial, or unsuitable.
 */
export const getMatchStatus = (h: Hospital, req: EmergencyRequest): MatchStatus => {
  const evaluations = reasons(h, req);
  const total = evaluations.length;
  const passed = evaluations.filter((e) => e.ok).length;

  if (!h.emergencyOpen) return 'unsuitable';
  if (passed === total) return 'full';
  if (passed >= Math.max(1, total - 2)) return 'partial';
  return 'unsuitable';
};

/**
 * Calculates MediRoute Match Score (0 - 100%)
 * Prioritizes: Capability Match (50%) -> Availability (25%) -> Travel Time & Distance (25%)
 */
export const score = (h: Hospital, req: EmergencyRequest): number => {
  if (!h.emergencyOpen) return 15; // Low baseline if ED closed

  const evals = reasons(h, req);
  const capScore = (evals.filter((e) => e.ok).length / (evals.length || 1)) * 50;

  // Resource availability bonus
  const icuBonus = Math.min(10, h.icu.available * 2);
  const ventBonus = Math.min(8, h.ventilator.available * 2);
  const oxyBonus = h.oxygen === 'Available' ? 7 : h.oxygen === 'Limited' ? 3 : 0;
  const availabilityScore = icuBonus + ventBonus + oxyBonus; // Max 25

  // Proximity & Travel time score (Max 20)
  const travelTimeScore = Math.max(0, 15 - h.travelTime * 0.6);
  const distanceScore = Math.max(0, 10 - h.distance * 1.5);
  const proximityScore = travelTimeScore + distanceScore;

  // Verification freshness bonus (Max 5)
  const freshnessScore = h.verified ? 5 : 0;

  const total = Math.round(capScore + availabilityScore + proximityScore + freshnessScore);
  return Math.min(99, Math.max(10, total));
};

/**
 * Ranks hospitals based on capability match -> availability -> travel time -> distance
 */
export const rank = (hospitals: Hospital[], req: EmergencyRequest): Hospital[] => {
  return [...hospitals]
    .map((h) => ({
      ...h,
      matchStatus: getMatchStatus(h, req),
      matchScore: score(h, req),
      matchReasons: reasons(h, req)
        .filter((r) => r.ok)
        .map((r) => `${r.label} verified`),
      ineligibleReasons: reasons(h, req)
        .filter((r) => !r.ok)
        .map((r) => `${r.label} unavailable`),
    }))
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
};

/**
 * Generates "Why this hospital was recommended" explanation with clinical & blood group details.
 */
export const getRecommendationRationale = (h: Hospital, req: EmergencyRequest): string => {
  const status = getMatchStatus(h, req);
  const bloodInfo = req.targetBloodGroup ? ` (Patient Target Blood Group: ${req.targetBloodGroup})` : '';

  if (status === 'full') {
    return `${h.name} satisfies 100% of required clinical capabilities including ${req.requirements.join(', ')}${bloodInfo} with an estimated travel time of ${h.travelTime} mins.`;
  }
  if (status === 'partial') {
    const missing = reasons(h, req)
      .filter((r) => !r.ok)
      .map((r) => r.label);
    return `Provides immediate emergency triage and partial capabilities (${h.travelTime} mins away). Missing: ${missing.join(', ')}.`;
  }
  return `Emergency Department currently closed or lacks critical infrastructure required for this ${req.type} request.`;
};

/**
 * Generates "Why not the nearest hospital?" explanation.
 */
export const getWhyNotNearestRationale = (
  hospitals: Hospital[],
  req: EmergencyRequest
): {
  nearest: Hospital;
  topRecommended: Hospital;
  explanation: string;
} | null => {
  if (!hospitals.length) return null;

  const sortedByDistance = [...hospitals].sort((a, b) => a.distance - b.distance);
  const nearest = sortedByDistance[0];
  const ranked = rank(hospitals, req);
  const topRecommended = ranked[0];

  if (!nearest || !topRecommended || nearest.id === topRecommended.id) {
    return null; // Nearest IS the top recommended!
  }

  const missingRequirements = reasons(nearest, req)
    .filter((r) => !r.ok)
    .map((r) => r.label);
  let reasonText = '';

  if (!nearest.emergencyOpen) {
    reasonText = `its Emergency Department is currently closed.`;
  } else if (missingRequirements.length > 0) {
    reasonText = `it currently lacks required clinical capabilities: ${missingRequirements.join(', ')}.`;
  } else {
    reasonText = `it has lower resource availability compared to ${topRecommended.name}.`;
  }

  const explanation = `${nearest.name} is closest (${nearest.distance} km / ${nearest.travelTime} mins), but was bypassed because ${reasonText} Routing was directed to ${topRecommended.name} (${topRecommended.travelTime} mins) for patient safety under ${req.type} emergency guidelines.`;

  return {
    nearest,
    topRecommended,
    explanation,
  };
};

export const isEligible = (h: Hospital, req: EmergencyRequest): boolean => {
  return getMatchStatus(h, req) === 'full';
};

export const capabilityLabel = (r: Capability): string => r;
