import { RedFlagRule, CitationItem, OutbreakSignal } from '../types/triage';

export const RED_FLAG_RULES: RedFlagRule[] = [
  // Pediatric Red Flags
  {
    id: 'ped-rf-1',
    mode: 'pediatric',
    title: 'Neonatal/Infant Fever (< 3 Months)',
    clinicalCriteria: 'Rectal temperature ≥ 100.4°F (38.0°C) in an infant under 90 days old.',
    sourceProtocol: 'AAP Clinical Practice Guideline: Evaluation and Management of Well-Appearing Febrile Infants 8 to 60 Days Old',
    immediateAction: 'Immediate Emergency Department evaluation required for full diagnostic sepsis workup.',
    rationale: 'Young infants have immature immune systems and reduced blood-brain barrier protection; fever can indicate rapid invasive bacterial infection.'
  },
  {
    id: 'ped-rf-2',
    mode: 'pediatric',
    title: 'Severe Pediatric Respiratory Distress',
    clinicalCriteria: 'Stridor at rest, cyanosis/blue lips, marked subcostal or intercostal retractions, or rhythmic grunting.',
    sourceProtocol: 'Schmitt-Thompson Pediatric Protocol: Breathing Difficulty / Stridor',
    immediateAction: 'Call 911 / Emergency Services immediately. Do not transport alone if child is struggling to breathe.',
    rationale: 'Indicates imminent airway compromise or respiratory failure requiring emergent oxygenation and airway stabilization.'
  },
  {
    id: 'ped-rf-3',
    mode: 'pediatric',
    title: 'Meningismus / Neurological Compromise',
    clinicalCriteria: 'Inability to touch chin to chest (stiff neck) accompanied by fever, or child is unarousable/unresponsive.',
    sourceProtocol: 'CDC Pediatric Clinical Guidance on Bacterial Meningitis and Encephalitis',
    immediateAction: 'Call 911 or proceed to the nearest Emergency Department immediately.',
    rationale: 'Classic presentation of acute central nervous system infection requiring immediate lumbar puncture and intravenous antibiotics.'
  },

  // Maternal Red Flags
  {
    id: 'mat-rf-1',
    mode: 'maternal',
    title: 'Severe Hypertensive Disorder / Preeclampsia Red Flags',
    clinicalCriteria: 'Severe persistent headache unresponsive to acetaminophen, visual disturbances (flashes, scotoma), severe epigastric or right upper quadrant pain, or BP ≥ 160/110 mmHg.',
    sourceProtocol: 'ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia',
    immediateAction: 'Proceed directly to Labor & Delivery Triage or Emergency Department immediately.',
    rationale: 'High risk for eclamptic seizures, placental abruption, hepatic rupture, or maternal intracranial hemorrhage.'
  },
  {
    id: 'mat-rf-2',
    mode: 'maternal',
    title: 'Severe Obstetric Hemorrhage',
    clinicalCriteria: 'Soaking through one or more heavy maxi pads per hour for 2 or more consecutive hours, passing clots larger than a golf ball, or active dizziness/syncope.',
    sourceProtocol: 'ACOG Maternal Safety Bundle: Obstetric Hemorrhage & Postpartum Care',
    immediateAction: 'Call 911 or immediate transport to emergency obstetric care.',
    rationale: 'Acute maternal blood loss leading to hypovolemic shock, requiring immediate uterotonics or surgical intervention.'
  },
  {
    id: 'mat-rf-3',
    mode: 'maternal',
    title: 'Decreased Fetal Movement (Third Trimester)',
    clinicalCriteria: 'Absence of fetal kicks or <10 movements over a 2-hour period of focused counting past 28 weeks gestation.',
    sourceProtocol: 'ACOG Practice Advisory: Antenatal Fetal Surveillance & Kick Count Thresholds',
    immediateAction: 'Contact Labor & Delivery / OB On-Call immediately for continuous fetal cardiotocography monitoring.',
    rationale: 'Decreased fetal movement can be an ominous indicator of placental insufficiency or fetal hypoxia.'
  },

  // Chronic Condition Red Flags
  {
    id: 'chr-rf-1',
    mode: 'chronic',
    title: 'Diabetic Ketoacidosis (DKA) / Hyperosmolar Crises',
    clinicalCriteria: 'Blood glucose > 300 mg/dL with moderate/large urine ketones, continuous vomiting, fruity breath, or altered mental status.',
    sourceProtocol: 'American Diabetes Association (ADA) Standards of Care: Diabetes Emergencies',
    immediateAction: 'Immediate Emergency Department transport for intravenous fluid resuscitation and insulin drip.',
    rationale: 'Severe metabolic acidosis with electrolyte shifts can progress to coma or cardiac arrhythmia within hours.'
  },
  {
    id: 'chr-rf-2',
    mode: 'chronic',
    title: 'Severe Asthma / COPD Exacerbation (Red Zone)',
    clinicalCriteria: 'Peak flow < 50% personal best, unable to complete a sentence in one breath, accessory muscle use, lack of response to albuterol rescue.',
    sourceProtocol: 'Global Initiative for Asthma (GINA) Management Guidelines: Acute Exacerbations',
    immediateAction: 'Call 911 immediately. Continue repeat albuterol neb/inhaler while awaiting paramedics.',
    rationale: 'Critical airflow obstruction leading to respiratory muscle fatigue and hypercapnic respiratory arrest.'
  },
  {
    id: 'chr-rf-3',
    mode: 'chronic',
    title: 'Hypertensive Emergency with End-Organ Damage',
    clinicalCriteria: 'Systolic BP > 180 mmHg or Diastolic BP > 120 mmHg accompanied by chest pain, shortness of breath, vision changes, or focal numbness.',
    sourceProtocol: 'AHA/ACC High Blood Pressure Guidelines: Hypertensive Crises',
    immediateAction: 'Call 911 immediately. Do NOT attempt to rapidly lower blood pressure at home.',
    rationale: 'Uncontrolled pressure with end-organ injury warrants controlled parenteral titration in an intensive care setting.'
  }
];

