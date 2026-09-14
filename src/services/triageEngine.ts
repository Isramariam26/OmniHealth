import {
  TriageMode,
  UrgencyTier,
  PatientProfile,
  SymptomPayload,
  TriageResult,
  OutbreakSignal,
  CitationItem
} from '../types/triage';
import {
  RED_FLAG_RULES,
  KNOWLEDGE_BASE_CITATIONS,
  OUTBREAK_SIGNALS_FEED
} from '../data/protocols';

/**
 * Step 2: Red-flag & Emergency Detection Layer
 * Runs first before any other processing. Hardcoded, clinical tripwires.
 */
export function evaluateRedFlags(
  profile: PatientProfile,
  payload: SymptomPayload
): { isEmergency: boolean; triggeredFlags: string[]; rationale: string; action: string } {
  const triggered: string[] = [];
  let rationale = '';
  let action = 'Call 911 or proceed to the nearest Emergency Department immediately.';

  if (payload.mode === 'pediatric') {
    const ageMonths = profile.ageMonths ?? (profile.ageYears ? profile.ageYears * 12 : 12);
    const tempF = payload.pediatricData?.tempFahrenheit || 0;
    const breathing = payload.pediatricData?.breathingEffort;
    const alertness = payload.pediatricData?.alertness;
    const stiffNeck = payload.pediatricData?.stiffNeck;

    // Rule 1: Infant under 3 months with fever >= 100.4°F
    if (ageMonths <= 3 && tempF >= 100.4) {
      triggered.push('Neonatal / Infant Fever (< 3 Months)');
      rationale = 'Infants under 90 days old have immature immune defenses and lack a fully developed blood-brain barrier. Any documented temperature ≥ 100.4°F mandates immediate pediatric emergency workup to rule out systemic bacterial infection (neonatal sepsis).';
      action = 'Go to the nearest Pediatric Emergency Department immediately.';
    }

    // Rule 2: Severe Respiratory Distress
    if (breathing === 'stridor_blue_lips' || breathing === 'rib_retractions_grunting') {
      triggered.push('Severe Pediatric Respiratory Distress / Stridor');
      rationale = 'Audible stridor at rest, cyanosis/blue lips, or severe intercostal retractions indicate impending airway obstruction or respiratory muscle exhaustion.';
      action = 'Call 911 immediately. Keep child calm and upright; do not lay flat.';
    }

    // Rule 3: Unresponsive or Meningismus
    if (alertness === 'lethargic_hard_to_wake' || stiffNeck) {
      triggered.push('Lethargy / Suspected Meningismus');
      rationale = 'Extreme lethargy (unresponsive or difficult to arouse) or nuchal rigidity with fever are emergency indicators of central nervous system infection (meningitis).';
      action = 'Call 911 or proceed immediately to the Emergency Room.';
    }
  } else if (payload.mode === 'adult') {
    const adultData = payload.adultData;
    const tempF = adultData?.tempFahrenheit || 0;

    // Rule 1: Acute Coronary Syndrome (ACS) / Cardiac Emergency
    if (
      adultData?.chestPainType === 'crushing_radiating' ||
      (adultData?.chestPainType === 'pressure_tightness' && adultData?.breathingDifficulty === 'at_rest_severe')
    ) {
      triggered.push('Acute Coronary Syndrome (ACS) / Ischemic Chest Pain');
      rationale = 'Crushing substernal chest discomfort or chest pressure radiating to arm/jaw or accompanied by severe dyspnea represents a high-probability cardiac emergency requiring immediate 12-lead ECG, troponin, and cath lab readiness.';
      action = 'Call 911 immediately. Rest quietly and chew non-enteric aspirin if cleared by emergency dispatch.';
    }

    // Rule 2: Acute Stroke / Neurological Deficit (FAST)
    if (
      adultData?.facialDroopOrArmWeakness ||
      adultData?.slurredSpeechOrConfusion ||
      adultData?.suddenThunderclapHeadache
    ) {
      triggered.push('Acute Stroke / Sudden Neurological Deficit');
      rationale = 'Sudden unilateral facial droop, arm weakness, speech difficulty, or thunderclap headache indicates emergent cerebrovascular accident or intracranial hemorrhage requiring emergent non-contrast head CT and stroke team activation.';
      action = 'Call 911 immediately. Note the exact time symptoms started for acute thrombolytic window.';
    }

    // Rule 3: Severe Sepsis / Acute Systemic Compromise
    if (
      (tempF >= 103.0 && adultData?.slurredSpeechOrConfusion) ||
      (adultData?.breathingDifficulty === 'at_rest_severe' && tempF >= 102.0)
    ) {
      triggered.push('Severe Sepsis / Acute Systemic Compromise');
      rationale = 'High fever combined with altered mentation or severe respiratory distress fulfills critical systemic inflammatory response/qSOFA criteria with high risk for rapid clinical deterioration.';
      action = 'Go to the nearest Emergency Department immediately.';
    }

    // Rule 4: Hypertensive Crisis in Adult
    if (
      (adultData?.systolicBP && adultData.systolicBP >= 180) ||
      (adultData?.diastolicBP && adultData.diastolicBP >= 120)
    ) {
      triggered.push('Hypertensive Crisis (BP ≥ 180/120)');
      rationale = 'Marked systolic pressure ≥ 180 mmHg or diastolic ≥ 120 mmHg presents immediate danger for acute intracranial hemorrhage, dissecting aortic aneurysm, or acute coronary syndrome.';
      action = 'Call 911 or proceed to the nearest Emergency Department immediately.';
    }
  } else if (payload.mode === 'maternal') {
    const matData = payload.maternalData;

    // Rule 1: Preeclampsia / Eclampsia Red Flags
    if (
      matData?.severeHeadacheVisualAura ||
      matData?.severeEpigastricPain ||
      (matData?.systolicBP && matData.systolicBP >= 160) ||
      (matData?.diastolicBP && matData.diastolicBP >= 110)
    ) {
      triggered.push('Severe Hypertensive Disorder / Preeclampsia Red Flags');
      rationale = 'Severe sudden headache with visual changes, epigastric/RUQ pain, or blood pressure ≥ 160/110 are acute markers of preeclampsia with severe features, posing severe risk of eclamptic seizure, placental abruption, or stroke.';
      action = 'Proceed to the nearest Labor & Delivery Triage or Emergency Department immediately.';
    }

    // Rule 2: Severe Obstetric Hemorrhage
    if (matData?.vaginalBleedingAmount === 'soaking_one_pad_hourly') {
      triggered.push('Severe Obstetric Hemorrhage');
      rationale = 'Soaking through one or more maxi pads an hour for consecutive hours indicates acute hemorrhage requiring urgent clinical evaluation and hemodynamic stabilization.';
      action = 'Proceed immediately to Labor & Delivery Emergency or call 911.';
    }

    // Rule 3: Decreased Fetal Movement
    if (
      !matData?.isPostpartum &&
      (matData?.gestationalWeeks ?? 0) >= 26 &&
      matData?.fetalMovementReduced
    ) {
      triggered.push('Marked Decreased Fetal Movement');
      rationale = 'Significant drop in fetal movement in the late 2nd or 3rd trimester warrants immediate non-stress testing (NST) or biophysical profile to evaluate placental perfusion and fetal well-being.';
      action = 'Contact Labor & Delivery / OB On-Call and go in for immediate fetal monitoring.';
    }
  } else if (payload.mode === 'chronic') {
    const chrData = payload.chronicData;

    // Rule 1: DKA / Severe Hyperglycemia
    if (
      (chrData?.bloodGlucoseMgDl && chrData.bloodGlucoseMgDl > 300 && chrData.ketonesPresent) ||
      (chrData?.bloodGlucoseMgDl && chrData.bloodGlucoseMgDl > 450)
    ) {
      triggered.push('Diabetic Ketoacidosis (DKA) / Hyperosmolar Emergency');
      rationale = 'Severe hyperglycemia exceeding 300 mg/dL with ketones signifies life-threatening metabolic acidosis with severe electrolyte derangement and dehydration.';
      action = 'Go to the nearest Emergency Department immediately for IV fluid and insulin titration.';
    }

    // Rule 2: Asthma Red Zone
    if (chrData?.peakFlowZone === 'red') {
      triggered.push('Asthma / COPD Exacerbation (Red Zone)');
      rationale = 'Peak expiratory flow < 50% of personal best with severe dyspnea indicates acute critical airflow obstruction unresponsive to basic rescue measures.';
      action = 'Call 911 immediately. Take 4 puffs of rescue albuterol every 20 minutes while awaiting paramedics.';
    }

    // Rule 3: Hypertensive Crisis
    if (
      (chrData?.systolicBP && chrData.systolicBP >= 180) ||
      (chrData?.diastolicBP && chrData.diastolicBP >= 120)
    ) {
      triggered.push('Hypertensive Crisis (BP ≥ 180/120)');
      rationale = 'Blood pressure in crisis range carries immediate risk of hemorrhagic stroke, acute coronary syndrome, or aortic dissection.';
      action = 'Seek emergency medical attention immediately.';
    }
  }

  return {
    isEmergency: triggered.length > 0,
    triggeredFlags: triggered,
    rationale,
    action
  };
}

