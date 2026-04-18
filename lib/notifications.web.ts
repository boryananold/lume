// Web stub — expo-notifications push scheduling is native-only.
// The module-level setNotificationHandler in the native file is intentionally absent here.

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleDailyReminder(
  _type: 'morning' | 'evening',
  _timeString: string
): Promise<void> {}

export async function scheduleStreakNotification(_streakDays: number): Promise<void> {}

export async function cancelAllReminders(): Promise<void> {}
