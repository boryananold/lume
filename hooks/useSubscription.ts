import { useState, useEffect } from 'react';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import { getActiveSubscriptionTier } from '@/lib/revenuecat';
import type { SubscriptionTier } from '@/types/api';

interface SubscriptionState {
  data: { tier: SubscriptionTier; customerInfo: CustomerInfo } | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const tier = getActiveSubscriptionTier(customerInfo);
        if (!cancelled) setState({ data: { tier, customerInfo }, isLoading: false, error: null });
      } catch (err) {
        if (!cancelled) {
          setState({ data: null, isLoading: false, error: err instanceof Error ? err : new Error(String(err)) });
        }
      }
    }

    void load();

    try {
      Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        if (cancelled) return;
        const tier = getActiveSubscriptionTier(customerInfo);
        setState({ data: { tier, customerInfo }, isLoading: false, error: null });
      });
    } catch {
      // Native module not available (web / uninitialized RevenueCat)
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
