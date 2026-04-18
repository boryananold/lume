import Constants from 'expo-constants';

// Read extra fresh on every access — on web, the Expo manifest loads
// asynchronously after the JS bundle, so a static snapshot at module-load
// time would be an empty object.
function extra(key: string): string {
  const src: Record<string, unknown> =
    Constants.expoConfig?.extra ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants as any).manifest2?.extra ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Constants as any).manifest?.extra ??
    {};
  return (src[key] as string | undefined) ?? '';
}

export const Config = {
  get openaiApiKey()    { return extra('OPENAI_API_KEY'); },
  get supabaseUrl()     { return extra('SUPABASE_URL'); },
  get supabaseAnonKey() { return extra('SUPABASE_ANON_KEY'); },
  get revenuecatApiKey(){ return extra('REVENUECAT_API_KEY'); },
  get brazeApiKey()     { return extra('BRAZE_API_KEY'); },
  get brazeEndpoint()   { return extra('BRAZE_ENDPOINT'); },
  get mixpanelToken()   { return extra('MIXPANEL_TOKEN'); },
  get roboflowApiKey()  { return extra('ROBOFLOW_API_KEY'); },
};

export const FeatureFlags = {
  skinAnalysis: false,
  communityFeed: false,
  expertSessions: false,
} as const;

export const Paywall = {
  freeTrialDays: 14,
  monthlyPriceGlowPlus: 14.99,
  monthlyPriceGlowElite: 34.99,
  monthlyPriceGlowCircle: 9.99,
} as const;
