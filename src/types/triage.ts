export type TriageMode = 'pediatric' | 'maternal' | 'chronic';

export type UrgencyTier = 'EMERGENCY' | 'HIGH_ALERT' | 'MODERATE' | 'LOW_HOME_CARE';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  altitude?: number | null;
  timestamp?: number;
}

export interface PatientProfile {
  id: string;
  name: string;
  mode: TriageMode;
  ageYears?: number;
  ageMonths?: number;
  locationZip?: string;
  locationCity?: string;
  locationCoordinates?: LocationCoordinates;
  isLiveTrackingLocation?: boolean;
  locationTrackingStatus?: 'idle' | 'locating' | 'tracking' | 'error';
  locationTrackingError?: string;
  pediatricSpecific?: {
    dob?: string;
    weightKg?: number;
    recentVaccine48h?: boolean;
    vaccineName?: string;
    allergies?: string[];
  };
  maternalSpecific?: {
    isPregnant: boolean;
    gestationalWeeks?: number;
    daysPostpartum?: number;
    priorComplications?: string[];
  };
  chronicSpecific?: {
    condition: string;
    baselineControl: 'well_controlled' | 'moderately_controlled' | 'poorly_controlled';
    medications: string[];
    baselineNotes?: string;
  };
}

export interface RedFlagRule {
  id: string;
  mode: TriageMode;
  title: string;
  clinicalCriteria: string;
  sourceProtocol: string;
  immediateAction: string;
  rationale: string;
}

export interface OutbreakSignal {
  id: string;
  pathogen: string;
  severity: string;
  affectedGroup: string;
  headline: string;
  source: string;
  dateReported: string;
  relevanceNote: string;
  symptomsMatched?: string[];
  clinicalAction?: string;
}

export interface CitationItem {
  id: string;
  title: string;
  authoritativeBody: string;
  sourceDoc: string;
  keyTakeaway: string;
  guidelineYear: string;
  mode: TriageMode;
}

export interface TriageResult {
  id: string;
  timestamp: string;
  mode: TriageMode;
  urgencyTier: UrgencyTier;
  isEmergency: boolean;
  redFlagsTriggered: string[];
  protocolMatched: string;
  candidateConsiderations: Array<{
    name: string;
    tier: string;
    rationale: string;
    isOutbreakLinked?: boolean;
    outbreakSource?: string;
    outbreakHeadline?: string;
  }>;
  // STRICT RULE: homeCareGuidance MUST be null/empty if UrgencyTier is HIGH_ALERT or EMERGENCY
  homeCareGuidance?: string[];
  clinicalEscalationNotice?: string;
  plainExplanation: {
    headline: string;
    whatItMeans: string;
    whatToDoNext: string;
    watchOutSigns: string[];
  };
  clinicalExplanation: {
    sbarSummary: string;
    protocolCode: string;
    pathophysiology: string;
    recommendedAction: string;
    vitalThresholds: string[];
  };
  citations: CitationItem[];
  outbreakSignal?: OutbreakSignal;
  outbreakSignals?: OutbreakSignal[];
  evaluationAudit: {
    protocolEngine: string;
    severityEnforced: boolean;
    timestamp: string;
    modePartition: string;
  };
}

export interface SymptomPayload {
  mode: TriageMode;
  primarySymptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  associatedSymptoms: string[];
  freeTextDescription: string;
  
  // Mode-specific measurements & inputs
  pediatricData?: {
    tempFahrenheit?: number;
    hydrationStatus: 'good_wet_diapers' | 'reduced_wet_diapers' | 'no_wet_diapers_8h' | 'crying_without_tears';
    alertness: 'normal_playful' | 'fussy_consolable' | 'lethargic_hard_to_wake';
    breathingEffort: 'normal' | 'fast_breathing' | 'rib_retractions_grunting' | 'stridor_blue_lips';
    stiffNeck: boolean;
    recentVaccine48h: boolean;
  };
  maternalData?: {
    isPostpartum: boolean;
    gestationalWeeks?: number;
    daysPostpartum?: number;
    severeHeadacheVisualAura: boolean;
    swellingFaceHands: boolean;
    vaginalBleedingAmount: 'none' | 'spotting' | 'soaking_one_pad_hourly';
    fetalMovementReduced: boolean;
    severeEpigastricPain: boolean;
    feverChillsPostpartum: boolean;
    systolicBP?: number;
    diastolicBP?: number;
  };
  chronicData?: {
    condition: string;
    baselineComparison: 'same_as_usual' | 'moderately_worse' | 'severely_worse_flare';
    bloodGlucoseMgDl?: number;
    ketonesPresent?: boolean;
    peakFlowZone?: 'green' | 'yellow' | 'red';
    systolicBP?: number;
    diastolicBP?: number;
    newMedicationStartedRecently: boolean;
    missedDoses: boolean;
  };
}
