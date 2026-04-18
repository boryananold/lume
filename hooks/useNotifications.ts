import { useEffect, useRef } from 'react';
import { requestNotificationPermissions, scheduleDailyReminder } from '@/lib/notifications';

export function useNotifications(morningTime: string | null, eveningTime: string | null) {
  const scheduled = useRef(false);

  useEffect(() => {
    if ((!morningTime && !eveningTime) || scheduled.current) return;

    async function setup() {
      const granted = await requestNotificationPermissions();
      if (!granted) return;
      if (morningTime) await scheduleDailyReminder('morning', morningTime);
      if (eveningTime) await scheduleDailyReminder('evening', eveningTime);
      scheduled.current = true;
    }

    void setup();
  }, [morningTime, eveningTime]);
}
