export type Role = 'caregiver' | 'hospital_admin' | 'system_admin';

export type EmergencyType = 'Trauma' | 'Cardiac' | 'Respiratory' | 'General Emergency';

export type Capability =
  | 'ICU'
  | 'Ventilator'
  | 'Oxygen'
  | 'Emergency Department'
  | 'Surgery'
  | 'Blood'
  | 'Cardiology'
  | 'Neurology';

export type MatchStatus = 'full' | 'partial' | 'unsuitable';

/** Availability status for specific resources — Unknown when not verified from a reliable source. */
export type ResourceStatus = 'Available' | 'Unavailable' | 'Unknown';

/** Oxygen delivery system types available at a hospital. */
export type OxygenSystem = 'Central Oxygen' | 'Oxygen Cylinders' | 'Oxygen Concentrators' | 'Other';

/** Hospital category per Bangladesh DGHS classification. */
export type HospitalCategory = 'Government' | 'Private' | 'Medical College' | 'Specialized' | 'Diagnostic';

export type Hospital = {
  id: string;
  name: string;
  area: string;
  address?: string;
  lat: number;
  lng: number;
  distance: number; // km
  travelTime: number; // minutes
  verified: boolean;
  emergencyOpen: boolean;
  icu: { capacity: number; available: number };
  ventilator: { capacity: number; available: number };
  oxygen: 'Available' | 'Limited' | 'Unavailable';
  surgery: boolean;
  bloodBank: boolean;
  cardiology: boolean;
  neurology: boolean;
  lastUpdated: string;
  admin: string;
  phone: string;
  emergencyPhone?: string;
  bedCount?: number;
  matchScore?: number;
  matchStatus?: MatchStatus;
  matchReasons?: string[];
  ineligibleReasons?: string[];

  // ── Extended fields added for verified resource tracking ──
  /** Hospital category per DGHS classification */
  category?: HospitalCategory;
  /** Official hospital website URL */
  website?: string;
  /** Medical oxygen availability status (independent of real-time level) */
  oxygenStatus?: ResourceStatus;
  /** Oxygen delivery system(s) present at facility */
  oxygenSystems?: OxygenSystem[];
  /** Mechanical ventilator capability availability status */
  ventilatorStatus?: ResourceStatus;
  /** Confirmed number of mechanical ventilators (if officially reported) */
  ventilatorCount?: number;
  /** ICU facility availability status */
  icuStatus?: ResourceStatus;
  /** Emergency services availability */
  emergencyServices?: ResourceStatus;
  /** Source URL for resource claims (official website, DGHS, etc.) */
  sourceUrl?: string;
  /** ISO timestamp of last official verification */
  verificationTimestamp?: string;
  /** Verification notes (e.g., "Data from DGHS HRIS registry, October 2026") */
  verificationNote?: string;
};

export type EmergencyRequest = {
  type: EmergencyType;
  requirements: Capability[];
  targetBloodGroup?: string;
  location: {
    lat: number;
    lng: number;
    label: string;
  };
};

export type RecentSearch = {
  id: string;
  type: EmergencyType;
  requirements: Capability[];
  time: string;
  match: string;
  locationLabel: string;
};

export type Doctor = {
  id: string;
  nameEn: string;
  nameBn: string;
  specialtyBn: string;
  degreesEn: string;
  degreesBn: string;
  image: string;
  detailUrl: string;
  category?: string;
};

export type BloodDonor = {
  id: number;
  name: string;
  department: string;
  intakeType: string;
  semester: string;
  bloodGroup: string;
  phoneNumber: string;
};
