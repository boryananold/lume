import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';

type Destination = 'onboarding' | 'login' | 'tabs' | null;

export default function IndexRoute() {
  const [destination, setDestination] = useState<Destination>(null);

  useEffect(() => {
    async function resolve() {
      try {
        const [{ data: { session } }, raw] = await Promise.all([
          supabase.auth.getSession(),
          AsyncStorage.getItem('lume.onboarding'),
        ]);

        if (!session) {
          // No auth session — send to login if they've onboarded, onboarding if brand new
          setDestination(raw ? 'login' : 'onboarding');
        } else {
          setDestination('tabs');
        }
      } catch {
        setDestination('onboarding');
      }
    }
    void resolve();
  }, []);

  if (destination === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.gold} />
      </View>
    );
  }

  if (destination === 'onboarding') return <Redirect href="/(auth)/onboarding" />;
  if (destination === 'login') return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
