import { Platform } from 'react-native';
import { User, Settings } from '../types';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  maxUsage?: {
    transcripts?: number;
    cpdLogs?: number;
    forms?: number;
  };
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  currentTier: string;
  expiryDate: string | null;
  autoRenew: boolean;
  features: string[];
  usage: {
    transcripts: number;
    cpdLogs: number;
    forms: number;
  };
}

export interface BillingInfo {
  customerId: string;
  subscriptionId: string;
  lastBillingDate: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
}

class SubscriptionService {
  private isWeb = Platform.OS === 'web';
  private currentUser: User | null = null;
  private subscriptionStatus: SubscriptionStatus | null = null;

  // Define subscription tiers
  private readonly SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'GBP',
      billingPeriod: 'monthly',
      features: [
        'Voice-to-text transcription',
        'Form filling',
        'CPD logging',
        'Basic storage',
        'Local backup'
      ],
      maxUsage: {
        transcripts: 10,
        cpdLogs: 5,
        forms: 3
      }
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 3,
      currency: 'GBP',
      billingPeriod: 'monthly',
      features: [
        'Unlimited voice-to-text transcription',
        'AI suggestions and nudges',
        'Lecture summarization',
        'Educational recommendations',
        'PDF export and printing',
        'Advanced backup options',
        'Cloud integration',
        'Priority support',
        'Unlimited storage',
        'Advanced analytics'
      ]
    }
  };

  async initialize(): Promise<void> {
    try {
      console.log('Initializing SubscriptionService...');
      
      // Load user subscription status
      await this.loadSubscriptionStatus();
      
      console.log('SubscriptionService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SubscriptionService:', error);
      throw error;
    }
  }

  // Get available subscription tiers
  getSubscriptionTiers(): SubscriptionTier[] {
    return Object.values(this.SUBSCRIPTION_TIERS);
  }

  // Get current subscription status
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    if (!this.subscriptionStatus) {
      await this.loadSubscriptionStatus();
    }
    return this.subscriptionStatus!;
  }

  // Check if user has access to a specific feature
  async hasFeatureAccess(feature: string): Promise<boolean> {
    const status = await this.getSubscriptionStatus();
    
    if (status.isSubscribed) {
      return status.features.includes(feature);
    }
    
    // Check free tier features
    const freeTier = this.SUBSCRIPTION_TIERS.free;
    return freeTier.features.includes(feature);
  }

  // Check usage limits
  async checkUsageLimit(type: 'transcripts' | 'cpdLogs' | 'forms'): Promise<{ allowed: boolean; current: number; limit: number }> {
    const status = await this.getSubscriptionStatus();
    
    if (status.isSubscribed) {
      // Premium users have unlimited usage
      return { allowed: true, current: status.usage[type], limit: -1 };
    }
    
    const freeTier = this.SUBSCRIPTION_TIERS.free;
    const limit = freeTier.maxUsage?.[type] || 0;
    const current = status.usage[type];
    
    return {
      allowed: current < limit,
      current,
      limit
    };
  }

  // Subscribe to premium tier
  async subscribeToPremium(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Initiating premium subscription...');
      
      if (this.isWeb) {
        // Web: Simulate subscription
        await this.simulateWebSubscription();
      } else {
        // Mobile: Integrate with app store billing
        await this.initiateAppStoreSubscription();
      }
      
      // Update subscription status
      await this.updateSubscriptionStatus({
        isSubscribed: true,
        currentTier: 'premium',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        autoRenew: true,
        features: this.SUBSCRIPTION_TIERS.premium.features,
        usage: this.subscriptionStatus?.usage || { transcripts: 0, cpdLogs: 0, forms: 0 }
      });
      
      console.log('Premium subscription activated successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to subscribe to premium:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Subscription failed' 
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Cancelling subscription...');
      
      if (this.isWeb) {
        // Web: Simulate cancellation
        await this.simulateWebCancellation();
      } else {
        // Mobile: Cancel through app store
        await this.cancelAppStoreSubscription();
      }
      
      // Update subscription status
      await this.updateSubscriptionStatus({
        isSubscribed: false,
        currentTier: 'free',
        expiryDate: null,
        autoRenew: false,
        features: this.SUBSCRIPTION_TIERS.free.features,
        usage: this.subscriptionStatus?.usage || { transcripts: 0, cpdLogs: 0, forms: 0 }
      });
      
      console.log('Subscription cancelled successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Cancellation failed' 
      };
    }
  }

  // Restore purchases (for app store)
  async restorePurchases(): Promise<{ success: boolean; restored: boolean; error?: string }> {
    try {
      console.log('Restoring purchases...');
      
      if (this.isWeb) {
        // Web: Check localStorage for previous subscription
        const restored = await this.checkWebSubscription();
        return { success: true, restored };
      } else {
        // Mobile: Restore through app store
        const restored = await this.restoreAppStorePurchases();
        return { success: true, restored };
      }
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return { 
        success: false, 
        restored: false,
        error: error instanceof Error ? error.message : 'Restore failed' 
      };
    }
  }

  // Get billing information
  async getBillingInfo(): Promise<BillingInfo | null> {
    try {
      if (!this.subscriptionStatus?.isSubscribed) {
        return null;
      }
      
      // This would fetch from app store or payment processor
      return {
        customerId: 'customer_123',
        subscriptionId: 'sub_456',
        lastBillingDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 3,
        currency: 'GBP'
      };
    } catch (error) {
      console.error('Failed to get billing info:', error);
      return null;
    }
  }

  // Update usage statistics
  async updateUsage(type: 'transcripts' | 'cpdLogs' | 'forms'): Promise<void> {
    try {
      if (!this.subscriptionStatus) {
        await this.loadSubscriptionStatus();
      }
      
      if (this.subscriptionStatus) {
        this.subscriptionStatus.usage[type]++;
        await this.saveSubscriptionStatus();
      }
    } catch (error) {
      console.error('Failed to update usage:', error);
    }
  }

  // Get feature comparison
  getFeatureComparison(): Array<{ feature: string; free: boolean; premium: boolean }> {
    const allFeatures = [
      'Voice-to-text transcription',
      'Form filling',
      'CPD logging',
      'AI suggestions',
      'Lecture summarization',
      'Educational recommendations',
      'PDF export',
      'Cloud backup',
      'Advanced analytics',
      'Priority support'
    ];
    
    const freeFeatures = this.SUBSCRIPTION_TIERS.free.features;
    const premiumFeatures = this.SUBSCRIPTION_TIERS.premium.features;
    
    return allFeatures.map(feature => ({
      feature,
      free: freeFeatures.includes(feature),
      premium: premiumFeatures.includes(feature)
    }));
  }

  // Check if subscription is expired
  async isSubscriptionExpired(): Promise<boolean> {
    const status = await this.getSubscriptionStatus();
    
    if (!status.isSubscribed || !status.expiryDate) {
      return false;
    }
    
    return new Date(status.expiryDate) < new Date();
  }

  // Get days until expiry
  async getDaysUntilExpiry(): Promise<number | null> {
    const status = await this.getSubscriptionStatus();
    
    if (!status.isSubscribed || !status.expiryDate) {
      return null;
    }
    
    const expiryDate = new Date(status.expiryDate);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Private methods
  private async loadSubscriptionStatus(): Promise<void> {
    try {
      if (this.isWeb) {
        // Web: Load from localStorage
        const stored = localStorage.getItem('subscription-status');
        if (stored) {
          this.subscriptionStatus = JSON.parse(stored);
        }
      } else {
        // Mobile: Load from secure storage
        // This would integrate with app store APIs
        this.subscriptionStatus = await this.loadFromSecureStorage();
      }
      
      // Set default if not found
      if (!this.subscriptionStatus) {
        this.subscriptionStatus = {
          isSubscribed: false,
          currentTier: 'free',
          expiryDate: null,
          autoRenew: false,
          features: this.SUBSCRIPTION_TIERS.free.features,
          usage: { transcripts: 0, cpdLogs: 0, forms: 0 }
        };
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
      // Set default status
      this.subscriptionStatus = {
        isSubscribed: false,
        currentTier: 'free',
        expiryDate: null,
        autoRenew: false,
        features: this.SUBSCRIPTION_TIERS.free.features,
        usage: { transcripts: 0, cpdLogs: 0, forms: 0 }
      };
    }
  }

  private async saveSubscriptionStatus(): Promise<void> {
    try {
      if (this.isWeb) {
        // Web: Save to localStorage
        localStorage.setItem('subscription-status', JSON.stringify(this.subscriptionStatus));
      } else {
        // Mobile: Save to secure storage
        if (this.subscriptionStatus) {
          await this.saveToSecureStorage(this.subscriptionStatus);
        }
      }
    } catch (error) {
      console.error('Failed to save subscription status:', error);
    }
  }

  private async updateSubscriptionStatus(status: SubscriptionStatus): Promise<void> {
    this.subscriptionStatus = status;
    await this.saveSubscriptionStatus();
  }

  // Web-specific methods
  private async simulateWebSubscription(): Promise<void> {
    // Simulate web subscription process
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Web subscription simulated');
  }

  private async simulateWebCancellation(): Promise<void> {
    // Simulate web cancellation process
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Web cancellation simulated');
  }

  private async checkWebSubscription(): Promise<boolean> {
    // Check if user has previous subscription in localStorage
    const stored = localStorage.getItem('subscription-status');
    if (stored) {
      const status = JSON.parse(stored);
      return status.isSubscribed && new Date(status.expiryDate) > new Date();
    }
    return false;
  }

  // Mobile-specific methods (placeholders for app store integration)
  private async initiateAppStoreSubscription(): Promise<void> {
    // This would integrate with app store billing
    console.log('App store subscription initiated');
  }

  private async cancelAppStoreSubscription(): Promise<void> {
    // This would cancel through app store
    console.log('App store subscription cancelled');
  }

  private async restoreAppStorePurchases(): Promise<boolean> {
    // This would restore through app store
    console.log('App store purchases restored');
    return false; // No previous purchases found
  }

  private async loadFromSecureStorage(): Promise<SubscriptionStatus | null> {
    // This would load from secure storage on mobile
    return null;
  }

  private async saveToSecureStorage(status: SubscriptionStatus): Promise<void> {
    // This would save to secure storage on mobile
    console.log('Saved to secure storage');
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      console.log('SubscriptionService cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup SubscriptionService:', error);
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService; 