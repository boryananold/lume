import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { Config } from '@/constants/config';
import type { SubscriptionTier } from '@/types/api';

const ENTITLEMENT_GLOW_PLUS = 'glow_plus';
const ENTITLEMENT_GLOW_ELITE = 'glow_elite';
const ENTITLEMENT_GLOW_CIRCLE = 'glow_circle';

export function initRevenueCat(userId: string) {
  Purchases.configure({ apiKey: Config.revenuecatApiKey, appUserID: userId });
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

export function getActiveSubscriptionTier(customerInfo: CustomerInfo): SubscriptionTier {
  if (customerInfo.entitlements.active[ENTITLEMENT_GLOW_ELITE]) return 'glow_elite';
  if (customerInfo.entitlements.active[ENTITLEMENT_GLOW_CIRCLE]) return 'glow_circle';
  if (customerInfo.entitlements.active[ENTITLEMENT_GLOW_PLUS]) return 'glow_plus';
  return 'free';
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export function addCustomerInfoUpdateListener(listener: (info: CustomerInfo) => void): void {
  Purchases.addCustomerInfoUpdateListener(listener);
}
