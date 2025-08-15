import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../constants';
import { useSubscription } from '../hooks/useSubscription';

export const SubscriptionManager: React.FC = () => {
  const {
    subscriptionStatus,
    subscriptionTiers,
    billingInfo,
    isLoading,
    error,
    subscribeToPremium,
    cancelSubscription,
    restorePurchases,
    getFeatureComparison,
    getDaysUntilExpiry,
    refreshSubscriptionStatus,
    clearError,
  } = useSubscription();

  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);

  // Load days until expiry on mount
  useEffect(() => {
    if (subscriptionStatus?.isSubscribed) {
      loadDaysUntilExpiry();
    }
  }, [subscriptionStatus]);

  const loadDaysUntilExpiry = async () => {
    const days = await getDaysUntilExpiry();
    setDaysUntilExpiry(days);
  };

  const handleUpgrade = () => {
    subscribeToPremium();
  };

  const handleCancel = () => {
    cancelSubscription();
  };

  const handleRestore = () => {
    restorePurchases();
  };

  const handleRefresh = () => {
    refreshSubscriptionStatus();
  };

  const renderCurrentPlan = () => {
    if (!subscriptionStatus) return null;

    const currentTier = subscriptionTiers.find(tier => tier.id === subscriptionStatus.currentTier);
    
    return (
      <View style={styles.currentPlanContainer}>
        <Text style={styles.sectionTitle}>Current Plan</Text>
        
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{currentTier?.name || 'Free'}</Text>
            <Text style={styles.planPrice}>
              {currentTier?.price === 0 ? 'Free' : `£${currentTier?.price}/month`}
            </Text>
          </View>
          
          {subscriptionStatus.isSubscribed && (
            <View style={styles.subscriptionDetails}>
              <Text style={styles.subscriptionText}>
                Expires: {subscriptionStatus.expiryDate ? new Date(subscriptionStatus.expiryDate).toLocaleDateString() : 'Unknown'}
              </Text>
              {daysUntilExpiry !== null && (
                <Text style={[styles.subscriptionText, daysUntilExpiry <= 7 ? styles.warningText : null]}>
                  {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                </Text>
              )}
              <Text style={styles.subscriptionText}>
                Auto-renew: {subscriptionStatus.autoRenew ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
          
          <View style={styles.planFeatures}>
            <Text style={styles.featuresTitle}>Included Features:</Text>
            {currentTier?.features.map((feature, index) => (
              <Text key={index} style={styles.featureItem}>• {feature}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderBillingInfo = () => {
    if (!billingInfo || !subscriptionStatus?.isSubscribed) return null;

    return (
      <View style={styles.billingContainer}>
        <Text style={styles.sectionTitle}>Billing Information</Text>
        
        <View style={styles.billingCard}>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Customer ID:</Text>
            <Text style={styles.billingValue}>{billingInfo.customerId}</Text>
          </View>
          
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Subscription ID:</Text>
            <Text style={styles.billingValue}>{billingInfo.subscriptionId}</Text>
          </View>
          
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Last Billed:</Text>
            <Text style={styles.billingValue}>
              {new Date(billingInfo.lastBillingDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Next Billing:</Text>
            <Text style={styles.billingValue}>
              {new Date(billingInfo.nextBillingDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Amount:</Text>
            <Text style={styles.billingValue}>
              £{billingInfo.amount} {billingInfo.currency}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFeatureComparison = () => {
    const featureComparison = getFeatureComparison();
    
    return (
      <View style={styles.comparisonContainer}>
        <Text style={styles.sectionTitle}>Feature Comparison</Text>
        
        <View style={styles.comparisonTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Feature</Text>
            <Text style={styles.tableHeaderText}>Free</Text>
            <Text style={styles.tableHeaderText}>Premium</Text>
          </View>
          
          {featureComparison.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.featureName}>{item.feature}</Text>
              <Text style={[styles.featureStatus, item.free ? styles.available : styles.unavailable]}>
                {item.free ? '✓' : '✗'}
              </Text>
              <Text style={[styles.featureStatus, item.premium ? styles.available : styles.unavailable]}>
                {item.premium ? '✓' : '✗'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Subscription Actions</Text>
        
        {!subscriptionStatus?.isSubscribed ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.upgradeButton]}
            onPress={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Upgrade to Premium (£3/month)</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Cancel Subscription</Text>
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.restoreButton]}
          onPress={handleRestore}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.restoreButtonText]}>Restore Purchases</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.refreshButton]}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.refreshButtonText]}>Refresh Status</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && !subscriptionStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading subscription information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Subscription Management</Text>
        <Text style={styles.subtitle}>
          Manage your subscription and access to premium features
        </Text>
      </View>

      {/* Current Plan */}
      {renderCurrentPlan()}

      {/* Billing Information */}
      {renderBillingInfo()}

      {/* Feature Comparison */}
      {renderFeatureComparison()}

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.clearErrorButton} onPress={clearError}>
            <Text style={styles.clearErrorText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All subscriptions are managed through your app store account
        </Text>
        <Text style={styles.footerText}>
          Cancel anytime • No commitment • No ads • No tracking
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    padding: SPACING.MD,
    paddingBottom: SPACING.XL,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
  },
  header: {
    marginBottom: SPACING.LG,
  },
  title: {
    ...TYPOGRAPHY.H1,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
  },
  currentPlanContainer: {
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  planCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  planName: {
    ...TYPOGRAPHY.H3,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  planPrice: {
    ...TYPOGRAPHY.H3,
    color: COLORS.SUCCESS,
    fontWeight: '600',
  },
  subscriptionDetails: {
    marginBottom: SPACING.MD,
    paddingBottom: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  subscriptionText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  warningText: {
    color: COLORS.ERROR,
    fontWeight: '600',
  },
  planFeatures: {
    marginTop: SPACING.SM,
  },
  featuresTitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
    marginBottom: SPACING.SM,
  },
  featureItem: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.XS,
  },
  billingContainer: {
    marginBottom: SPACING.LG,
  },
  billingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  billingLabel: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  billingValue: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY,
  },
  comparisonContainer: {
    marginBottom: SPACING.LG,
  },
  comparisonTable: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
  },
  tableHeaderText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_100,
  },
  featureName: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY,
    flex: 2,
  },
  featureStatus: {
    ...TYPOGRAPHY.H2,
    flex: 1,
    textAlign: 'center',
  },
  available: {
    color: COLORS.SUCCESS,
  },
  unavailable: {
    color: COLORS.GRAY_400,
  },
  actionsContainer: {
    marginBottom: SPACING.LG,
  },
  actionButton: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  upgradeButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  cancelButton: {
    backgroundColor: COLORS.ERROR,
  },
  restoreButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  refreshButton: {
    backgroundColor: COLORS.GRAY_200,
  },
  buttonText: {
    ...TYPOGRAPHY.BUTTON,
    color: COLORS.WHITE,
  },
  restoreButtonText: {
    color: COLORS.WHITE,
  },
  refreshButtonText: {
    color: COLORS.TEXT_PRIMARY,
  },
  errorContainer: {
    backgroundColor: COLORS.ERROR + '20',
    borderWidth: 1,
    borderColor: COLORS.ERROR,
    borderRadius: BORDER_RADIUS.SM,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.ERROR,
    flex: 1,
  },
  clearErrorButton: {
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
  },
  clearErrorText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.LG,
  },
  footerText: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.XS,
  },
}); 