import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function TopContainer({ children }: { children: React.ReactNode }) {
    return (
        <ImageBackground
        source={require("../../assets/image/homescreen.jpg")} // local image
        resizeMode="cover"
        style={{flex: 1}}
        imageStyle={{opacity: 5}}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={{ flex: 1 }}>
                    {children}
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#0D0D0F",
        paddingHorizontal: 20,
    },
});