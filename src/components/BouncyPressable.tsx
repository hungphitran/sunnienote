import React, { useRef } from 'react';
import { Pressable, Animated, PressableProps, StyleProp, ViewStyle, StyleSheet } from 'react-native';

interface BouncyPressableProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

export const BouncyPressable: React.FC<BouncyPressableProps> = ({
  children,
  style,
  scaleTo = 0.95,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      bounciness: 8,
      speed: 12,
    }).start();
    if (props.onPressIn) {
      props.onPressIn(event);
    }
  };

  const handlePressOut = (event: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
    if (props.onPressOut) {
      props.onPressOut(event);
    }
  };

  // Flatten the style sheet rules to isolate layout properties
  const flatStyle = StyleSheet.flatten(style) || {};

  // Separate properties that govern layout bounds in flex containers
  const {
    flex,
    alignSelf,
    margin,
    marginHorizontal,
    marginVertical,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    width,
    height,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
    ...visualStyle
  } = flatStyle as any;

  const pressableStyle = {
    flex,
    alignSelf,
    margin,
    marginHorizontal,
    marginVertical,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    width,
    height,
    position,
    top,
    bottom,
    left,
    right,
    zIndex,
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={pressableStyle}
    >
      <Animated.View style={[{ transform: [{ scale }], width: '100%' }, visualStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
