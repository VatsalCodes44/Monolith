import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, StyleSheet, View } from "react-native";

export function GradientCard({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={['#B048C2', '#9082DB', '#3DE3B4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBorder}
    >
      <ImageBackground 
      source={require("../../assets/image/card.jpg")} // local image
      resizeMode="cover"
      style={styles.cardInner}>
        {children}
      </ImageBackground>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
    gradientBorder: {
        borderRadius: 20,
        padding: 1.5,
        marginBottom: 26,
    },

    cardInner: {
        borderRadius: 18,
        padding: 22,
    },
})