export const KNOWLEDGE_BASE_CITATIONS: CitationItem[] = [
  // Pediatric Citations
  {
    id: 'cit-ped-1',
    mode: 'pediatric',
    title: 'Fever and Your Baby: Clinical Management & Assessment',
    authoritativeBody: 'American Academy of Pediatrics (AAP) / HealthyChildren.org',
    sourceDoc: 'AAP Pediatric Fever Guidelines & Schmitt-Thompson Telephone Triage Protocols',
    keyTakeaway: 'Fever itself is an immune response, not a disease. However, in children over 3 months, activity level, hydration, and respiratory effort are vastly more critical diagnostic metrics than the absolute thermometer number.',
    guidelineYear: '2024-2025 Revision'
  },
  {
    id: 'cit-ped-2',
    mode: 'pediatric',
    title: 'Post-Vaccine Reactions vs. Incidental Infection',
    authoritativeBody: 'CDC National Center for Immunization and Respiratory Diseases (NCIRD)',
    sourceDoc: 'Advisory Committee on Immunization Practices (ACIP) Clinical Guidance',
    keyTakeaway: 'Mild fever within 24–48 hours of 2, 4, or 6-month vaccinations is an expected immune response if the infant is consolable, feeding well, and shows no focal local infection or respiratory distress.',
    guidelineYear: '2024'
  },
  {
    id: 'cit-ped-3',
    mode: 'pediatric',
    title: 'Pediatric Hydration & Gastroenteritis Fluid Replacement',
    authoritativeBody: 'Nemours KidsHealth / CDC Pediatric Diarrheal Guidelines',
    sourceDoc: 'Oral Rehydration Therapy (ORT) Evidence Review',
    keyTakeaway: 'In mild viral gastroenteritis, small, frequent sips of balanced oral rehydration solutions (5–10 mL every 5 minutes) prevent dehydration far better than plain water, apple juice, or commercial sports drinks.',
    guidelineYear: '2023'
  },

  // Maternal Citations
  {
    id: 'cit-mat-1',
    mode: 'maternal',
    title: 'Diagnosis and Management of Preeclampsia and Eclampsia',
    authoritativeBody: 'American College of Obstetricians and Gynecologists (ACOG)',
    sourceDoc: 'ACOG Practice Bulletin No. 222 (Obstet Gynecol 2020; Reaffirmed 2024)',
    keyTakeaway: 'Preeclampsia can develop suddenly in the second half of pregnancy or up to 6 weeks postpartum. New-onset hypertension with severe headache, visual scotoma, or epigastric pain mandates emergent laboratory and fetal evaluation.',
    guidelineYear: '2024'
  },
  {
    id: 'cit-mat-2',
    mode: 'maternal',
    title: 'Hear Her Campaign: Recognizing Urgent Maternal Warning Signs',
    authoritativeBody: 'Centers for Disease Control and Prevention (CDC) Maternal & Infant Health',
    sourceDoc: 'CDC Division of Reproductive Health Clinical Implementation',
    keyTakeaway: 'Over 80% of pregnancy-related complications are preventable with timely escalation. Women know their bodies; symptoms like chest pain, extreme swelling, or overwhelming fatigue must never be dismissed as normal pregnancy discomfort.',
    guidelineYear: '2024'
  },
  {
    id: 'cit-mat-3',
    mode: 'maternal',
    title: 'Postpartum Endometritis and Infection Surveillance',
    authoritativeBody: 'ACOG Committee on Practice Bulletins—Obstetrics',
    sourceDoc: 'Infections in Obstetrics and Gynecology Guidelines',
    keyTakeaway: 'Fever accompanied by uterine tenderness, purulent or foul lochia, or tachycardia requires immediate medical examination and parenteral broad-spectrum antibiotic therapy.',
    guidelineYear: '2023'
  },

  // Chronic Citations
  {
    id: 'cit-chr-1',
    mode: 'chronic',
    title: 'Standards of Medical Care in Diabetes: Glycemic Targets & Sick-Day Management',
    authoritativeBody: 'American Diabetes Association (ADA)',
    sourceDoc: 'ADA Standards of Care in Diabetes (Diabetes Care 2025)',
    keyTakeaway: 'During acute illness, insulin resistance surges. Patients must check glucose every 2–4 hours, check urine or blood ketones if glucose exceeds 250 mg/dL, and maintain hydration to prevent ketoacidosis.',
    guidelineYear: '2025'
  },
  {
    id: 'cit-chr-2',
    mode: 'chronic',
    title: 'Global Strategy for Asthma Management and Prevention',
    authoritativeBody: 'Global Initiative for Asthma (GINA)',
    sourceDoc: 'GINA Pocket Guide for Asthma Management and Prevention',
    keyTakeaway: 'Yellow Zone exacerbations (peak flow 50-79% or waking with cough/wheeze) necessitate immediate initiation of personal asthma action plan stepped-up controller/reliever therapy and close tracking.',
    guidelineYear: '2024'
  },
  {
    id: 'cit-chr-3',
    mode: 'chronic',
    title: 'Rheumatoid Arthritis and Autoimmune Flare Management Protocols',
    authoritativeBody: 'American College of Rheumatology (ACR)',
    sourceDoc: 'ACR Guideline for the Treatment of Rheumatoid Arthritis',
    keyTakeaway: 'Differentiating an inflammatory flare from infectious complications is paramount in immunosuppressed patients on biologics or DMARDs before adjusting immunomodulatory medication dosages.',
    guidelineYear: '2024'
  }
];

