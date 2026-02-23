import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export function GradientCard({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={['#B048C2', '#9082DB', '#3DE3B4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBorder}
    >
      <View style={styles.cardInner}>
        {children}
      </View>
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
        backgroundColor: '#141417',
        borderRadius: 18,
        padding: 22,
    },
})