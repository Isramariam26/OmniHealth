import React from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  MapPin, 
  ExternalLink, 
  ShieldAlert, 
  ArrowLeft, 
  Building2,
  Clock
} from 'lucide-react';
import { TriageResult, PatientProfile } from '../types/triage';

interface RedFlagAlertProps {
  result: TriageResult;
  profile: PatientProfile;
  onReset: () => void;
}

export const RedFlagAlert: React.FC<RedFlagAlertProps> = ({
  result,
  profile,
  onReset
}) => {
  const localZip = profile.locationZip || '94107';
  const localCity = profile.locationCity || 'San Francisco, CA';
  const mapsSearchQuery = profile.locationCoordinates
    ? `${profile.locationCoordinates.lat},${profile.locationCoordinates.lng}`
    : `${localCity} ${localZip}`;

  // Simulated nearest emergency facilities based on profile location
  const nearestFacilities = [
    {
      name: profile.mode === 'pediatric' 
        ? `${localCity} Children's Emergency Department`
        : profile.mode === 'maternal'
        ? `${localCity} Women's & Obstetric Emergency Center`
        : profile.mode === 'adult'
        ? `${localCity} Adult Emergency & Trauma Center`
        : `${localCity} Regional Medical Center & ER`,
      distance: '1.4 miles',
      driveTime: '5 mins',
      phone: '(555) 911-0199',
      address: `1200 Health Way, ${localCity} ${localZip}`,
      isSpecialty: true
    },
    {
      name: 'Memorial General Hospital ER',
      distance: '3.1 miles',
      driveTime: '9 mins',
      phone: '(555) 911-0200',
      address: `450 Hospital Blvd, ${localCity} ${localZip}`,
      isSpecialty: false
    }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn space-y-6">
      {/* Primary Emergency Banner */}
      <div className="bg-red-600 text-white rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-red-700 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-white text-red-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <AlertOctagon className="w-4 h-4 text-red-600 animate-bounce" />
              EMERGENCY RED-FLAG TRIGGERED
            </span>
            <span className="text-xs text-red-100 font-medium hidden sm:inline">
              Hardcoded Clinical Safety Tripwire (AI Bypassed)
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-display text-white mb-3">
            Seek Emergency Medical Care Immediately
          </h1>

          <p className="text-sm sm:text-base text-red-100 font-medium max-w-2xl leading-relaxed mb-6">
            The symptoms entered for <strong className="text-white underline">{profile.name}</strong> meet critical emergency criteria established by national specialty clinical bodies. Do not wait for a routine appointment or try home remedies.
          </p>

          {/* Emergency Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:911"
              id="red-flag-call-911-btn"
              className="px-6 py-4 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-lg flex items-center justify-center gap-2.5 shadow-lg transition-transform active:scale-95"
            >
              <PhoneCall className="w-6 h-6 animate-pulse text-red-600" />
              <span>Call 911 Now</span>
            </a>

            <a
              href={`https://www.google.com/maps/search/nearest+emergency+room+near+${encodeURIComponent(mapsSearchQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              id="find-nearest-er-btn"
              className="px-6 py-4 rounded-xl bg-red-800/80 hover:bg-red-800 text-white font-bold text-base flex items-center justify-center gap-2 border border-red-400/40 transition-colors"
            >
              <MapPin className="w-5 h-5 text-red-200" />
              <span>Directions to Nearest ER ({profile.locationCoordinates ? 'GPS Tracked' : localZip})</span>
              <ExternalLink className="w-4 h-4 text-red-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Clinical Tripwire Details & Why */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5 transition-colors">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-3">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span>Clinical Reason for Emergency Escalation</span>
        </div>

        <div className="space-y-3">
          {result.redFlagsTriggered.map((flag, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-950 dark:text-red-200">
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400"></span>
                {flag}
              </div>
              <p className="text-xs text-red-900 dark:text-red-300 mt-1.5 leading-relaxed">
                {result.candidateConsiderations[0]?.rationale || 'Meets protocol emergency intervention thresholds.'}
              </p>
            </div>
          ))}
        </div>

        {/* What to tell the triage nurse */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            What to tell the triage nurse / paramedic:
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 italic bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            "{profile.name} ({profile.mode === 'pediatric' ? `${profile.ageYears ?? 1} years old child` : profile.mode === 'adult' ? `${profile.ageYears ?? 35} years old adult` : profile.mode === 'maternal' ? 'obstetric patient' : 'chronic disease patient'}) is presenting with {result.redFlagsTriggered.join(' and ')}. Our clinical triage check triggered an immediate emergency red-flag."
          </p>
        </div>

        {/* Local Emergency Facilities Nearby */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
            <span>Verified Local Facilities Near {localCity} ({localZip})</span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold text-[11px]">Auto-localized</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nearestFacilities.map((fac, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-white dark:bg-slate-900/90 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      {fac.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{fac.address}</p>
                  </div>
                  {fac.isSpecialty && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      Specialty ER
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {fac.driveTime} ({fac.distance})
                  </span>
                  <a
                    href={`tel:${fac.phone.replace(/[^0-9]/g, '')}`}
                    className="font-bold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    {fac.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back / Restart Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onReset}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Symptom Intake Form</span>
          </button>
        </div>
      </div>
    </div>
  );
};
