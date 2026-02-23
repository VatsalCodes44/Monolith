import { CONTROL_HEIGHT } from "@/app/(tabs)/wallet";
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
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <LinearGradient
        colors={['#B048C2', '#9082DB', '#3DE3B4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {text &&<Text style={[
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
        height: CONTROL_HEIGHT,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 13,
        letterSpacing: 2,
    }
})