/**
 * Main Triage Pipeline Function
 */
export async function runTriagePipeline(
  profile: PatientProfile,
  payload: SymptomPayload
): Promise<TriageResult> {
  const timestamp = new Date().toISOString();
  const id = `triage-${Date.now()}`;

  // STEP 2: Red-Flag / Emergency Layer (Runs FIRST)
  const redFlagCheck = evaluateRedFlags(profile, payload);

  if (redFlagCheck.isEmergency) {
    const relevantCitations = KNOWLEDGE_BASE_CITATIONS.filter(
      (c) => c.mode === payload.mode
    );

    return {
      id,
      timestamp,
      mode: payload.mode,
      urgencyTier: 'EMERGENCY',
      isEmergency: true,
      redFlagsTriggered: redFlagCheck.triggeredFlags,
      protocolMatched: 'Hardcoded Clinical Red-Flag Protocol (AAP / ACOG / ADA Emergency Safeguard)',
      candidateConsiderations: [
        {
          name: redFlagCheck.triggeredFlags[0] || 'Acute Clinical Emergency',
          tier: 'Emergency Medical Threshold',
          rationale: redFlagCheck.rationale
        }
      ],
      // STRICT RULE: No home care remedies permitted at Emergency Tier!
      homeCareGuidance: undefined,
      clinicalEscalationNotice: redFlagCheck.action,
      plainExplanation: {
        headline: '🚨 Emergency Medical Care Required Immediately',
        whatItMeans: `We noticed symptoms that need an in-person doctor right away: ${redFlagCheck.triggeredFlags.join(', ')}.`,
        whatToDoNext: redFlagCheck.action,
        watchOutSigns: [
          'Difficulty breathing or skin turning pale/blue',
          'Inability to drink or keep fluids down',
          'Sudden confusion, dizziness, or collapse',
          'Severe pain that gets rapidly worse'
        ]
      },
      clinicalExplanation: {
        sbarSummary: `SBAR: Critical Red-Flag Triggered in ${payload.mode.toUpperCase()} triage. ${redFlagCheck.triggeredFlags.join('; ')}. Immediate emergency stabilization recommended.`,
        protocolCode: `EMERG-${payload.mode.toUpperCase()}-01`,
        pathophysiology: redFlagCheck.rationale,
        recommendedAction: redFlagCheck.action,
        vitalThresholds: ['Protocol tripwire reached - immediate ED transfer.']
      },
      citations: relevantCitations,
      evaluationAudit: {
        protocolEngine: 'OmniHealth AI Clinical Decision Engine v2.4 (Hardcoded Safety Layer)',
        severityEnforced: true,
        timestamp,
        modePartition: payload.mode
      }
    };
  }

  // STEP 3 & 4: Normalization & Triage Reasoning Layer
  let urgencyTier: UrgencyTier = 'MODERATE';
  let protocolCode = 'ST-GEN-01';
  let protocolName = 'Clinical Triage Evaluation';
  let candidateConsiderations: TriageResult['candidateConsiderations'] = [];
  let homeCareGuidance: string[] | undefined = undefined;
  let clinicalEscalationNotice: string | undefined = undefined;

  // STEP 5: Context Enrichment (Vaccines, Trimester, Chronic Flare)
  let vaccineEnrichmentNote = '';
  let trimesterEnrichmentNote = '';
  let chronicEnrichmentNote = '';

  if (payload.mode === 'pediatric') {
    const ageMonths = profile.ageMonths ?? (profile.ageYears ? profile.ageYears * 12 : 12);
    const tempF = payload.pediatricData?.tempFahrenheit ?? 98.6;
    const recentVaccine = payload.pediatricData?.recentVaccine48h;
    const hydration = payload.pediatricData?.hydrationStatus;

    if (recentVaccine && tempF >= 100.4 && tempF < 102.5 && hydration === 'good_wet_diapers') {
      // Expected benign vaccine reaction
      urgencyTier = 'LOW_HOME_CARE';
      protocolCode = 'ST-PED-VAX-02';
      protocolName = 'Schmitt-Thompson Pediatric Protocol: Post-Immunization Fever';
      vaccineEnrichmentNote = 'Recent vaccination within 48 hours is documented. Mild-to-moderate fever without respiratory or hydration concerns is an expected immunogenic response.';
      candidateConsiderations = [
        {
          name: 'Expected Post-Vaccination Fever Response',
          tier: 'Low Urgency / Self-Limiting',
          rationale: 'Infant received childhood vaccines in the last 48 hours, is drinking fluids normally, and exhibits no red flags.'
        }
      ];
      homeCareGuidance = [
        'Offer frequent nursing, formula, or balanced fluids to maintain hydration.',
        'Dress child in a single layer of lightweight, breathable clothing. Never overbundle or use cold alcohol baths.',
        'If child is visibly fussy or uncomfortable, discuss age- and weight-based acetaminophen dosing with your pediatrician.',
        'Monitor temperature every 4–6 hours; call pediatrician if fever persists past 48 hours or climbs over 102.5°F.'
      ];
    } else if (tempF >= 102.0 || hydration === 'no_wet_diapers_8h' || payload.severity === 'severe') {
      urgencyTier = 'HIGH_ALERT';
      protocolCode = 'ST-PED-FEV-HIGH';
      protocolName = 'Schmitt-Thompson Pediatric Protocol: High Pyrexia / Dehydration Risk';
      candidateConsiderations = [
        {
          name: 'Acute Pediatric Febrile Illness with Moderate Dehydration Risk',
          tier: 'High Alert',
          rationale: 'High fever (≥102°F) or significantly reduced urinary output (no wet diapers in 8+ hours) warrants timely pediatric examination.'
        }
      ];
      clinicalEscalationNotice = 'Contact your pediatrician immediately or visit urgent pediatric care today.';
      // STRICT SAFETY RULE: NEVER SUGGEST HOME REMEDIES IN HIGH ALERT!
      homeCareGuidance = undefined;
    } else if (tempF >= 100.4 || payload.severity === 'moderate') {
      urgencyTier = 'MODERATE';
      protocolCode = 'ST-PED-FEV-MOD';
      protocolName = 'Schmitt-Thompson Pediatric Protocol: Childhood Fever Evaluation';
      candidateConsiderations = [
        {
          name: 'Viral Upper Respiratory / Mild Febrile Syndrome',
          tier: 'Moderate Concern',
          rationale: 'Child is active with mild fever and adequate hydration, but symptoms warrant provider check-in within 24 hours.'
        }
      ];
      clinicalEscalationNotice = 'Call your pediatrician today for guidance and appointment scheduling.';
    } else {
      urgencyTier = 'LOW_HOME_CARE';
      protocolCode = 'ST-PED-COLD-01';
      protocolName = 'AAP Pediatric Protocol: Mild Upper Respiratory Symptoms';
      candidateConsiderations = [
        {
          name: 'Uncomplicated Viral Rhinovirus / Mild Cold',
          tier: 'Low Urgency',
          rationale: 'Normal hydration, playful behavior, and absence of fever or breathing distress.'
        }
      ];
      homeCareGuidance = [
        'Use gentle saline nasal drops or spray followed by bulb suction before feedings and sleep.',
        'Run a cool-mist humidifier in the child’s room to soothe airway passages.',
        'Ensure continuous hydration with breastmilk, formula, or small sips of water for older children.',
        'Allow extra rest and monitor for any emergence of fever, rapid breathing, or ear pulling.'
      ];
    }
  } else if (payload.mode === 'adult') {
    const adultData = payload.adultData;
    const tempF = adultData?.tempFahrenheit ?? 98.6;
    const chest = adultData?.chestPainType;
    const breathing = adultData?.breathingDifficulty;
    const severeAbdomen = adultData?.severeAbdominalPain;

    if (
      payload.severity === 'severe' ||
      chest === 'pressure_tightness' ||
      breathing === 'at_rest_severe' ||
      severeAbdomen ||
      tempF >= 103.0 ||
      (adultData?.systolicBP && adultData.systolicBP >= 160)
    ) {
      urgencyTier = 'HIGH_ALERT';
      protocolCode = 'ACEP-ADULT-HIGH-ALERT';
      protocolName = 'ACEP / AHA Adult Clinical Triage Protocol: High Alert Evaluation';
      candidateConsiderations = [
        {
          name: severeAbdomen
            ? 'Acute Abdomen / Severe Visceral Pathology'
            : chest === 'pressure_tightness'
            ? 'Cardiopulmonary Symptom Evaluation (Rule out ACS/PE)'
            : 'Acute Adult Febrile or Cardiorespiratory Illness',
          tier: 'High Alert',
          rationale: 'Symptoms exceed safe outpatient self-management thresholds. Same-day clinical assessment, diagnostic vitals, and workup are required.'
        }
      ];
      clinicalEscalationNotice = 'Contact your primary care physician immediately today or visit an urgent care center.';
      homeCareGuidance = undefined;
    } else if (
      tempF >= 100.4 ||
      payload.severity === 'moderate' ||
      breathing === 'on_exertion' ||
      chest === 'mild_sharp'
    ) {
      urgencyTier = 'MODERATE';
      protocolCode = 'ACP-ADULT-ACUTE-02';
      protocolName = 'ACP Adult Acute Care Protocol: Outpatient Evaluation';
      candidateConsiderations = [
        {
          name: 'Viral Respiratory Syndrome / Acute Bronchial or Musculoskeletal Strain',
          tier: 'Moderate Concern',
          rationale: 'Moderate symptom severity without acute cardiopulmonary red flags. Provider evaluation recommended within 24 to 48 hours.'
        }
      ];
      clinicalEscalationNotice = 'Contact your primary care clinic or advice nurse within 24 hours.';
    } else {
      urgencyTier = 'LOW_HOME_CARE';
      protocolCode = 'CDC-ADULT-SELF-CARE';
      protocolName = 'ACP / CDC Adult Self-Management Protocol: Viral Upper Respiratory Illness';
      candidateConsiderations = [
        {
          name: 'Mild Viral Upper Respiratory Syndrome / Routine Malaise',
          tier: 'Low Urgency',
          rationale: 'Absence of high fever, normal breathing at rest, and mild self-limiting presentation.'
        }
      ];
      homeCareGuidance = [
        'Prioritize rest and maintain generous oral hydration (water, warm broths, herbal teas).',
        'Over-the-counter pain or fever relievers (such as acetaminophen or ibuprofen) may be used according to package directions if needed.',
        'Use saline nasal rinses or steam inhalation to alleviate upper airway congestion.',
        'Monitor for red flags such as chest pain, difficulty breathing, or fever exceeding 102°F.'
      ];
    }
  } else if (payload.mode === 'maternal') {
    const matData = payload.maternalData;
    const isPostpartum = matData?.isPostpartum;
    const weeks = matData?.gestationalWeeks ?? 20;

    if (matData?.feverChillsPostpartum) {
      urgencyTier = 'HIGH_ALERT';
      protocolCode = 'ACOG-POSTPARTUM-FEVER';
      protocolName = 'ACOG Clinical Guidelines: Puerperal Infection / Endometritis Evaluation';
      candidateConsiderations = [
        {
          name: 'Suspected Postpartum Uterine or Surgical Site Infection',
          tier: 'High Alert',
          rationale: 'Postpartum fever with pelvic tenderness or lochia changes requires immediate clinical exam to rule out endometritis, mastitis, or thrombophlebitis.'
        }
      ];
      clinicalEscalationNotice = 'Contact your OB-GYN or midwife immediately today. Do not wait.';
      homeCareGuidance = undefined;
    } else if (payload.severity === 'severe' || matData?.swellingFaceHands) {
      urgencyTier = 'HIGH_ALERT';
      protocolCode = 'ACOG-PB-222-SURVEILLANCE';
      protocolName = 'ACOG Practice Bulletin 222: Gestational Hypertension Evaluation';
      candidateConsiderations = [
        {
          name: 'Emerging Gestational Hypertensive Disorder',
          tier: 'High Alert',
          rationale: 'Sudden onset facial/hand edema and elevated blood pressure require immediate clinical blood pressure recheck and urine protein testing.'
        }
      ];
      clinicalEscalationNotice = 'Contact your prenatal care provider or OB triage unit immediately.';
      homeCareGuidance = undefined;
    } else if (payload.severity === 'moderate') {
      urgencyTier = 'MODERATE';
      protocolCode = 'ACOG-ANTE-04';
      protocolName = 'ACOG Maternal Symptom Triage Protocol';
      candidateConsiderations = [
        {
          name: 'Trimester-Specific Pregnancy Symptom Exacerbation',
          tier: 'Moderate Concern',
          rationale: 'Moderate symptoms during pregnancy (e.g. pelvic girdle pain, Braxton Hicks, mild swelling) warrant evaluation by your prenatal provider.'
        }
      ];
      clinicalEscalationNotice = 'Contact your prenatal clinic for advice within 24 hours.';
    } else {
      urgencyTier = 'LOW_HOME_CARE';
      protocolCode = 'ACOG-PREG-COMFORT';
      protocolName = 'ACOG Patient Clinical Resources: Common Pregnancy Discomforts';
      trimesterEnrichmentNote = `Currently at gestational week ${weeks} (${weeks < 14 ? '1st' : weeks < 28 ? '2nd' : '3rd'} trimester).`;
      candidateConsiderations = [
        {
          name: 'Physiological Pregnancy Discomfort',
          tier: 'Low Urgency',
          rationale: 'Mild, stable symptoms typical of hormonal and biomechanical adjustments during this stage of pregnancy.'
        }
      ];
      homeCareGuidance = [
        'Rest in a left-lateral position with pillows supporting knees and abdomen to optimize venous return.',
        'Maintain steady hydration with 8–10 glasses of water daily; limit caffeine and processed sodium.',
        'Wear supportive prenatal bands or maternity compression stockings if standing for prolonged periods.',
        'Log all symptoms and bring your notes to your next scheduled prenatal visit.'
      ];
    }
  } else {
    // Chronic Condition Mode
    const chrData = payload.chronicData;
    const baseline = chrData?.baselineComparison;
    const condition = chrData?.condition || profile.chronicSpecific?.condition || 'Chronic Condition';

    if (baseline === 'severely_worse_flare' || payload.severity === 'severe') {
      urgencyTier = 'HIGH_ALERT';
      protocolCode = 'CLIN-CHRONIC-FLARE-HIGH';
      protocolName = `${condition} Clinical Management: Severe Disease Flare`;
      chronicEnrichmentNote = `Symptoms represent a marked, severe acute deviation from baseline control for ${condition}.`;
      candidateConsiderations = [
        {
          name: `Acute ${condition} Exacerbation / Flare`,
          tier: 'High Alert',
          rationale: 'Significant worsening beyond baseline requires prompt specialist evaluation to prevent permanent organ damage or hospitalization.'
        }
      ];
      clinicalEscalationNotice = `Contact your ${condition} specialist or attending physician immediately today.`;
      homeCareGuidance = undefined;
    } else if (baseline === 'moderately_worse' || chrData?.peakFlowZone === 'yellow') {
      urgencyTier = 'MODERATE';
      protocolCode = 'CLIN-CHRONIC-ACTION-PLAN';
      protocolName = `${condition} Clinical Management: Stepped Action Plan`;
      candidateConsiderations = [
        {
          name: `Moderate ${condition} Flare / Medication Suboptimal Response`,
          tier: 'Moderate Concern',
          rationale: 'Symptoms are moderately worse than baseline; initiation of personal action plan and provider follow-up recommended.'
        }
      ];
      clinicalEscalationNotice = 'Contact your managing specialist or primary care clinic within 24 to 48 hours.';
    } else {
      urgencyTier = 'LOW_HOME_CARE';
      protocolCode = 'CLIN-CHRONIC-MAINT';
      protocolName = `${condition} Self-Management and Monitoring Protocols`;
      candidateConsiderations = [
        {
          name: `Stable ${condition} with Mild Self-Limiting Symptoms`,
          tier: 'Low Urgency',
          rationale: 'Symptom pattern is consistent with usual baseline without clinical alarm thresholds.'
        }
      ];
      homeCareGuidance = [
        'Continue all prescribed controller and maintenance medications exactly as scheduled.',
        'Keep a structured log of daily readings (e.g. glucose, blood pressure, or peak flow) twice daily.',
        'Maintain adequate hydration and balanced nutritional meals compliant with your care plan.',
        'Review your symptom diary with your specialist at your upcoming routine follow-up.'
      ];
    }
  }

  // STEP 6: Retrieval Layer (RAG Citations Partitioned by Mode)
  const modeCitations = KNOWLEDGE_BASE_CITATIONS.filter(
    (c) => c.mode === payload.mode
  );

  // STEP 5b: Local Outbreak & Epidemiological News Matching Layer
  const userText = `${payload.primarySymptom} ${payload.freeTextDescription || ''} ${payload.pediatricData?.breathingEffort || ''}`.toLowerCase();
  
  const matchedOutbreaks: OutbreakSignal[] = OUTBREAK_SIGNALS_FEED.filter((sig) => {
    // Mode-specific pediatric check
    if (payload.mode === 'pediatric' && sig.id === 'sig-rsv') {
      const isYoung = (profile.ageMonths ?? (profile.ageYears ? profile.ageYears * 12 : 12)) <= 24;
      if (isYoung && (userText.includes('cough') || userText.includes('breathing') || userText.includes('fever') || userText.includes('congestion') || userText.includes('runny') || userText.includes('cranky'))) {
        return true;
      }
    }
    if (sig.symptomsMatched && sig.symptomsMatched.some((sym) => userText.includes(sym))) {
      return true;
    }
    return false;
  });

  const activeSignals = matchedOutbreaks.length > 0 ? matchedOutbreaks : [OUTBREAK_SIGNALS_FEED[0]];
  const primaryOutbreakSignal = activeSignals[0];

  // If an active local outbreak matches the symptoms, inject it as a prioritized candidate disease consideration
  matchedOutbreaks.forEach((outbreak) => {
    // Avoid duplicates if already present
    if (!candidateConsiderations.some(c => c.name.toLowerCase().includes(outbreak.pathogen.toLowerCase().slice(0, 8)))) {
      candidateConsiderations.unshift({
        name: outbreak.pathogen,
        tier: 'Local Outbreak Match',
        rationale: `Community Health Alert: ${outbreak.headline} (${outbreak.source}). ${outbreak.relevanceNote} ${outbreak.clinicalAction || ''}`,
        isOutbreakLinked: true,
        outbreakSource: outbreak.source,
        outbreakHeadline: outbreak.headline
      });
    }
  });

  // STEP 7: Dual Reading Level Synthesis ("Explain Like I'm 12" & "Explain Like a Clinician")
  // Both share the exact same clinical urgency, protocol findings, and severity constraints!
  let plainExplanation = {
    headline: urgencyTier === 'HIGH_ALERT'
      ? `Contact Your Doctor Promptly (${payload.mode === 'pediatric' ? 'Pediatrician' : payload.mode === 'maternal' ? 'OB-GYN' : payload.mode === 'adult' ? 'Primary Care Doctor' : 'Specialist'})`
      : urgencyTier === 'MODERATE'
      ? 'Schedule a Check-In with Your Doctor'
      : 'Safe for Home Care and Monitoring',
    whatItMeans: urgencyTier === 'HIGH_ALERT'
      ? `Your symptoms are higher than normal and need an expert check-up today. ${clinicalEscalationNotice || ''}${matchedOutbreaks.length > 0 ? ` Note: Clinicians are also actively monitoring local cases of ${matchedOutbreaks[0].pathogen}.` : ''}`
      : urgencyTier === 'MODERATE'
      ? `Your symptoms need attention soon, but don’t look like an immediate emergency. Give your doctor’s office a call to ask for advice.${matchedOutbreaks.length > 0 ? ` Also be sure to mention the local ${matchedOutbreaks[0].pathogen} activity.` : ''}`
      : `Your symptoms look mild and typical. Your body is resting and fighting this off. We’ve listed gentle comfort steps below.${matchedOutbreaks.length > 0 ? ` Keep an eye out for signs of ${matchedOutbreaks[0].pathogen}, which is currently circulating in your area.` : ''}`,
    whatToDoNext: urgencyTier === 'HIGH_ALERT'
      ? `Please call your doctor's office or clinic now. Explain: "${payload.primarySymptom} for ${payload.duration} with high alert flags."`
      : urgencyTier === 'MODERATE'
      ? 'Call your clinic within the next 24 to 48 hours for an appointment or phone advice.'
      : 'Follow the gentle home care steps below, rest up, and drink plenty of fluids.',
    watchOutSigns: [
      'Breathing looks much faster than normal or nostrils are flaring',
      'Unable to keep any liquids down for more than 4 to 6 hours',
      'Unusual confusion, dizziness, or difficulty staying awake',
      'Sudden intense new pain or rapid worsening of existing symptoms'
    ]
  };

  let clinicalExplanation = {
    sbarSummary: `SBAR: Patient (${payload.mode.toUpperCase()}) presenting with ${payload.primarySymptom} (${payload.duration}, ${payload.severity} severity). Triage tier evaluated as ${urgencyTier}. ${protocolName}.`,
    protocolCode,
    pathophysiology: `Pathophysiology & Protocol Logic: ${candidateConsiderations[0]?.rationale || 'Clinical evaluation against evidence-based specialty guidelines.'} ${vaccineEnrichmentNote} ${trimesterEnrichmentNote} ${chronicEnrichmentNote}`,
    recommendedAction: clinicalEscalationNotice || 'Continue structured outpatient monitoring; escalate per protocol thresholds.',
    vitalThresholds: [
      payload.mode === 'pediatric' ? 'Pediatric red line: Temp ≥ 100.4°F in <3m, stridor, or cyanosis' :
      payload.mode === 'adult' ? 'Adult red line: Crushing chest pain, FAST stroke symptoms, resting dyspnea, BP ≥ 180/120' :
      payload.mode === 'maternal' ? 'Maternal red line: BP ≥ 160/110, severe headache with aura, heavy bleeding' :
      'Chronic red line: Blood glucose > 300 with ketones, PEF < 50%, BP > 180/120'
    ]
  };

  // Attempt server-side LLM synthesis if reachable
  try {
    const res = await fetch('/api/triage/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: payload.mode,
        profile,
        symptoms: payload,
        urgencyTier,
        triageProtocol: protocolName,
        clinicalGuidance: clinicalEscalationNotice || 'Home comfort measures',
        redFlagsDetected: [],
        citations: modeCitations,
        outbreakSignals: activeSignals
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.synthesized && data.data) {
        if (data.data.simple) {
          plainExplanation = {
            headline: data.data.simple.headline || plainExplanation.headline,
            whatItMeans: data.data.simple.whatItMeans || plainExplanation.whatItMeans,
            whatToDoNext: data.data.simple.whatToDoNext || plainExplanation.whatToDoNext,
            watchOutSigns: data.data.simple.watchOutSigns || plainExplanation.watchOutSigns
          };
        }
        if (data.data.clinical) {
          clinicalExplanation = {
            sbarSummary: data.data.clinical.sbarSummary || clinicalExplanation.sbarSummary,
            protocolCode: data.data.clinical.triageCode || clinicalExplanation.protocolCode,
            pathophysiology: data.data.clinical.clinicalRationale || clinicalExplanation.pathophysiology,
            recommendedAction: data.data.clinical.recommendedAction || clinicalExplanation.recommendedAction,
            vitalThresholds: data.data.clinical.escalationCriteria || clinicalExplanation.vitalThresholds
          };
        }
      }
    }
  } catch (err) {
    // Graceful fallback to verified deterministic clinical text
    console.warn('Server synthesis not available, utilizing deterministic clinical engine:', err);
  }

  // GUARANTEE: Never leak home care remedies into HIGH_ALERT
  if (urgencyTier === 'HIGH_ALERT') {
    homeCareGuidance = undefined;
  }

  return {
    id,
    timestamp,
    mode: payload.mode,
    urgencyTier,
    isEmergency: false,
    redFlagsTriggered: [],
    protocolMatched: protocolName,
    candidateConsiderations,
    homeCareGuidance,
    clinicalEscalationNotice,
    plainExplanation,
    clinicalExplanation,
    citations: modeCitations,
    outbreakSignal: primaryOutbreakSignal,
    outbreakSignals: activeSignals,
    evaluationAudit: {
      protocolEngine: 'OmniHealth AI Multimodal Triage Engine v2.4 (Schmitt-Thompson / ACOG / ADA)',
      severityEnforced: true,
      timestamp,
      modePartition: payload.mode
    }
  };
}
