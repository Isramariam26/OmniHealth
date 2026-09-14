import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini client helper with User-Agent telemetry
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Resilient model fallback pool to gracefully handle temporary 503 high demand spikes
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

async function callWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Model request timed out')), timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

async function generateWithFallbackAndRetry(ai: GoogleGenAI, prompt: string): Promise<string> {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await callWithTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        }),
        6000
      );

      const text = response.text;
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      // Immediately try next model in candidate pool
      continue;
    }
  }

  throw lastError || new Error('All model candidates unavailable');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

// Outbreak context endpoint by ZIP / region
app.get('/api/outbreaks', (req, res) => {
  const region = (req.query.region as string) || 'general';
  
  // Real-world simulated CDC FluView & Regional Health feeds
  const outbreakDatabase: Record<string, any[]> = {
    general: [
      {
        id: 'outbreak-1',
        pathogen: 'Respiratory Syncytial Virus (RSV)',
        severity: 'Elevated Seasonality',
        affectedGroup: 'Infants & Toddlers (under 2 years)',
        headline: 'RSV regional positivity rate trending upward (12.4% pediatric testing)',
        source: 'CDC FluView / National Respiratory Viral Surveillance',
        dateReported: 'Current Surveillance Week',
        relevanceNote: 'Infants with cough, fever, or wheezing may have RSV exposure.'
      },
      {
        id: 'outbreak-2',
        pathogen: 'Streptococcal Pharyngitis (Strep A)',
        severity: 'Moderate Community Cluster',
        affectedGroup: 'School-age children (5-15 years)',
        headline: 'Local public health bulletin: Group A Strep cluster reported in elementary schools',
        source: 'County Department of Public Health Alert',
        dateReported: 'Updated 2 days ago',
        relevanceNote: 'Sudden high fever, sore throat without cough, or strawberry tongue.'
      },
      {
        id: 'outbreak-3',
        pathogen: 'Norovirus (Viral Gastroenteritis)',
        severity: 'Active Seasonal Surge',
        affectedGroup: 'All age groups, community & daycare',
        headline: 'Norovirus wastewater & clinical alerts elevated across metropolitan health districts',
        source: 'Regional Disease Surveillance Network',
        dateReported: 'Updated this week',
        relevanceNote: 'Rapid onset vomiting, watery diarrhea, rapid risk of dehydration.'
      }
    ]
  };

  const signals = outbreakDatabase[region] || outbreakDatabase.general;
  res.json({ region, signals });
});

// Reverse Geocode endpoint for GPS coordinates
app.get('/api/geocode/reverse', async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and Longitude query parameters required' });
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'NicheCareTriageApp/2.0 (Healthcare clinical symptom triage system; support@nichecare.local)'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (geoRes.ok) {
      const data: any = await geoRes.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.county || 'Detected Area';
      const state = addr.state || addr.region || '';
      const zip = addr.postcode || '';
      const country = addr.country || '';
      const formattedCity = state ? `${city}, ${state}` : city;

      return res.json({
        city: formattedCity,
        zip,
        state,
        country,
        fullAddress: data.display_name || formattedCity,
        coords: { lat: latitude, lng: longitude }
      });
    }
  } catch (err) {
    console.warn('Nominatim reverse geocoding failed or timed out:', err);
  }

  // Graceful fallback with formatted coordinates
  const latStr = `${Math.abs(latitude).toFixed(3)}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(longitude).toFixed(3)}° ${longitude >= 0 ? 'E' : 'W'}`;

  return res.json({
    city: `Near ${latStr}, ${lngStr}`,
    zip: '',
    state: '',
    country: '',
    fullAddress: `Coordinates: ${latStr}, ${lngStr}`,
    coords: { lat: latitude, lng: longitude }
  });
});

// LLM dual reading level synthesizer (Grounded on structured triage & citations)
app.post('/api/triage/synthesize', async (req, res) => {
  try {
    const {
      mode,
      profile,
      symptoms,
      urgencyTier,
      triageProtocol,
      clinicalGuidance,
      redFlagsDetected,
      citations,
      outbreakSignals
    } = req.body;

    const ai = getGeminiClient();

    // If Gemini is not configured, send back structured fallback signal so client uses verified clinical text
    if (!ai) {
      return res.json({
        synthesized: false,
        reason: 'Using authoritative clinical engine fallbacks (Gemini API key not configured or offline)'
      });
    }

    const prompt = `
You are an expert clinical communication assistant for an AI medical symptom checker.
You MUST adhere strictly to these safety and communication rules:
1. DO NOT invent facts, diagnoses, or medications not provided in the inputs.
2. The active mode is "${mode}".
3. Urgency Tier is "${urgencyTier}".
4. STRICT SAFETY RULE: If Urgency Tier is "HIGH_ALERT" or "EMERGENCY", you MUST NOT suggest any home remedies, herbal treatments, or self-care steps. You must strictly instruct the user to contact their specialized healthcare provider immediately.
5. Home care steps are ONLY permitted if Urgency Tier is "LOW_HOME_CARE".
6. Incorporate local public health signals: If active local outbreak signals match the user's symptoms (e.g. RSV surge, Norovirus, Group A Strep), mention how local disease surveillance informs why doctors evaluate for this condition.
7. Generate two distinct reading level explanations:
   - "simple": "Explain Like I'm 12" — plain language, calm, reassuring, short sentences, zero dense jargon, clear direct instructions.
   - "clinical": "Explain Like a Clinician" — SBAR-oriented (Situation, Background, Assessment, Recommendation), clinical terms, protocol codes, vital signs thresholds, and precise differential citations.

Input Data:
- Patient Profile: ${JSON.stringify(profile)}
- Symptoms Reported: ${JSON.stringify(symptoms)}
- Protocol Matched: ${triageProtocol}
- Clinical Guidance: ${clinicalGuidance}
- Red Flags: ${JSON.stringify(redFlagsDetected)}
- Retrieved Citations: ${JSON.stringify(citations)}
- Local Outbreak / Public Health Surveillance Alerts: ${JSON.stringify(outbreakSignals || [])}

Respond ONLY with valid JSON in this schema:
{
  "simple": {
    "headline": "Short plain-language heading",
    "whatItMeans": "Clear explanation of what's happening",
    "whatToDoNext": "Direct action steps",
    "watchOutSigns": ["Specific warning sign 1", "Specific warning sign 2"]
  },
  "clinical": {
    "sbarSummary": "Concise SBAR clinical overview",
    "triageCode": "Protocol reference code",
    "clinicalRationale": "Pathophysiological and protocol-based reasoning",
    "recommendedAction": "Exact clinical escalation recommendation",
    "escalationCriteria": ["Clinical threshold 1", "Clinical threshold 2"]
  }
}
`;

    const text = await generateWithFallbackAndRetry(ai, prompt);
    if (!text) {
      throw new Error('Empty response from model');
    }

    // Strip markdown fences if present
    const cleanedText = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    return res.json({
      synthesized: true,
      data: parsed
    });
  } catch (error: any) {
    const errorDetail = error?.message || String(error);
    console.warn('Gemini synthesis gracefully deferred to clinical protocol engine:', errorDetail);
    return res.json({
      synthesized: false,
      reason: 'Clinical protocol fallback active (AI service demand spike)'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NicheCare server running on http://localhost:${PORT}`);
  });
}

startServer();