export const OUTBREAK_SIGNALS_FEED: OutbreakSignal[] = [
  {
    id: 'sig-rsv',
    pathogen: 'Respiratory Syncytial Virus (RSV) / Bronchiolitis',
    severity: 'High Community Surge (12.8% Positivity)',
    affectedGroup: 'Infants & Toddlers (< 2 years)',
    headline: 'Regional pediatric emergency networks report spike in RSV bronchiolitis admissions',
    source: 'CDC FluView / State Viral Respiratory Surveillance',
    dateReported: 'Current Surveillance Week',
    relevanceNote: 'Infants with persistent dry cough, nasal congestion, fever, or increased work of breathing should be monitored closely for bronchiolitis.',
    symptomsMatched: ['cough', 'fever', 'runny nose', 'wheez', 'breathing', 'congestion'],
    clinicalAction: 'Pediatricians routinely evaluate RSV antigen status and check pulse oximetry when these symptoms present during high surveillance weeks.'
  },
  {
    id: 'sig-strep',
    pathogen: 'Group A Streptococcus (Strep Pharyngitis)',
    severity: 'Elevated School & Daycare Clusters',
    affectedGroup: 'Children 3–15 years & Household Contacts',
    headline: 'County Health Department issues pediatric alert regarding Strep throat & scarlet fever clusters',
    source: 'County Department of Public Health Alert',
    dateReported: 'Updated 2 days ago',
    relevanceNote: 'High fever without a cough, sudden severe throat pain, painful swallowing, or swollen neck glands should be evaluated for rapid Strep swab.',
    symptomsMatched: ['throat', 'sore throat', 'swallow', 'tonsil', 'fever and cranky', 'headache'],
    clinicalAction: 'Clinical guidelines recommend rapid antigen detection test (RADT) or throat culture prior to starting antibiotics.'
  },
  {
    id: 'sig-noro',
    pathogen: 'Norovirus (Acute Viral Gastroenteritis)',
    severity: 'Active Regional Outbreak (Wastewater Alert)',
    affectedGroup: 'All Age Groups, Especially Young Children',
    headline: 'Wastewater viral detection indices show sharp climb in Norovirus activity across regional metro areas',
    source: 'State Epidemiological Weekly Digest & CDC CaliciNet',
    dateReported: 'Updated this week',
    relevanceNote: 'Sudden onset projectile vomiting and watery diarrhea carry high risk for acute pediatric and maternal dehydration.',
    symptomsMatched: ['vomit', 'diarrhea', 'nausea', 'stomach', 'belly ache', 'cramps'],
    clinicalAction: 'Focus is on oral rehydration therapy (Pedialyte / electrolyte solutions). Watch for decreased urination and dry mucus membranes.'
  },
  {
    id: 'sig-flu',
    pathogen: 'Influenza A / B (Seasonal Epidemic)',
    severity: 'Moderate-to-High Community Activity',
    affectedGroup: 'Infants, Pregnant Women, Chronic Illness, All Ages',
    headline: 'Influenza-like illness (ILI) outpatient visits surpass regional baseline threshold',
    source: 'CDC Outpatient ILI Surveillance Network (ILINet)',
    dateReported: 'Surveillance Week 36',
    relevanceNote: 'Sudden high fever accompanied by intense muscle aches, chills, dry cough, and profound fatigue.',
    symptomsMatched: ['fever', 'chills', 'body ache', 'muscle', 'fatigue', 'cough', 'headache'],
    clinicalAction: 'Early evaluation (within 48 hours of onset) allows consideration of antiviral therapeutics (e.g. oseltamivir), especially in high-risk groups.'
  },
  {
    id: 'sig-pertussis',
    pathogen: 'Bordetella Pertussis (Whooping Cough)',
    severity: 'Localized Health Advisory',
    affectedGroup: 'Unvaccinated Infants, Pregnant Women (3rd Trimester), Adolescents',
    headline: 'State health department warns of localized pertussis cases in school districts',
    source: 'State Division of Communicable Disease Control',
    dateReported: 'Active Health Advisory',
    relevanceNote: 'Severe episodic coughing fits that may end with a whooping sound, post-tussive gagging, or vomiting.',
    symptomsMatched: ['cough', 'coughing', 'spasm', 'choking', 'wheez'],
    clinicalAction: 'Clinical evaluation with PCR testing is indicated; macrolide prophylaxis is evaluated for exposed close contacts.'
  },
  {
    id: 'sig-hfmd',
    pathogen: 'Hand, Foot, and Mouth Disease (Coxsackievirus)',
    severity: 'Seasonal Daycare Clustering',
    affectedGroup: 'Children Under 5 Years',
    headline: 'Pediatric clinics report seasonal surge in enterovirus and coxsackievirus cases',
    source: 'Regional Pediatric Infectious Disease Collaborative',
    dateReported: 'Updated 4 days ago',
    relevanceNote: 'Painful sores inside the mouth/tongue and red blister spots on palms, soles, or diaper area with low fever.',
    symptomsMatched: ['rash', 'mouth', 'blister', 'skin', 'cranky', 'sore'],
    clinicalAction: 'Provide soft cool foods, pain relief as guided by pediatrician, and maintain hydration despite painful swallowing.'
  }
];
