import React from 'react';
import { 
  HeartPulse, 
  Baby, 
  Heart, 
  Activity, 
  PhoneCall,
  MapPin,
  Navigation
} from 'lucide-react';
import { TriageMode, PatientProfile } from '../types/triage';

interface NavbarProps {
  currentMode: TriageMode;
  profile?: PatientProfile;
  onSelectMode: (mode: TriageMode) => void;
  onTriggerEmergencyHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  profile,
  onSelectMode,
  onTriggerEmergencyHelp
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                NicheCare
              </span>
              <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
                Specialized Symptom Checker
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              id="mode-tab-pediatric"
              type="button"
              onClick={() => onSelectMode('pediatric')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentMode === 'pediatric'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Baby className="w-4 h-4 text-blue-600" />
              <span>Child</span>
            </button>

            <button
              id="mode-tab-maternal"
              type="button"
              onClick={() => onSelectMode('maternal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentMode === 'maternal'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Pregnancy</span>
            </button>

            <button
              id="mode-tab-chronic"
              type="button"
              onClick={() => onSelectMode('chronic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentMode === 'chronic'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Chronic</span>
            </button>
          </div>

          {/* Location Badge (if tracked/available) */}
          {profile?.locationCity && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="font-semibold max-w-[130px] truncate">
                {profile.locationCity}
              </span>
              {profile.isLiveTrackingLocation ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Live</span>
                </span>
              ) : profile.locationCoordinates ? (
                <span className="text-[10px] text-slate-500 font-mono">
                  GPS
                </span>
              ) : null}
            </div>
          )}

          {/* Direct Emergency Button */}
          <button
            id="emergency-call-btn"
            type="button"
            onClick={onTriggerEmergencyHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emergency</span>
            <span className="sm:hidden">911</span>
          </button>
        </div>
      </div>
    </header>
  );
};
