import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ModeIntakeForm } from './components/ModeIntakeForm';
import { TriageResults } from './components/TriageResults';
import { RedFlagAlert } from './components/RedFlagAlert';
import { runTriagePipeline } from './services/triageEngine';
import { useLiveLocation } from './hooks/useLiveLocation';
import { 
  TriageMode, 
  PatientProfile, 
  SymptomPayload, 
  TriageResult 
} from './types/triage';
import { 
  Baby, 
  Heart, 
  Activity, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck,
  X
} from 'lucide-react';

const DEFAULT_PROFILES: Record<TriageMode, PatientProfile> = {
  pediatric: {
    id: 'prof-pediatric',
    name: 'Maya',
    mode: 'pediatric',
    ageYears: 1,
    locationCity: 'San Francisco, CA',
    locationZip: '94107',
    pediatricSpecific: {
      weightKg: 10.5,
      recentVaccine48h: false
    }
  },
  maternal: {
    id: 'prof-maternal',
    name: 'Sarah',
    mode: 'maternal',
    ageYears: 30,
    locationCity: 'San Francisco, CA',
    locationZip: '94107',
    maternalSpecific: {
      isPregnant: true,
      gestationalWeeks: 28
    }
  },
  chronic: {
    id: 'prof-chronic',
    name: 'David',
    mode: 'chronic',
    ageYears: 48,
    locationCity: 'San Francisco, CA',
    locationZip: '94107',
    chronicSpecific: {
      condition: 'Asthma',
      baselineControl: 'well_controlled',
      medications: []
    }
  }
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<TriageMode>('pediatric');
  const [profile, setProfile] = useState<PatientProfile>(DEFAULT_PROFILES.pediatric);
  const [currentResult, setCurrentResult] = useState<TriageResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  // Update profile fields directly from the form
  const handleUpdateProfile = (updated: Partial<PatientProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  // Automatically track live location of user using GPS in the background
  useLiveLocation(handleUpdateProfile);

  // Switch mode seamlessly, preserving active GPS location
  const handleSelectMode = (newMode: TriageMode) => {
    setCurrentMode(newMode);
    setCurrentResult(null);
    setProfile((prev) => ({
      ...DEFAULT_PROFILES[newMode],
      locationCity: prev.locationCoordinates ? prev.locationCity : DEFAULT_PROFILES[newMode].locationCity,
      locationZip: prev.locationCoordinates ? prev.locationZip : DEFAULT_PROFILES[newMode].locationZip,
      locationCoordinates: prev.locationCoordinates,
      isLiveTrackingLocation: prev.isLiveTrackingLocation,
      locationTrackingStatus: prev.locationTrackingStatus,
    }));
  };

  // Execute clinical triage
  const handleTriageSubmit = async (payload: SymptomPayload) => {
    setIsLoading(true);
    setCurrentResult(null);

    try {
      const result = await runTriagePipeline(profile, payload);
      setCurrentResult(result);
    } catch (err) {
      console.error('Triage pipeline failure:', err);
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Clean Navigation Bar */}
      <Navbar
        currentMode={currentMode}
        profile={profile}
        onSelectMode={handleSelectMode}
        onTriggerEmergencyHelp={() => setShowEmergencyModal(true)}
      />

      {/* 2. Main Body Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* If a result is ready, display either Emergency Red Flag or Friendly Triage Results */}
        {currentResult ? (
          currentResult.isEmergency ? (
            <RedFlagAlert
              result={currentResult}
              profile={profile}
              onReset={() => setCurrentResult(null)}
            />
          ) : (
            <TriageResults
              result={currentResult}
              profile={profile}
              onReset={() => setCurrentResult(null)}
            />
          )
        ) : (
          /* Intake Experience */
          <div className="space-y-6">
            {/* Friendly Mode Header Banner */}
            <div className={`p-5 rounded-2xl border transition-colors ${
              currentMode === 'pediatric'
                ? 'bg-blue-50/70 border-blue-200'
                : currentMode === 'maternal'
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-white ${
                  currentMode === 'pediatric'
                    ? 'bg-blue-600'
                    : currentMode === 'maternal'
                    ? 'bg-rose-500'
                    : 'bg-emerald-600'
                }`}>
                  {currentMode === 'pediatric' && <Baby className="w-5 h-5" />}
                  {currentMode === 'maternal' && <Heart className="w-5 h-5" />}
                  {currentMode === 'chronic' && <Activity className="w-5 h-5" />}
                </div>

                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900">
                    {currentMode === 'pediatric' && 'Child Symptom Checker'}
                    {currentMode === 'maternal' && 'Pregnancy & Postpartum Symptom Checker'}
                    {currentMode === 'chronic' && 'Ongoing Health & Flare-Up Checker'}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {currentMode === 'pediatric' &&
                      'Calibrated for ages 0–18 years (infants to adolescents: fever thresholds, hydration, breathing, and vaccines).'}
                    {currentMode === 'maternal' &&
                      'Evaluates pregnancy and postpartum recovery signs (preeclampsia, headache, swelling).'}
                    {currentMode === 'chronic' &&
                      'Compares symptoms against your normal baseline rather than generic adult values.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Friendly, Simple Intake Form */}
            <ModeIntakeForm
              currentMode={currentMode}
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onSubmit={handleTriageSubmit}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>

      {/* 3. Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 text-slate-500 text-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">NicheCare</span>
            <span>•</span>
            <span>AAP, ACOG & ADA Guided Protocols</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Private & On-Device</span>
            <span>•</span>
            <span>In emergency, call 911 immediately</span>
          </div>
        </div>
      </footer>

      {/* 4. Quick Emergency Dialog */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <PhoneCall className="w-5 h-5" />
                <span>Emergency Help</span>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If you or {profile.name} are having severe trouble breathing, heavy bleeding, chest pain, or unresponsiveness, please contact emergency services right away.
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="tel:911"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call 911</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/nearest+emergency+room+near+${encodeURIComponent(profile.locationZip || '94107')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Find Nearest Emergency Room</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
