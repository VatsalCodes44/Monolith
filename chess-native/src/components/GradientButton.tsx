import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export function GradientButton({
  text,
  children,
  onPress,
  fontFamily
}: {
  text?: string,
  children?: React.ReactNode,
  onPress: () => void,
  fontFamily?: string
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.button}>
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
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 52,
    minWidth: 160,
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