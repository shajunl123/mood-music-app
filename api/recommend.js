export const config = {
  runtime: 'edge',
};

const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=`;

// A simple in-memory store for rate limiting. 
// Note: This will reset whenever the serverless function "wakes up" (cold start), but is sufficient for preventing basic abuse.
const requestCounts = {};
const RATE_LIMIT_WINDOW_MS = 60000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 5; // 5 requests per minute

export default async function handler(request) {
  try {
    const { mood } = await request.json();
    const apiKey = process.env.API_KEY;

    // --- Rate Limiting Logic ---
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();

    if (!requestCounts[ip]) {
      requestCounts[ip] = { count: 0, lastRequest: now };
    }

    // Reset count if the window has passed
    if (now - requestCounts[ip].lastRequest > RATE_LIMIT_WINDOW_MS) {
      requestCounts[ip].count = 0;
      requestCounts[ip].lastRequest = now;
    }

    requestCounts[ip].count++;

    if (requestCounts[ip].count > MAX_REQUESTS_PER_WINDOW) {
      return new Response("Too many requests. Please try again in a minute.", { status: 429 });
    }
    // --- End Rate Limiting Logic ---

    if (!apiKey) {
      return new Response("API key not configured.", { status: 500 });
    }

    const moodsData = {
      calm: 'calm',
      romantic: 'romantic',
      joyful: 'joyful',
      sad: 'sad',
      energetic: 'energetic',
      epic: 'epic',
      meditative: 'meditative',
      dramatic: 'dramatic',
      suspenseful: 'suspenseful',
      peaceful: 'peaceful'
    };
    const moodList = Object.keys(moodsData).join(", ");
    const systemPrompt = `
      You are a sentiment analyzer. Your sole purpose is to analyze the user's input and respond with a single keyword from the following list that best represents the overall mood or context: ${moodList}. If no mood from the list matches, respond with 'none'. Your response must be only a single word.
    `;

    const payload = {
      "contents": [{ "parts": [{ "text": mood }] }],
      "systemInstruction": { "parts": [{ "text": systemPrompt }] },
      "generationConfig": {
        "responseMimeType": "text/plain"
      }
    };

    const apiUrlWithKey = `${API_URL}${apiKey}`;
    const response = await fetch(apiUrlWithKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return new Response(`API response error: ${response.statusText}`, { status: response.status });
    }

    const result = await response.json();
    const keyword = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();

    return new Response(JSON.stringify({ keyword }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
