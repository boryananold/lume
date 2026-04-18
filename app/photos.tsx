import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts, FontSizes, Radius, Spacing, TextStyles } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface PhotoEntry {
  id: string;
  photo_url: string;
  completed_at: string;
  glow_score: number;
}

export default function PhotosScreen() {
  const { data: user } = useCurrentUser();
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      const { data } = await supabase
        .from('check_ins')
        .select('id, photo_url, completed_at, glow_score')
        .eq('user_id', user!.id)
        .not('photo_url', 'is', null)
        .order('completed_at', { ascending: false });

      setPhotos(
        (data ?? []).map((r) => ({
          id: r.id as string,
          photo_url: r.photo_url as string,
          completed_at: r.completed_at as string,
          glow_score: Number(r.glow_score),
        }))
      );
      setIsLoading(false);
    }

    void load();
  }, [user?.id]);

  const first = photos[photos.length - 1];
  const latest = photos[0];

  return (
    <ScreenContainer scroll>
      <Text style={styles.overline}>Your journey</Text>
      <Text style={[TextStyles.display2, styles.title]}>Before & After</Text>

      {isLoading ? (
        <ActivityIndicator color={Colors.gold} style={{ marginTop: Spacing.xl }} />
      ) : photos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[TextStyles.body, styles.emptyText]}>
            No photos yet. Enable the camera during your check-in to start tracking your glow journey.
          </Text>
          <Button
            label="Start a check-in"
            onPress={() => router.push('/check-in')}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      ) : (
        <>
          {photos.length >= 2 && first != null && latest != null && (
            <View style={styles.compareRow}>
              <View style={styles.compareItem}>
                <Image source={{ uri: first.photo_url }} style={styles.compareImage} resizeMode="cover" />
                <Text style={styles.compareLabel}>Day 1</Text>
                <Text style={styles.compareDate}>
                  {new Date(first.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <View style={styles.compareArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
              <View style={styles.compareItem}>
                <Image source={{ uri: latest.photo_url }} style={styles.compareImage} resizeMode="cover" />
                <Text style={styles.compareLabel}>Today</Text>
                <Text style={styles.compareDate}>
                  {new Date(latest.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionLabel}>All photos ({photos.length})</Text>
          <FlatList
            data={photos}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.gridItem}>
                <Image source={{ uri: item.photo_url }} style={styles.gridImage} resizeMode="cover" />
                <Text style={styles.gridScore}>{item.glow_score}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.grid}
          />
        </>
      )}

      <Button label="Back" variant="ghost" onPress={() => router.back()} style={{ marginTop: Spacing.md }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  overline: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: { marginBottom: Spacing.xl },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xl },
  emptyText: { color: Colors.textSecondary, textAlign: 'center' },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  compareItem: { flex: 1, alignItems: 'center' },
  compareImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  compareLabel: { fontFamily: Fonts.displayMedium, fontSize: FontSizes.sm, color: Colors.text },
  compareDate: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.xs, color: Colors.textSecondary },
  compareArrow: { paddingHorizontal: Spacing.sm },
  arrowText: { fontSize: 24, color: Colors.gold },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  grid: { gap: 2 },
  gridItem: { flex: 1 / 3, aspectRatio: 1, position: 'relative', margin: 1 },
  gridImage: { width: '100%', height: '100%', borderRadius: 4 },
  gridScore: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    fontFamily: Fonts.displayMedium,
    fontSize: 11,
    color: Colors.surface,
    backgroundColor: `${Colors.gold}CC`,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
});
