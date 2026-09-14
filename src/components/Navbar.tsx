import React from 'react';
import { 
  HeartPulse, 
  Baby, 
  User,
  Heart, 
  Activity, 
  PhoneCall,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';
import { TriageMode, PatientProfile } from '../types/triage';

interface NavbarProps {
  currentMode: TriageMode;
  profile?: PatientProfile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSelectMode: (mode: TriageMode) => void;
  onTriggerEmergencyHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  profile,
  theme,
  onToggleTheme,
  onSelectMode,
  onTriggerEmergencyHelp
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                OmniHealth AI
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">
                Specialized Symptom Checker
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              id="mode-tab-pediatric"
              type="button"
              onClick={() => onSelectMode('pediatric')}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentMode === 'pediatric'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Baby className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Child</span>
            </button>

            <button
              id="mode-tab-adult"
              type="button"
              onClick={() => onSelectMode('adult')}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentMode === 'adult'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Adult</span>
            </button>

            <button
              id="mode-tab-maternal"
              type="button"
              onClick={() => onSelectMode('maternal')}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentMode === 'maternal'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Pregnancy</span>
            </button>

            <button
              id="mode-tab-chronic"
              type="button"
              onClick={() => onSelectMode('chronic')}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentMode === 'chronic'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Chronic</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Location Badge (if tracked/available) */}
            {profile?.locationCity && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="font-semibold max-w-[110px] truncate">
                  {profile.locationCity}
                </span>
                {profile.isLiveTrackingLocation ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded-md">
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

            {/* Dark / Light Mode Toggle Button */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Direct Emergency Button */}
            <button
              id="emergency-call-btn"
              type="button"
              onClick={onTriggerEmergencyHelp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Emergency</span>
              <span className="sm:hidden">911</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
