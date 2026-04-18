import OpenAI from 'openai';
import { Config } from '@/constants/config';
import type { RitualGenerationRequest, RitualGenerationResponse } from '@/types/api';

const MODEL = 'gpt-5.4' as const;
const TIMEOUT_MS = 60_000;

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: Config.openaiApiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return _client;
}

const SYSTEM_PROMPT = `You are Lumé's AI wellness companion. You create deeply personalised daily rituals for women based on their skin type, wellness goals, mood, energy, and recent history.

Your tone is warm, feminine, aspirational, and science-backed. Never use shame-based language, weight-related language, or body comparisons. Always say "your ritual" not "your routine". Use "Glow" as both verb and noun. Say "aging powerfully" never "anti-aging". Never say "fix" — instead say "enhance" or "nurture".

You MUST respond with ONLY a JSON object in exactly this structure — no other keys, no extra nesting:
{
  "morningRitual": [
    { "id": "m1", "title": "Step title", "description": "Step description", "durationMinutes": 5, "category": "skincare" }
  ],
  "eveningRitual": [
    { "id": "e1", "title": "Step title", "description": "Step description", "durationMinutes": 5, "category": "mindfulness" }
  ],
  "affirmation": "A short empowering affirmation sentence.",
  "glowTip": "One actionable glow tip for today.",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}

category must be one of: skincare, movement, nutrition, mindfulness, sleep.
Include 3-5 steps in each ritual. Return ONLY the JSON, no explanation text.`;

function extractBase64(dataUrl: string): { data: string; mimeType: string } {
  const comma = dataUrl.indexOf(',');
  const header = comma > -1 ? dataUrl.slice(0, comma) : '';
  const data = comma > -1 ? dataUrl.slice(comma + 1) : dataUrl;
  const mimeType = header.split(':')[1]?.split(';')[0] ?? 'image/jpeg';
  return { data, mimeType };
}

async function uriToBase64(uri: string): Promise<{ data: string; mimeType: string }> {
  if (uri.startsWith('data:')) return extractBase64(uri);
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(extractBase64(reader.result as string));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function analyzePhoto(photoUri: string): Promise<string> {
  const { data, mimeType } = await uriToBase64(photoUri);

  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_completion_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${data}`, detail: 'low' },
          },
          {
            type: 'text',
            text: 'Analyse this skin photo briefly. Note visible hydration, radiance, and any areas that could benefit from targeted care. Keep it to 2-3 sentences, warm and empowering in tone.',
          },
        ],
      },
    ],
  }, { timeout: TIMEOUT_MS });

  return response.choices[0]?.message?.content ?? '';
}

export async function generateRitual(
  request: RitualGenerationRequest & { skinAnalysis?: string }
): Promise<RitualGenerationResponse> {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_completion_tokens: 1500,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify(request) },
    ],
  }, { timeout: TIMEOUT_MS });

  const text = response.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(text) as RitualGenerationResponse;
  if (!Array.isArray(parsed.morningRitual) || !Array.isArray(parsed.eveningRitual)) {
    throw new Error(`Unexpected response shape from gpt-5.4: ${text.slice(0, 200)}`);
  }
  return parsed;
}
