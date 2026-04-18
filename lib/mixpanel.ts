import { Mixpanel } from 'mixpanel-react-native';
import { Config } from '@/constants/config';

let _mixpanel: Mixpanel | null = null;

function getClient(): Mixpanel | null {
  if (!Config.mixpanelToken) return null;
  if (!_mixpanel) {
    _mixpanel = new Mixpanel(Config.mixpanelToken, true);
    _mixpanel.init();
  }
  return _mixpanel;
}

export function identify(userId: string, traits?: Record<string, string | number | boolean>) {
  const client = getClient();
  if (!client) return;
  client.identify(userId);
  if (traits) client.getPeople().set(traits);
}

export function track(event: string, properties?: Record<string, string | number | boolean>) {
  getClient()?.track(event, properties);
}

export function reset() {
  getClient()?.reset();
}

// Typed event helpers — add one per analytics event
export const Events = {
  onboardingStarted: () => track('Onboarding Started'),
  onboardingCompleted: (skinType: string) => track('Onboarding Completed', { skin_type: skinType }),
  checkInCompleted: (glowScore: number) => track('Check-In Completed', { glow_score: glowScore }),
  ritualGenerated: () => track('Ritual Generated'),
  paywallShown: (trigger: string) => track('Paywall Shown', { trigger }),
  subscriptionStarted: (tier: string, price: number) => track('Subscription Started', { tier, price }),
  streakMilestone: (days: number) => track('Streak Milestone', { days }),
  circleCreated: () => track('Circle Created'),
  circleJoined: () => track('Circle Joined'),
} as const;
