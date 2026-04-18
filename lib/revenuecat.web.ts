import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import type { SubscriptionTier } from '@/types/api';

// Web stub — react-native-purchases is a native-only SDK.
// On web, subscriptions go via Stripe (CLAUDE.md: Spotify playbook).

export function initRevenueCat(_userId: string): void {}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  return [];
}

export async function purchasePackage(_pkg: PurchasesPackage): Promise<CustomerInfo> {
  throw new Error('In-app purchases are not available on web. Please use the mobile app.');
}

export async function restorePurchases(): Promise<CustomerInfo> {
  throw new Error('Restore purchases is not available on web. Please use the mobile app.');
}

export function getActiveSubscriptionTier(_customerInfo: CustomerInfo): SubscriptionTier {
  return 'free';
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return { entitlements: { active: {}, all: {} } } as unknown as CustomerInfo;
}

export function addCustomerInfoUpdateListener(_listener: (info: CustomerInfo) => void): void {}
