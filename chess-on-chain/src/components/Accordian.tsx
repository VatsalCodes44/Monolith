import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import Animated, {
    SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

function AccordionItem({
  isExpanded,
  children,
  viewKey,
  style,
  duration = 500,
}: {
  isExpanded: SharedValue<boolean>;
  children: React.ReactNode;
  viewKey: string;
  style: any;
  duration?: number;
}) {
  const height = useSharedValue(0);

  const bodyStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(isExpanded.value ? height.value : 0, {
        duration,
      }),
    };
  });

  return (
    <Animated.View
      key={`accordionItem_${viewKey}`}
      style={[styles.animatedView, bodyStyle, style]}>
      <View
        onLayout={(e) => {
          if (height.value === 0) {
            height.value = e.nativeEvent.layout.height;
          }
        }}
        style={styles.wrapper}>
        {children}
      </View>
    </Animated.View>
  );
}

export function Accordian({ open, children, style }: {open: SharedValue<boolean>, children: React.ReactNode, style: any}) {
  return (
    <View style={style}>
      <AccordionItem isExpanded={open} viewKey="Accordion" style={{}}>
        {children}
      </AccordionItem>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'absolute',
  },
  animatedView: {
    width: '100%',
    overflow: 'hidden',
  },
});