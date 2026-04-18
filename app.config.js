/** @type {import('expo/config').ConfigContext} */
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    './plugins/withFollyCoroutinesFix',
  ],
  extra: {
    ...config.extra,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
    SUPABASE_URL: process.env.SUPABASE_URL ?? '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? '',
    REVENUECAT_API_KEY: process.env.REVENUECAT_API_KEY ?? '',
    BRAZE_API_KEY: process.env.BRAZE_API_KEY ?? '',
    BRAZE_ENDPOINT: process.env.BRAZE_ENDPOINT ?? '',
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN ?? '',
    ROBOFLOW_API_KEY: process.env.ROBOFLOW_API_KEY ?? '',
  },
});
