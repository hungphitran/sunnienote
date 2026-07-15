import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

export interface ConfettiRef {
  trigger: (x: number, y: number) => void;
}

interface Particle {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  emoji: string;
}

const EMOJIS = ['✨', '🌟', '🌸', '💖', '🎉'];

export const ConfettiView = forwardRef<ConfettiRef, {}>((_, ref) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useImperativeHandle(ref, () => ({
    trigger(x: number, y: number) {
      const newParticles: Particle[] = Array.from({ length: 12 }).map((_, i) => {
        const id = `${Date.now()}_${i}`;
        const pX = new Animated.Value(x);
        const pY = new Animated.Value(y);
        const opacity = new Animated.Value(1);
        const scale = new Animated.Value(0.4 + Math.random() * 0.6);
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        const targetX = x + Math.cos(angle) * (50 + Math.random() * 100);
        const targetY = y + Math.sin(angle) * (50 + Math.random() * 100);

        // Animate individual particle
        Animated.parallel([
          Animated.timing(pX, {
            toValue: targetX,
            duration: 800 + Math.random() * 400,
            useNativeDriver: true,
          }),
          Animated.timing(pY, {
            toValue: targetY,
            duration: 800 + Math.random() * 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 800 + Math.random() * 400,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1.2,
            useNativeDriver: true,
            friction: 4,
          }),
        ]).start(() => {
          // Remove particle from state when done
          setParticles(prev => prev.filter(p => p.id !== id));
        });

        return { id, x: pX, y: pY, opacity, scale, emoji };
      });

      setParticles(prev => [...prev, ...newParticles]);
    },
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <Animated.Text
          key={p.id}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
              opacity: p.opacity,
            },
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    fontSize: 20,
    zIndex: 9999,
  },
});
