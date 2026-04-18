import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(
  type: 'morning' | 'evening',
  timeString: string
): Promise<void> {
  const [hourStr = '0', minuteStr = '0'] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const identifier = `lume.reminder.${type}`;

  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => null);

  const content =
    type === 'morning'
      ? { title: 'Good morning ✨', body: 'Your ritual is waiting. Start your day glowing.' }
      : { title: 'Evening ritual 🌙', body: "Wind down with tonight's personalized ritual." };

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { ...content, sound: false },
    trigger: { type: SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

export async function scheduleStreakNotification(streakDays: number): Promise<void> {
  const milestones: Partial<Record<number, { title: string; body: string }>> = {
    3: { title: '3-day streak 🔥', body: "You're building something. Keep going." },
    7: { title: '7 days glowing ✨', body: 'A whole week of rituals. You are luminous.' },
    14: { title: 'Two weeks of Lumé 💛', body: 'Your skin is paying attention.' },
    30: { title: '30-day Glow streak 🌟', body: 'A month of showing up for yourself. Radiant.' },
  };

  const message = milestones[streakDays];
  if (!message) return;

  await Notifications.scheduleNotificationAsync({
    content: { ...message, sound: false },
    trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, repeats: false },
  });
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
