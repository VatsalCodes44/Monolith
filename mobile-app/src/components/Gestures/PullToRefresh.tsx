import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from "react-native-reanimated";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isAtTop = useSharedValue(true);
  const pullDistance = useSharedValue(0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
    pullDistance.value = withSpring(0);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetY([0, 10])       // only activate for downward swipes
    .failOffsetY([-5, 999])       // fail immediately on upward swipe
    .onUpdate((e) => {
      if (isAtTop.value && e.translationY > 0 && !isRefreshing) {
        pullDistance.value = Math.min(e.translationY * 0.4, 100);
      }
    })
    .onEnd(() => {
      if (pullDistance.value > 60 && !isRefreshing) {
        runOnJS(handleRefresh)();
      } else {
        pullDistance.value = withSpring(0);
      }
    });

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullDistance.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pullDistance.value, [0, 60], [0, 1]),
    transform: [{ translateY: pullDistance.value - 40 }],
  }));

  const handleScroll = (e: any) => {
    isAtTop.value = e.nativeEvent.contentOffset.y <= 0;
  };

  // Inject scroll tracking into the FlatList child
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        onScroll: handleScroll,
        scrollEventThrottle: 16,
        bounces: false,
      });
    }
    return child;
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]}>
        <ActivityIndicator
          size="large"
          color={isRefreshing ? "#ffffff" : "#ffffff66"}
        />
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[{ flex: 1 }, contentStyle]}>
          {childrenWithProps}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});