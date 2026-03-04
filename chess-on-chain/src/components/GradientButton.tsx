import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import { View } from "react-native-reanimated/lib/typescript/Animated";

export function GradientButton({
  text,
  children,
  onPress,
  fontFamily,
  disabled,
  minWidth,
  marginBottom=0
}: {
  text?: string,
  children?: React.ReactNode,
  onPress?: () => void,
  fontFamily?: string,
  disabled: boolean,
  minWidth?: number
  marginBottom?: number
}) {
  return (
    <Animated.View
    entering={ZoomIn.duration(200).delay(50).springify()} 
    exiting={ZoomOut.duration(200).delay(50).springify()}
    style={{
      marginBottom
    }}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[
        styles.button,
        {
          opacity: disabled ? 0.5 : 1,
          minWidth: minWidth ? minWidth : 160,
        }
      ]} disabled={disabled}>
        <LinearGradient
          colors={['#B048C2', '#9082DB', '#3DE3B4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {text && <Text style={[
            styles.buttonText,
            {
              fontFamily
            }
          ]}>{text}</Text>}
          {children && children}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 52,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    letterSpacing: 1.5,
    textAlign: "center",
    textAlignVertical: "center",
    paddingHorizontal: 16
  }
})