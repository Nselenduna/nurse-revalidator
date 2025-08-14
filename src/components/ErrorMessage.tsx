import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '../constants';
import { TYPOGRAPHY } from '../constants/typography';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss,
  type = 'error' 
}) => {
  const [slideAnim] = useState(new Animated.Value(100));

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    if (onDismiss) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return COLORS.ERROR_LIGHT;
      case 'warning':
        return '#FEF3C7';
      case 'info':
        return '#E0F2FE';
      default:
        return COLORS.ERROR_LIGHT;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return COLORS.ERROR;
      case 'warning':
        return '#92400E';
      case 'info':
        return '#075985';
      default:
        return COLORS.ERROR;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Text style={[styles.message, { color: getTextColor() }]}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity 
          onPress={onDismiss} 
          style={styles.dismissButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.select({ ios: 44, android: 16 }),
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  message: {
    flex: 1,
    fontSize: TYPOGRAPHY.BODY.MEDIUM.fontSize,
    fontWeight: '500',
    marginRight: 8,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    color: COLORS.GRAY_600,
  }
});
