export const config = {
  runtime: 'edge',
};

const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=`;

export default async function handler(request) {
  try {
    const { mood } = await request.json();
    const apiKey = process.env.API_KEY;

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
