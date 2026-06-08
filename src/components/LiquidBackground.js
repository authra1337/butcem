import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LiquidBackground({ theme }) {
  // Animasyon değerleri
  const anim1 = useRef(new Animated.ValueXY({ x: -20, y: -20 })).current;
  const anim2 = useRef(new Animated.ValueXY({ x: width - 100, y: height - 200 })).current;
  const anim3 = useRef(new Animated.ValueXY({ x: -50, y: height / 2 })).current;

  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Küre 1 Animasyonu (Sıvı gibi rastgele hareket)
    const animateBlob1 = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(anim1, {
            toValue: { x: width * 0.4, y: height * 0.1 },
            duration: 15000,
            useNativeDriver: true,
          }),
          Animated.timing(anim1, {
            toValue: { x: width * 0.1, y: height * 0.4 },
            duration: 18000,
            useNativeDriver: true,
          }),
          Animated.timing(anim1, {
            toValue: { x: -20, y: -20 },
            duration: 15000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale1, {
            toValue: 1.3,
            duration: 20000,
            useNativeDriver: true,
          }),
          Animated.timing(scale1, {
            toValue: 0.8,
            duration: 20000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateBlob1());
    };

    // Küre 2 Animasyonu
    const animateBlob2 = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(anim2, {
            toValue: { x: width * 0.2, y: height * 0.6 },
            duration: 22000,
            useNativeDriver: true,
          }),
          Animated.timing(anim2, {
            toValue: { x: width * 0.6, y: height * 0.4 },
            duration: 16000,
            useNativeDriver: true,
          }),
          Animated.timing(anim2, {
            toValue: { x: width - 100, y: height - 200 },
            duration: 20000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale2, {
            toValue: 0.7,
            duration: 18000,
            useNativeDriver: true,
          }),
          Animated.timing(scale2, {
            toValue: 1.2,
            duration: 18000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateBlob2());
    };

    // Küre 3 Animasyonu
    const animateBlob3 = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(anim3, {
            toValue: { x: width * 0.5, y: height * 0.3 },
            duration: 17000,
            useNativeDriver: true,
          }),
          Animated.timing(anim3, {
            toValue: { x: width * 0.2, y: height * 0.8 },
            duration: 19000,
            useNativeDriver: true,
          }),
          Animated.timing(anim3, {
            toValue: { x: -50, y: height / 2 },
            duration: 17000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale3, {
            toValue: 1.1,
            duration: 15000,
            useNativeDriver: true,
          }),
          Animated.timing(scale3, {
            toValue: 0.9,
            duration: 15000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateBlob3());
    };

    animateBlob1();
    animateBlob2();
    animateBlob3();
  }, []);

  const bgColors = theme?.bgGradient || ['#090514', '#140c28', '#080312'];
  const blob1Color = theme?.blobColors?.[0] || '#ff2a8d';
  const blob2Color = theme?.blobColors?.[1] || '#00f2fe';
  const blob3Color = theme?.blobColors?.[2] || '#7f00ff';

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Koyu Derin Arka Plan Gradiyenti */}
      <LinearGradient
        colors={bgColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Sıvı Küre 1 */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: blob1Color,
            shadowColor: blob1Color,
            transform: [
              { translateX: anim1.x },
              { translateY: anim1.y },
              { scale: scale1 },
            ],
          },
        ]}
      />

      {/* Sıvı Küre 2 */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: blob2Color,
            shadowColor: blob2Color,
            transform: [
              { translateX: anim2.x },
              { translateY: anim2.y },
              { scale: scale2 },
            ],
          },
        ]}
      />

      {/* Sıvı Küre 3 */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: blob3Color,
            shadowColor: blob3Color,
            transform: [
              { translateX: anim3.x },
              { translateY: anim3.y },
              { scale: scale3 },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.18, // Reduced from 0.35 to prevent clashing with transparent foreground elements
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
    elevation: 20, // Android için

  },
});
