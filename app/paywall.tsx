import { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Fonts, FontSizes, Spacing, TextStyles } from '@/constants/theme';
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/revenuecat';

// Acceptance criteria: __tests__/acceptance/paywall.test.ts
// - Shows 3 plan tiers with pricing and features
// - "Continue free" dismisses the screen
// - Purchase flow calls RevenueCat and routes to tabs on success
// - "Restore purchases" restores previous subscription

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  highlight: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'glow_plus',
    name: 'Glow+',
    price: '$14.99',
    period: '/month',
    highlight: false,
    features: [
      'Unlimited AI rituals',
      'Skin analysis (camera)',
      'Full glow score history',
      'Community access',
    ],
  },
  {
    id: 'glow_elite',
    name: 'Glow Elite',
    price: '$34.99',
    period: '/month',
    highlight: true,
    features: [
      'Everything in Glow+',
      'Expert session booking',
      'Custom routines',
      'Brand perks + Annual PDF',
    ],
  },
  {
    id: 'glow_circle',
    name: 'Glow Circle',
    price: '$9.99',
    period: '/month/user',
    highlight: false,
    features: [
      'Private Circle (up to 5)',
      'Shared streak board',
      'Circle affirmations',
      'Group accountability',
    ],
  },
];

export default function PaywallScreen() {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase(planId: string) {
    setPurchasing(planId);
    setError(null);
    try {
      const packages = await getOfferings();
      const pkg = packages.find((p) => p.product.identifier.includes(planId));
      if (!pkg) throw new Error('Plan not available. Please try again.');
      await purchasePackage(pkg);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    setError(null);
    try {
      await restorePurchases();
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not restore purchases.');
    } finally {
      setRestoring(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.overline}>Unlock your ritual</Text>
      <Text style={[TextStyles.display2, styles.title]}>Finally, your light — fully amplified.</Text>
      <Text style={[TextStyles.body, styles.subtitle]}>
        You've built a beautiful habit. Keep your streak alive and go deeper.
      </Text>

      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          style={plan.highlight ? { ...styles.planCard, ...styles.planCardHighlight } : styles.planCard}
        >
          {plan.highlight && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Most popular</Text>
            </View>
          )}
          <Text style={[styles.planName, plan.highlight && styles.planNameHighlight]}>
            {plan.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{plan.price}</Text>
            <Text style={styles.period}>{plan.period}</Text>
          </View>

          <View style={styles.featureList}>
            {plan.features.map((f) => (
              <Text key={f} style={styles.feature}>✦ {f}</Text>
            ))}
          </View>

          <Button
            label={purchasing === plan.id ? 'Processing…' : `Start with ${plan.name}`}
            onPress={() => handlePurchase(plan.id)}
            disabled={!!purchasing || restoring}
            loading={purchasing === plan.id}
            variant={plan.highlight ? 'primary' : 'ghost'}
            style={styles.planBtn}
          />
        </Card>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={restoring ? 'Restoring…' : 'Restore purchases'}
        variant="ghost"
        onPress={handleRestore}
        disabled={!!purchasing || restoring}
        style={styles.restore}
      />

      <Button
        label="Continue free"
        variant="ghost"
        onPress={() => router.back()}
        style={styles.skip}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  overline: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  planCard: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  planCardHighlight: {
    borderColor: Colors.gold,
    borderWidth: 1.5,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gold,
    borderRadius: 9999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginBottom: Spacing.sm,
  },
  badgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
    color: Colors.surface,
  },
  planName: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.xl,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  planNameHighlight: {
    color: Colors.gold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  price: {
    fontFamily: Fonts.displayBold,
    fontSize: FontSizes['3xl'],
    color: Colors.text,
  },
  period: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  featureList: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  feature: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  planBtn: {
    marginTop: Spacing.xs,
  },
  error: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.error,
    textAlign: 'center',
    marginVertical: Spacing.sm,
  },
  restore: {
    marginTop: Spacing.md,
  },
  skip: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
});
