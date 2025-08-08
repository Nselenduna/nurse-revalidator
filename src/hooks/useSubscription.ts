import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { subscriptionService, SubscriptionStatus, SubscriptionTier, BillingInfo } from '../services/SubscriptionService';

export interface UseSubscriptionReturn {
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionTiers: SubscriptionTier[];
  billingInfo: BillingInfo | null;
  isLoading: boolean;
  error: string | null;
  hasFeatureAccess: (feature: string) => Promise<boolean>;
  checkUsageLimit: (type: 'transcripts' | 'cpdLogs' | 'forms') => Promise<{ allowed: boolean; current: number; limit: number }>;
  subscribeToPremium: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  updateUsage: (type: 'transcripts' | 'cpdLogs' | 'forms') => Promise<void>;
  getFeatureComparison: () => Array<{ feature: string; free: boolean; premium: boolean }>;
  isSubscriptionExpired: () => Promise<boolean>;
  getDaysUntilExpiry: () => Promise<number | null>;
  refreshSubscriptionStatus: () => Promise<void>;
  clearError: () => void;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize subscription data
  useEffect(() => {
    console.log('useSubscription hook initializing...');
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load subscription tiers
      const tiers = subscriptionService.getSubscriptionTiers();
      setSubscriptionTiers(tiers);

      // Load subscription status
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);

      // Load billing info if subscribed
      if (status.isSubscribed) {
        const billing = await subscriptionService.getBillingInfo();
        setBillingInfo(billing);
      }

      console.log('Subscription data loaded successfully');
    } catch (err) {
      console.error('Failed to load subscription data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  // Check feature access
  const hasFeatureAccess = useCallback(async (feature: string): Promise<boolean> => {
    try {
      return await subscriptionService.hasFeatureAccess(feature);
    } catch (err) {
      console.error('Failed to check feature access:', err);
      return false;
    }
  }, []);

  // Check usage limits
  const checkUsageLimit = useCallback(async (type: 'transcripts' | 'cpdLogs' | 'forms'): Promise<{ allowed: boolean; current: number; limit: number }> => {
    try {
      return await subscriptionService.checkUsageLimit(type);
    } catch (err) {
      console.error('Failed to check usage limit:', err);
      return { allowed: false, current: 0, limit: 0 };
    }
  }, []);

  // Subscribe to premium
  const subscribeToPremium = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      Alert.alert(
        'Upgrade to Premium',
        'Get unlimited access to all features including AI suggestions, lecture summarization, PDF export, and more for just £3/month.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Subscribe',
            onPress: async () => {
              try {
                const result = await subscriptionService.subscribeToPremium();
                
                if (result.success) {
                  // Refresh subscription status
                  await refreshSubscriptionStatus();
                  
                  Alert.alert(
                    'Subscription Successful',
                    'Welcome to Premium! You now have access to all advanced features.',
                    [{ text: 'OK' }]
                  );
                } else {
                  throw new Error(result.error || 'Subscription failed');
                }
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Subscription failed';
                setError(errorMessage);
                Alert.alert('Subscription Error', errorMessage);
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate subscription';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      Alert.alert(
        'Cancel Subscription',
        'Are you sure you want to cancel your premium subscription? You will lose access to premium features at the end of your current billing period.',
        [
          { text: 'Keep Subscription', style: 'cancel' },
          {
            text: 'Cancel Subscription',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await subscriptionService.cancelSubscription();
                
                if (result.success) {
                  // Refresh subscription status
                  await refreshSubscriptionStatus();
                  
                  Alert.alert(
                    'Subscription Cancelled',
                    'Your subscription has been cancelled. You will continue to have access to premium features until the end of your current billing period.',
                    [{ text: 'OK' }]
                  );
                } else {
                  throw new Error(result.error || 'Cancellation failed');
                }
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Cancellation failed';
                setError(errorMessage);
                Alert.alert('Cancellation Error', errorMessage);
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate cancellation';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await subscriptionService.restorePurchases();
      
      if (result.success) {
        if (result.restored) {
          // Refresh subscription status
          await refreshSubscriptionStatus();
          
          Alert.alert(
            'Purchases Restored',
            'Your previous subscription has been restored successfully.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'No Purchases Found',
            'No previous purchases were found to restore.',
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error(result.error || 'Restore failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore purchases';
      setError(errorMessage);
      Alert.alert('Restore Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update usage
  const updateUsage = useCallback(async (type: 'transcripts' | 'cpdLogs' | 'forms'): Promise<void> => {
    try {
      await subscriptionService.updateUsage(type);
      
      // Refresh subscription status to get updated usage
      await refreshSubscriptionStatus();
    } catch (err) {
      console.error('Failed to update usage:', err);
    }
  }, []);

  // Get feature comparison
  const getFeatureComparison = useCallback((): Array<{ feature: string; free: boolean; premium: boolean }> => {
    return subscriptionService.getFeatureComparison();
  }, []);

  // Check if subscription is expired
  const isSubscriptionExpired = useCallback(async (): Promise<boolean> => {
    try {
      return await subscriptionService.isSubscriptionExpired();
    } catch (err) {
      console.error('Failed to check subscription expiry:', err);
      return false;
    }
  }, []);

  // Get days until expiry
  const getDaysUntilExpiry = useCallback(async (): Promise<number | null> => {
    try {
      return await subscriptionService.getDaysUntilExpiry();
    } catch (err) {
      console.error('Failed to get days until expiry:', err);
      return null;
    }
  }, []);

  // Refresh subscription status
  const refreshSubscriptionStatus = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      // Reload subscription status
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);

      // Reload billing info if subscribed
      if (status.isSubscribed) {
        const billing = await subscriptionService.getBillingInfo();
        setBillingInfo(billing);
      } else {
        setBillingInfo(null);
      }
    } catch (err) {
      console.error('Failed to refresh subscription status:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh subscription status');
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  console.log('useSubscription hook state:', {
    isSubscribed: subscriptionStatus?.isSubscribed,
    currentTier: subscriptionStatus?.currentTier,
    isLoading,
    error,
  });

  return {
    subscriptionStatus,
    subscriptionTiers,
    billingInfo,
    isLoading,
    error,
    hasFeatureAccess,
    checkUsageLimit,
    subscribeToPremium,
    cancelSubscription,
    restorePurchases,
    updateUsage,
    getFeatureComparison,
    isSubscriptionExpired,
    getDaysUntilExpiry,
    refreshSubscriptionStatus,
    clearError,
  };
}; 