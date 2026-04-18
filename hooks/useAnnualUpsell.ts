import { useState, useEffect } from 'react';
import { getActiveSubscriptionTier } from '@/lib/revenuecat';
import Purchases from 'react-native-purchases';

export function useAnnualUpsell() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        const tier = getActiveSubscriptionTier(customerInfo);
        if (tier === 'free') return;

        const purchaseDate = customerInfo.originalPurchaseDate;
        if (!purchaseDate) return;

        const daysSince = Math.floor(
          (Date.now() - new Date(purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        const hasAnnual = Object.keys(customerInfo.entitlements.active).some((k) =>
          k.includes('annual')
        );

        if (daysSince >= 60 && !hasAnnual) setShouldShow(true);
      } catch {
        // Fail silently — upsell is non-critical
      }
    }

    void check();
  }, []);

  return shouldShow;
}
