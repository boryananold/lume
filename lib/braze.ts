// Braze requires a dev build (not Expo Go). Stub interface for managed workflow.
// Replace with @braze/react-native-sdk imports after running `expo prebuild`.

export interface BrazeUser {
  userId: string;
  email: string;
  subscriptionTier: string;
}

export function identifyUser(_user: BrazeUser): void {
  // TODO: Braze.changeUser(_user.userId)
  // TODO: Braze.setEmail(_user.email)
  // TODO: Braze.setCustomUserAttribute('subscription_tier', _user.subscriptionTier)
}

export function logEvent(_name: string, _properties?: Record<string, string | number | boolean>): void {
  // TODO: Braze.logCustomEvent(_name, _properties)
}

export function scheduleStreakReminder(_userId: string, _streakCount: number): void {
  // TODO: trigger Braze in-app message or push campaign
}

export function triggerPaywallCampaign(_userId: string): void {
  // TODO: trigger Day-14 paywall campaign
}

export function triggerWinBackSequence(_userId: string): void {
  // TODO: trigger churn win-back sequence
}
