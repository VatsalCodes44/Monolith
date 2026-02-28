import { StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useColorScheme } from 'react-native'

export default function () {
    const colorScheme = useColorScheme()

    return <Stack screenOptions={{ headerShown: false }} />
}

const styles = StyleSheet.create({})