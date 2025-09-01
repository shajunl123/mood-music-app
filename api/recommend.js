import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=`;

// Global daily limit configuration
const DAILY_LIMIT_KEY = "daily_recommendation_count";
const MAX_DAILY_REQUESTS = 100; // Total calls allowed per day

// Per-user rate limiting configuration
const PER_USER_KEY_PREFIX = "rate_limit:";
const RATE_LIMIT_WINDOW_SECONDS = 60; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 5;    // 5 requests per minute

export default async function handler(request) {
  try {
    const { mood } = await request.json();
    const apiKey = process.env.API_KEY;

    // --- Global Daily Limit Logic ---
    const now = Date.now();
    const today = new Date(now).toISOString().split('T')[0];
    const dailyKey = `${DAILY_LIMIT_KEY}:${today}`;
    
    // Get the current daily count from Vercel KV
    const currentDailyCount = await kv.get(dailyKey) || 0;

    if (currentDailyCount >= MAX_DAILY_REQUESTS) {
      return new Response("Maximum daily limit has been reached.", { status: 429 });
    }

    // --- Per-User Rate Limiting Logic ---
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'anonymous';
    const userKey = `${PER_USER_KEY_PREFIX}:${ip}`;
    
    const [count, _] = await Promise.all([
      kv.incr(userKey),
      kv.expire(userKey, RATE_LIMIT_WINDOW_SECONDS)
    ]);
    
    if (count > MAX_REQUESTS_PER_WINDOW) {
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

    // Increment the daily count only on a successful API call
    if (keyword) {
      await kv.incr(dailyKey);
      await kv.expire(dailyKey, 86400); // Set expiration to 24 hours (86400 seconds)
    }

    return new Response(JSON.stringify({ keyword }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
