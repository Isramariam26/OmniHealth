import React, { useState, useEffect } from 'react';
import { 
  Baby, 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets,
  Wind,
  Smile,
  Meh,
  Frown,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  Radio,
  Newspaper
} from 'lucide-react';
import { TriageMode, PatientProfile, SymptomPayload } from '../types/triage';
import { OUTBREAK_SIGNALS_FEED } from '../data/protocols';

interface ModeIntakeFormProps {
  currentMode: TriageMode;
  profile: PatientProfile;
  onUpdateProfile: (updated: Partial<PatientProfile>) => void;
  onSubmit: (payload: SymptomPayload) => void;
  isLoading: boolean;
  onSelectMode?: (mode: TriageMode) => void;
}

export const ModeIntakeForm: React.FC<ModeIntakeFormProps> = ({
  currentMode,
  profile,
  onUpdateProfile,
  onSubmit,
  isLoading,
  onSelectMode
}) => {
  // General symptom states
  const [primarySymptom, setPrimarySymptom] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [duration, setDuration] = useState('1-3 days');
  const [freeTextDescription, setFreeTextDescription] = useState('');

  // Pediatric states
  const [pedTempF, setPedTempF] = useState<number>(101.0);
  const [pedHydration, setPedHydration] = useState<'good_wet_diapers' | 'reduced_wet_diapers' | 'no_wet_diapers_8h' | 'crying_without_tears'>('good_wet_diapers');
  const [pedAlertness, setPedAlertness] = useState<'normal_playful' | 'fussy_consolable' | 'lethargic_hard_to_wake'>('fussy_consolable');
  const [pedBreathing, setPedBreathing] = useState<'normal' | 'fast_breathing' | 'rib_retractions_grunting' | 'stridor_blue_lips'>('normal');
  const [pedStiffNeck, setPedStiffNeck] = useState<boolean>(false);
  const [pedRecentVaccine, setPedRecentVaccine] = useState<boolean>(false);

  // Adult states (Age 18+)
  const [adultTempF, setAdultTempF] = useState<number>(98.6);
  const [adultChestPain, setAdultChestPain] = useState<'none' | 'mild_sharp' | 'pressure_tightness' | 'crushing_radiating'>('none');
  const [adultBreathing, setAdultBreathing] = useState<'normal' | 'on_exertion' | 'at_rest_severe'>('normal');
  const [adultFacialArmWeakness, setAdultFacialArmWeakness] = useState<boolean>(false);
  const [adultSlurredSpeech, setAdultSlurredSpeech] = useState<boolean>(false);
  const [adultThunderclapHeadache, setAdultThunderclapHeadache] = useState<boolean>(false);
  const [adultSevereAbdominalPain, setAdultSevereAbdominalPain] = useState<boolean>(false);
  const [adultSystolic, setAdultSystolic] = useState<number>(120);
  const [adultDiastolic, setAdultDiastolic] = useState<number>(80);

  // Maternal states
  const [matIsPostpartum, setMatIsPostpartum] = useState<boolean>(false);
  const [matWeeks, setMatWeeks] = useState<number>(profile.maternalSpecific?.gestationalWeeks || 26);
  const [matDaysPostpartum, setMatDaysPostpartum] = useState<number>(10);
  const [matHeadacheAura, setMatHeadacheAura] = useState<boolean>(false);
  const [matSwellingFaceHands, setMatSwellingFaceHands] = useState<boolean>(false);
  const [matBleeding, setMatBleeding] = useState<'none' | 'spotting' | 'soaking_one_pad_hourly'>('none');
  const [matFetalReduced, setMatFetalReduced] = useState<boolean>(false);
  const [matEpigastricPain, setMatEpigastricPain] = useState<boolean>(false);
  const [matSystolic, setMatSystolic] = useState<number>(120);
  const [matDiastolic, setMatDiastolic] = useState<number>(80);

  // Chronic states
  const [chrCondition, setChrCondition] = useState<string>(profile.chronicSpecific?.condition || 'Asthma');
  const [chrBaseline, setChrBaseline] = useState<'same_as_usual' | 'moderately_worse' | 'severely_worse_flare'>('moderately_worse');
  const [chrGlucose, setChrGlucose] = useState<number>(160);
  const [chrKetones, setChrKetones] = useState<boolean>(false);
  const [chrPeakFlowZone, setChrPeakFlowZone] = useState<'green' | 'yellow' | 'red'>('yellow');
  const [chrMissedDoses, setChrMissedDoses] = useState<boolean>(false);

  // Quick preset symptoms based on mode
  const quickSymptoms = {
    pediatric: ['Fever & cranky', 'Cough & runny nose', 'Vomiting / diarrhea', 'Ear pain', 'Skin rash'],
    adult: ['Fever & body aches', 'Chest tightness / cough', 'Severe headache', 'Stomach pain / nausea', 'Back or joint pain'],
    maternal: ['Severe headache / spots', 'Fewer baby kicks', 'Upper belly ache', 'Bleeding or spotting', 'Swollen hands/face'],
    chronic: ['Blood sugar spike', 'Wheezing / chest tightness', 'High blood pressure', 'Severe fatigue', 'Joint pain flare']
  };

  // Check if current symptoms match circulating outbreak pathogens
  const activeMatchingOutbreak = OUTBREAK_SIGNALS_FEED.find((sig) => {
    const text = (primarySymptom || '').toLowerCase();
    return sig.symptomsMatched?.some((sym) => text.includes(sym));
  });

  // Sync default symptom when mode changes
  useEffect(() => {
    if (currentMode === 'pediatric') {
      setPrimarySymptom('Fever and crankiness');
    } else if (currentMode === 'adult') {
      setPrimarySymptom('Fever and persistent body aches');
    } else if (currentMode === 'maternal') {
      setPrimarySymptom('Headache and mild visual floaters');
    } else {
      setPrimarySymptom('Shortness of breath and wheezing');
    }
  }, [currentMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: SymptomPayload = {
      mode: currentMode,
      primarySymptom: primarySymptom.trim() || 'General discomfort',
      severity,
      duration,
      associatedSymptoms: [],
      freeTextDescription,
      pediatricData: currentMode === 'pediatric' ? {
        tempFahrenheit: pedTempF,
        hydrationStatus: pedHydration,
        alertness: pedAlertness,
        breathingEffort: pedBreathing,
        stiffNeck: pedStiffNeck,
        recentVaccine48h: pedRecentVaccine
      } : undefined,
      adultData: currentMode === 'adult' ? {
        tempFahrenheit: adultTempF,
        chestPainType: adultChestPain,
        breathingDifficulty: adultBreathing,
        facialDroopOrArmWeakness: adultFacialArmWeakness,
        slurredSpeechOrConfusion: adultSlurredSpeech,
        suddenThunderclapHeadache: adultThunderclapHeadache,
        severeAbdominalPain: adultSevereAbdominalPain,
        systolicBP: adultSystolic,
        diastolicBP: adultDiastolic
      } : undefined,
      maternalData: currentMode === 'maternal' ? {
        isPostpartum: matIsPostpartum,
        gestationalWeeks: matWeeks,
        daysPostpartum: matDaysPostpartum,
        severeHeadacheVisualAura: matHeadacheAura,
        swellingFaceHands: matSwellingFaceHands,
        vaginalBleedingAmount: matBleeding,
        fetalMovementReduced: matFetalReduced,
        severeEpigastricPain: matEpigastricPain,
        feverChillsPostpartum: false,
        systolicBP: matSystolic,
        diastolicBP: matDiastolic
      } : undefined,
      chronicData: currentMode === 'chronic' ? {
        condition: chrCondition,
        baselineComparison: chrBaseline,
        bloodGlucoseMgDl: chrCondition.includes('Diabetes') ? chrGlucose : undefined,
        ketonesPresent: chrKetones,
        peakFlowZone: chrCondition.includes('Asthma') || chrCondition.includes('COPD') ? chrPeakFlowZone : undefined,
        newMedicationStartedRecently: false,
        missedDoses: chrMissedDoses
      } : undefined
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
      {/* 1. Patient Profile Card - Friendly & Simple */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Who is this check for?</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Name or Nickname
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onUpdateProfile({ name: e.target.value })}
              placeholder="e.g. Maya"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Age (years)
              </label>
              {currentMode === 'pediatric' && (
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  Range: 0–18 yrs
                </span>
              )}
              {currentMode === 'adult' && (
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                  Range: 18+ yrs (Adults)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={currentMode === 'adult' ? 18 : 0}
                max={currentMode === 'pediatric' ? 18 : 120}
                value={profile.ageYears ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    onUpdateProfile({ ageYears: undefined, ageMonths: undefined });
                    return;
                  }
                  let val = parseInt(raw, 10);
                  if (isNaN(val)) return;
                  if (val < 0) val = 0;
                  if (currentMode === 'pediatric' && val > 18) val = 18;
                  onUpdateProfile({
                    ageYears: val,
                    ageMonths: val * 12,
                  });
                }}
                placeholder={currentMode === 'pediatric' ? '0–18' : currentMode === 'adult' ? '18–120' : 'e.g. 25'}
                className="w-24 px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                years old
              </span>
            </div>
            {currentMode === 'pediatric' && profile.ageYears !== undefined && profile.ageYears > 18 && (
              <div className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800/60 mt-1.5 flex items-center justify-between">
                <span>Child check is for ages 0–18.</span>
                {onSelectMode && (
                  <button
                    type="button"
                    onClick={() => onSelectMode('adult')}
                    className="underline font-bold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 ml-1 cursor-pointer"
                  >
                    Switch to Adult (18+)
                  </button>
                )}
              </div>
            )}
            {currentMode === 'adult' && profile.ageYears !== undefined && profile.ageYears < 18 && (
              <div className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800/60 mt-1.5 flex items-center justify-between">
                <span>Adult check is for ages 18+.</span>
                {onSelectMode && (
                  <button
                    type="button"
                    onClick={() => onSelectMode('pediatric')}
                    className="underline font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 ml-1 cursor-pointer"
                  >
                    Switch to Child (0–18)
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                City or Region (Live GPS)
              </label>
              {profile.locationCoordinates && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live GPS Tracking</span>
                </span>
              )}
            </div>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 absolute left-3 top-3" />
              <input
                type="text"
                value={profile.locationCity || ''}
                onChange={(e) => onUpdateProfile({ locationCity: e.target.value })}
                placeholder="Detecting live GPS location..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Active Local Surveillance Banner */}
          <div className="sm:col-span-2 rounded-xl p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/60 flex items-start gap-2.5 text-xs text-teal-950 dark:text-teal-200">
            <Radio className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold">Active Local Disease Surveillance ({profile.locationCity || 'Your Community'}):</span>
                {profile.locationCoordinates && (
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>GPS Calibrated</span>
                  </span>
                )}
                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-2 py-0.5 rounded-full">CDC FluView & Public Health Alerts</span>
              </div>
              <p className="text-teal-900 dark:text-teal-300 text-[11px] leading-relaxed">
                Currently tracking elevated regional cases of <strong>RSV Bronchiolitis</strong> (pediatric surge), <strong>Group A Strep</strong> (school-age clusters), and <strong>Norovirus</strong> (wastewater alert).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Symptom Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-1">
            What is the main concern today?
          </label>
          <input
            type="text"
            value={primarySymptom}
            onChange={(e) => setPrimarySymptom(e.target.value)}
            placeholder="e.g. High fever, severe cough, headache..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
            required
          />

          {/* Quick Clickable Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-xs text-slate-400 dark:text-slate-500">Suggestions:</span>
            {quickSymptoms[currentMode].map((symptom) => (
              <button
                type="button"
                key={symptom}
                onClick={() => setPrimarySymptom(symptom)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  primarySymptom === symptom
                    ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-300 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>

          {/* Real-time Outbreak Correlation Alert */}
          {activeMatchingOutbreak && (
            <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-950 dark:text-purple-200 flex items-start gap-2.5 mt-3 animate-fadeIn">
              <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-0.5">
                <div className="font-bold flex items-center gap-1.5 flex-wrap">
                  <span>Matches Active Local Outbreak Alert:</span>
                  <span className="text-[10px] font-bold bg-purple-200/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded-md">
                    {activeMatchingOutbreak.pathogen} ({activeMatchingOutbreak.severity})
                  </span>
                </div>
                <p className="text-[11px] text-purple-900 dark:text-purple-300 leading-relaxed">
                  "{activeMatchingOutbreak.headline}" — The clinical engine will cross-reference your answers with local public health guidance and include it in candidate disease considerations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Severity & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              How uncomfortable does it feel?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSeverity('mild')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  severity === 'mild'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Mild</span>
              </button>

              <button
                type="button"
                onClick={() => setSeverity('moderate')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  severity === 'moderate'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Meh className="w-3.5 h-3.5" />
                <span>Moderate</span>
              </button>

              <button
                type="button"
                onClick={() => setSeverity('severe')}
                className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  severity === 'severe'
                    ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-700 dark:text-red-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Frown className="w-3.5 h-3.5" />
                <span>Severe</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              How long has this lasted?
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="Less than 12 hours">Just started (under 12 hours)</option>
              <option value="1-3 days">1 to 3 days</option>
              <option value="4-7 days">4 to 7 days</option>
              <option value="More than 1 week">More than a week</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Mode-Specific Key Questions (Simple & Conversational) */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {currentMode === 'pediatric' && <Baby className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          {currentMode === 'adult' && <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
          {currentMode === 'maternal' && <Heart className="w-4 h-4 text-rose-500" />}
          {currentMode === 'chronic' && <Activity className="w-4 h-4 text-emerald-600" />}
          <span>
            {currentMode === 'pediatric' && 'Specific Child Health Questions'}
            {currentMode === 'adult' && 'Adult Health & Acute Symptom Questions'}
            {currentMode === 'maternal' && 'Pregnancy & Postpartum Questions'}
            {currentMode === 'chronic' && 'Condition Baseline Questions'}
          </span>
        </h3>

        {/* --- PEDIATRIC QUESTIONS --- */}
        {currentMode === 'pediatric' && (
          <div className="space-y-4">
            {/* Temperature Section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span>Child's Temperature (°F)</span>
                </label>
                <span className={`text-sm font-black ${pedTempF >= 100.4 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {pedTempF}°F {pedTempF >= 100.4 ? '(Fever)' : '(Normal)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPedTempF(98.6)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${pedTempF === 98.6 ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 font-bold text-teal-800 dark:text-teal-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  98.6°F (Normal)
                </button>
                <button
                  type="button"
                  onClick={() => setPedTempF(101.0)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${pedTempF === 101.0 ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 font-bold text-amber-800 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  101.0°F (Mild fever)
                </button>
                <button
                  type="button"
                  onClick={() => setPedTempF(103.5)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${pedTempF === 103.5 ? 'bg-red-50 dark:bg-red-950/60 border-red-500 font-bold text-red-800 dark:text-red-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  103.5°F (High fever)
                </button>
              </div>

              <input
                type="range"
                min="97.0"
                max="105.0"
                step="0.1"
                value={pedTempF}
                onChange={(e) => setPedTempF(parseFloat(e.target.value))}
                className="w-full accent-teal-600 mt-3 cursor-pointer"
              />
            </div>

            {/* Drinking & Alertness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                  <span>Drinking & Wet Diapers</span>
                </label>
                <select
                  value={pedHydration}
                  onChange={(e) => setPedHydration(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="good_wet_diapers">Drinking well & normal wet diapers</option>
                  <option value="reduced_wet_diapers">Drinking less, fewer wet diapers</option>
                  <option value="no_wet_diapers_8h">No wet diapers in 8+ hours (dry)</option>
                  <option value="crying_without_tears">Crying without tears / dry tongue</option>
                </select>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Energy & Alertness
                </label>
                <select
                  value={pedAlertness}
                  onChange={(e) => setPedAlertness(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="normal_playful">Playing, smiles, active</option>
                  <option value="fussy_consolable">Fussy, but calms when held</option>
                  <option value="lethargic_hard_to_wake">Very hard to wake up / floppy</option>
                </select>
              </div>
            </div>

            {/* Breathing & Vaccine Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>How is their breathing?</span>
                </label>
                <select
                  value={pedBreathing}
                  onChange={(e) => setPedBreathing(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  <option value="normal">Normal, relaxed breathing</option>
                  <option value="fast_breathing">Fast breathing or stuffy nose</option>
                  <option value="rib_retractions_grunting">Chest pulling in hard (retractions)</option>
                  <option value="stridor_blue_lips">Harsh squeaking / blue lips</option>
                </select>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-center transition-colors">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pedRecentVaccine}
                    onChange={(e) => setPedRecentVaccine(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded-sm cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Vaccine in the last 48 hours?</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Mild fever after vaccines is normal</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* --- ADULT QUESTIONS (AGE 18+) --- */}
        {currentMode === 'adult' && (
          <div className="space-y-4">
            {/* Temperature Section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span>Adult Body Temperature (°F)</span>
                </label>
                <span className={`text-sm font-black ${adultTempF >= 103.0 ? 'text-red-600 dark:text-red-400' : adultTempF >= 100.4 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {adultTempF}°F {adultTempF >= 103.0 ? '(High Fever)' : adultTempF >= 100.4 ? '(Fever)' : '(Normal)'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setAdultTempF(98.6)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${adultTempF === 98.6 ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 font-bold text-teal-800 dark:text-teal-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  98.6°F (Normal)
                </button>
                <button
                  type="button"
                  onClick={() => setAdultTempF(101.0)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${adultTempF === 101.0 ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 font-bold text-amber-800 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  101.0°F (Fever)
                </button>
                <button
                  type="button"
                  onClick={() => setAdultTempF(103.2)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${adultTempF === 103.2 ? 'bg-red-50 dark:bg-red-950/60 border-red-500 font-bold text-red-800 dark:text-red-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  103.2°F+ (High Fever)
                </button>
                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="number"
                    step="0.1"
                    min="95"
                    max="108"
                    value={adultTempF}
                    onChange={(e) => setAdultTempF(parseFloat(e.target.value) || 98.6)}
                    className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">°F</span>
                </div>
              </div>
            </div>

            {/* Chest & Heart Screening */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Chest Pain or Pressure (AHA Guideline)</span>
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Cardiopulmonary triage</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {[
                  { id: 'none', label: 'No chest discomfort', sub: 'Pain-free in chest area' },
                  { id: 'mild_sharp', label: 'Mild or sharp with movement', sub: 'Musculoskeletal or pleuritic' },
                  { id: 'pressure_tightness', label: 'Pressure or heaviness', sub: 'Substernal squeezing or tightness' },
                  { id: 'crushing_radiating', label: 'Crushing or radiating to arm/jaw', sub: '🚨 High suspicion cardiac red-flag' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAdultChestPain(opt.id as any)}
                    className={`p-3 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                      adultChestPain === opt.id
                        ? opt.id === 'crushing_radiating'
                          ? 'bg-red-50 dark:bg-red-950/60 border-red-500 font-bold text-red-900 dark:text-red-200 shadow-xs'
                          : opt.id === 'pressure_tightness'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 font-bold text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 font-bold text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">{opt.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Breathing Difficulty */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Breathing Comfort</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: 'Normal breathing', sub: 'Comfortable at rest' },
                  { id: 'on_exertion', label: 'Short of breath when moving', sub: 'With stairs or walking' },
                  { id: 'at_rest_severe', label: 'Severe / struggling at rest', sub: '🚨 Cannot speak full sentences' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAdultBreathing(opt.id as any)}
                    className={`p-2.5 text-left rounded-xl border transition-all text-xs cursor-pointer ${
                      adultBreathing === opt.id
                        ? opt.id === 'at_rest_severe'
                          ? 'bg-red-50 dark:bg-red-950/60 border-red-500 font-bold text-red-900 dark:text-red-200'
                          : 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 font-bold text-teal-900 dark:text-teal-200'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="font-bold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Critical Neurological FAST Signs (Stroke / Hemorrhage) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>Neurological Screening (Check all that apply)</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Stroke / FAST criteria</span>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={adultFacialArmWeakness}
                    onChange={(e) => setAdultFacialArmWeakness(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-red-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Sudden face drooping or one-sided arm/leg weakness</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Uneven smile, numbness, or inability to raise one arm</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={adultSlurredSpeech}
                    onChange={(e) => setAdultSlurredSpeech(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-red-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Sudden slurred speech or difficulty understanding</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Stumbling over words, acute confusion, or unable to speak</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={adultThunderclapHeadache}
                    onChange={(e) => setAdultThunderclapHeadache(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-red-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Sudden severe "thunderclap" headache</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Instant maximum-intensity headache ("worst headache of life")</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={adultSevereAbdominalPain}
                    onChange={(e) => setAdultSevereAbdominalPain(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-amber-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Severe sudden abdominal pain or rigid stomach</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Sharp localized stomach pain, continuous vomiting, or unable to stand straight</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Optional Blood Pressure (if known) */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Blood Pressure (optional, if recently measured)</span>
                </label>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                  {adultSystolic}/{adultDiastolic} mmHg
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Systolic (Top number)</span>
                  <input
                    type="number"
                    value={adultSystolic}
                    onChange={(e) => setAdultSystolic(parseInt(e.target.value, 10) || 120)}
                    placeholder="120"
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Diastolic (Bottom number)</span>
                  <input
                    type="number"
                    value={adultDiastolic}
                    onChange={(e) => setAdultDiastolic(parseInt(e.target.value, 10) || 80)}
                    placeholder="80"
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MATERNAL QUESTIONS --- */}
        {currentMode === 'maternal' && (
          <div className="space-y-4">
            {/* Pregnant or Postpartum Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <button
                type="button"
                onClick={() => setMatIsPostpartum(false)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  !matIsPostpartum
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Currently Pregnant
              </button>
              <button
                type="button"
                onClick={() => setMatIsPostpartum(true)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  matIsPostpartum
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Recently Delivered (Postpartum)
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                {!matIsPostpartum ? 'How many weeks pregnant are you?' : 'How many days ago did you deliver?'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={!matIsPostpartum ? 42 : 180}
                  value={!matIsPostpartum ? matWeeks : matDaysPostpartum}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    if (!matIsPostpartum) setMatWeeks(val);
                    else setMatDaysPostpartum(val);
                  }}
                  className="w-20 px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {!matIsPostpartum ? `weeks (Trimester ${matWeeks < 14 ? '1' : matWeeks < 28 ? '2' : '3'})` : 'days postpartum'}
                </span>
              </div>
            </div>

            {/* Quick Warning Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={matHeadacheAura}
                  onChange={(e) => setMatHeadacheAura(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-sm cursor-pointer"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Severe headache or seeing spots / blurriness
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={matSwellingFaceHands}
                  onChange={(e) => setMatSwellingFaceHands(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-sm cursor-pointer"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Sudden swelling of face, eyes, or fingers
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <input
                  type="checkbox"
                  checked={matEpigastricPain}
                  onChange={(e) => setMatEpigastricPain(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-sm cursor-pointer"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Sharp pain in upper right stomach under ribs
                </span>
              </label>

              {!matIsPostpartum ? (
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={matFetalReduced}
                    onChange={(e) => setMatFetalReduced(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded-sm cursor-pointer"
                  />
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    Baby is moving or kicking less than usual
                  </span>
                </label>
              ) : (
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={matBleeding === 'soaking_one_pad_hourly'}
                    onChange={(e) => setMatBleeding(e.target.checked ? 'soaking_one_pad_hourly' : 'none')}
                    className="w-4 h-4 text-rose-600 rounded-sm cursor-pointer"
                  />
                  <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    Heavy bleeding (soaking 1+ pad in an hour)
                  </span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* --- CHRONIC CONDITION QUESTIONS --- */}
        {currentMode === 'chronic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  What condition are you managing?
                </label>
                <select
                  value={chrCondition}
                  onChange={(e) => setChrCondition(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
                >
                  <option value="Asthma">Asthma</option>
                  <option value="Type 2 Diabetes">Type 2 Diabetes</option>
                  <option value="Type 1 Diabetes">Type 1 Diabetes</option>
                  <option value="Hypertension">High Blood Pressure</option>
                  <option value="COPD">COPD</option>
                  <option value="Arthritis">Arthritis / Autoimmune</option>
                </select>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Compared to your normal day:
                </label>
                <select
                  value={chrBaseline}
                  onChange={(e) => setChrBaseline(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
                >
                  <option value="same_as_usual">About normal (typical variation)</option>
                  <option value="moderately_worse">Noticeably worse than usual</option>
                  <option value="severely_worse_flare">Much worse / sudden flare-up</option>
                </select>
              </div>
            </div>

            {/* Condition Specific Reading */}
            {chrCondition.includes('Diabetes') && (
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 transition-colors">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-0.5">
                    Blood Sugar (mg/dL) if checked
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">Normal target: 80–140 mg/dL</span>
                </div>
                <input
                  type="number"
                  value={chrGlucose}
                  onChange={(e) => setChrGlucose(parseInt(e.target.value, 10) || 120)}
                  className="w-24 px-3 py-1.5 text-sm font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center"
                />
              </div>
            )}

            {chrCondition.includes('Asthma') && (
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  How does your chest feel?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setChrPeakFlowZone('green')}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      chrPeakFlowZone === 'green' ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Good / Easy
                  </button>
                  <button
                    type="button"
                    onClick={() => setChrPeakFlowZone('yellow')}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      chrPeakFlowZone === 'yellow' ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Tight / Coughing
                  </button>
                  <button
                    type="button"
                    onClick={() => setChrPeakFlowZone('red')}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      chrPeakFlowZone === 'red' ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-800 dark:text-red-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Severe struggle
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Optional Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
          Anything else we should know? (Optional)
        </label>
        <textarea
          rows={2}
          value={freeTextDescription}
          onChange={(e) => setFreeTextDescription(e.target.value)}
          placeholder="e.g. Coughing more at night, started after daycare, took tylenol 2 hours ago..."
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
        />
      </div>

      {/* 5. Big, Clear Check Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          id="run-triage-button"
          className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Reviewing symptoms safely...</span>
            </>
          ) : (
            <>
              <span>Check Symptoms</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
          Safety screening checks for immediate red flags first. Private & on-device.
        </p>
      </div>
    </form>
  );
};
