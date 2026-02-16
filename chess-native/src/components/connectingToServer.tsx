import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Orbitron_900Black, useFonts } from '@expo-google-fonts/orbitron';

export function ConnectingToServer() {
    let [fontsLoaded] = useFonts({
        Orbitron_900Black,
    });
    return (
        <SafeAreaView style={{
            ...styles.container, 
            justifyContent: "center"
            }}>
            <View>
                <ActivityIndicator color={"#CE2EDF"} size={64}/>
                <Text style={{
                color: "#ffffffff",
                fontFamily: fontsLoaded ? "Orbitron_900Black": "Roboto",
                textAlign: "center",
                fontSize: 22
                }}>
                Connecting to server
                </Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#191919"
  }
})