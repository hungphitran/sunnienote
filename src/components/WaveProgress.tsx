import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../config/theme';

interface WaveProgressProps {
  progress: number; // 0 to 1
  height?: number;
}

const screenWidth = Dimensions.get('window').width - 40; // Approx card width

export const WaveProgress: React.FC<WaveProgressProps> = ({
  progress,
  height = 20,
}) => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous horizontal wave animation
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [waveAnim]);

  useEffect(() => {
    // Smooth transition when progress changes
    Animated.spring(progressAnim, {
      toValue: Math.max(0, Math.min(1, progress)),
      useNativeDriver: false, // width/flex layout cannot use native driver
      friction: 8,
      tension: 40,
    }).start();
  }, [progress, progressAnim]);

  // Translate waveAnim (0 to 1) to horizontal offset (-screenWidth to 0)
  const translateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -screenWidth],
  });

  // Calculate width style from progress
  const widthPercent = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Generate repeating wave SVG path
  // Screen width is divided into wave segments
  const waveHeight = 4;
  const w = screenWidth;
  const h = height;
  const y = waveHeight;
  
  // We need a path that is 2x screenWidth wide so it can repeat seamlessly.
  // M 0 y - start
  // Q w/4 (y-waveHeight) w/2 y - first half wave
  // Q 3w/4 (y+waveHeight) w y - second half wave
  // (repeat)
  const pathD = `
    M 0 ${y}
    Q ${w / 4} ${y - waveHeight} ${w / 2} ${y}
    T ${w} ${y}
    Q ${w + w / 4} ${y - waveHeight} ${w + w / 2} ${y}
    T ${2 * w} ${y}
    L ${2 * w} ${h}
    L 0 ${h}
    Z
  `;

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.progressFill, { width: widthPercent }]}>
        <Animated.View
          style={[
            styles.waveContainer,
            {
              width: screenWidth * 2,
              height,
              transform: [{ translateX }],
            },
          ]}
        >
          <Svg width={screenWidth * 2} height={height}>
            <Path d={pathD} fill={COLORS.secondaryFixed} />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondaryFixed,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
