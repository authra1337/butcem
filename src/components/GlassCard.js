import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export default function GlassCard({ children, style, intensity = 45 }) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView 
        intensity={intensity} 
        tint="dark" 
        style={[styles.glassCard, styles.iosShadow, style]}
      >
        <View style={styles.borderOverlay}>
          {children}
        </View>
      </BlurView>
    );
  }

  // Android için alternatif şık yarı saydam tasarım
  return (
    <View style={[styles.glassCard, styles.androidFallback, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 10, 30, 0.55)', // iOS için ve genel kontrast için yarı saydam koyu taban
  },
  borderOverlay: {
    padding: 16,
    width: '100%',
  },
  iosShadow: {
    // iOS için derinlik katan gölge efekti
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  androidFallback: {
    // Android için buzlu cam görünümünü taklit eden yarı saydam koyu renk
    backgroundColor: 'rgba(20, 14, 38, 0.75)',
    padding: 16,
    elevation: 8,
  },
});
