import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Fonts, FontSizes, Spacing, TextStyles } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSubscription } from '@/hooks/useSubscription';

interface SessionType {
  id: string;
  title: string;
  expert: string;
  duration: string;
  description: string;
}

const SESSION_TYPES: SessionType[] = [
  {
    id: 'skin_consult',
    title: 'Skin Consultation',
    expert: 'Dr. Amara Osei',
    duration: '30 min',
    description: 'Personalized skin analysis and ritual planning with a licensed dermatologist.',
  },
  {
    id: 'wellness_coaching',
    title: 'Wellness Coaching',
    expert: 'Sofia Vega',
    duration: '45 min',
    description: 'Holistic wellness session combining movement, mindfulness, and nutrition guidance.',
  },
  {
    id: 'sleep_ritual',
    title: 'Sleep Ritual Design',
    expert: 'Dr. Linh Tran',
    duration: '30 min',
    description: 'Science-backed evening ritual design for deeper, more restorative sleep.',
  },
];

const AVAILABLE_SLOTS = [
  'Mon, 9:00 AM', 'Mon, 2:00 PM',
  'Tue, 10:00 AM', 'Tue, 4:00 PM',
  'Wed, 9:00 AM', 'Wed, 3:00 PM',
  'Thu, 11:00 AM', 'Thu, 5:00 PM',
  'Fri, 10:00 AM', 'Fri, 2:00 PM',
];

export default function BookingScreen() {
  const { data: user } = useCurrentUser();
  const { data: subscription } = useSubscription();
  const tier = subscription?.tier ?? 'free';
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookedMessage, setBookedMessage] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  if (tier !== 'glow_elite') {
    return (
      <ScreenContainer>
        <Text style={[TextStyles.display2, styles.title]}>Expert Sessions</Text>
        <Card style={styles.gateCard}>
          <Text style={styles.gateLabel}>Glow Elite exclusive</Text>
          <Text style={[TextStyles.body, styles.gateText]}>
            Expert sessions are available on the Glow Elite plan. Upgrade to book your first session.
          </Text>
          <Button
            label="Upgrade to Glow Elite"
            onPress={() => router.push('/paywall')}
            style={{ marginTop: Spacing.md }}
          />
        </Card>
        <Button label="Back" variant="ghost" onPress={() => router.back()} style={{ marginTop: Spacing.sm }} />
      </ScreenContainer>
    );
  }

  async function handleBook() {
    if (!selectedSession || !selectedSlot || !user?.id) return;
    const session = SESSION_TYPES.find((s) => s.id === selectedSession);
    if (!session) return;

    setBooking(true);
    try {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 3);

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        session_type: selectedSession,
        expert_name: session.expert,
        scheduled_at: scheduledAt.toISOString(),
        notes: selectedSlot,
      });
      if (error) throw error;

      setBookedMessage(`Your ${session.title} with ${session.expert} is confirmed for ${selectedSlot}.`);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setBooking(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.overline}>Glow Elite</Text>
      <Text style={[TextStyles.display2, styles.title]}>Expert Sessions</Text>

      <Text style={styles.sectionLabel}>Choose your session</Text>
      {SESSION_TYPES.map((session) => (
        <TouchableOpacity
          key={session.id}
          onPress={() => setSelectedSession(session.id)}
          activeOpacity={0.8}
        >
          <Card style={{ ...styles.sessionCard, ...(selectedSession === session.id ? styles.sessionSelected : {}) }}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionDuration}>{session.duration}</Text>
            </View>
            <Text style={styles.sessionExpert}>{session.expert}</Text>
            <Text style={[TextStyles.body, styles.sessionDesc]}>{session.description}</Text>
          </Card>
        </TouchableOpacity>
      ))}

      {selectedSession && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: Spacing.lg }]}>Choose a time</Text>
          <View style={styles.slotsGrid}>
            {AVAILABLE_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                onPress={() => setSelectedSlot(slot)}
                style={[styles.slot, selectedSlot === slot && styles.slotSelected]}
              >
                <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextSelected]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {bookedMessage ? (
        <Card style={styles.bookedCard}>
          <Text style={styles.bookedTitle}>Session booked!</Text>
          <Text style={[TextStyles.body, styles.bookedText]}>{bookedMessage}</Text>
          <Button label="Done" onPress={() => router.back()} style={{ marginTop: Spacing.md }} />
        </Card>
      ) : (
        <>
          {bookingError ? <Text style={styles.bookingError}>{bookingError}</Text> : null}
          <Button
            label="Book session"
            onPress={handleBook}
            disabled={!selectedSession || !selectedSlot}
            loading={booking}
            style={styles.bookBtn}
          />
          <Button label="Back" variant="ghost" onPress={() => router.back()} />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bookedCard: {
    backgroundColor: `${Colors.sage}15`,
    borderColor: Colors.sage,
    marginBottom: Spacing.md,
  },
  bookedTitle: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  bookedText: {
    color: Colors.textSecondary,
  },
  bookingError: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  overline: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: { marginBottom: Spacing.xl },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  gateCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  gateLabel: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.lg,
    color: Colors.gold,
    marginBottom: Spacing.sm,
  },
  gateText: { color: Colors.textSecondary, textAlign: 'center' },
  sessionCard: { marginBottom: Spacing.sm },
  sessionSelected: { borderColor: Colors.gold, borderWidth: 2 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  sessionTitle: { fontFamily: Fonts.displayMedium, fontSize: FontSizes.md, color: Colors.text },
  sessionDuration: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.sm, color: Colors.textSecondary },
  sessionExpert: { fontFamily: Fonts.bodySemiBold, fontSize: FontSizes.sm, color: Colors.gold, marginBottom: Spacing.xs },
  sessionDesc: { color: Colors.textSecondary },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  slot: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  slotSelected: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  slotText: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.sm, color: Colors.text },
  slotTextSelected: { color: Colors.surface },
  bookBtn: { marginBottom: Spacing.sm },
});
