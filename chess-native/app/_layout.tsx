import { StyleSheet, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useColorScheme } from 'react-native'
import { TamaguiProvider } from 'tamagui'
import { tamaguiConfig } from '../tamagui.config'


import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function () {
    const colorScheme = useColorScheme()

    return (
        
    <GluestackUIProvider mode="dark">
        <>
        <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{headerShown: false}}/>
            </ThemeProvider>
        </TamaguiProvider>
        </>
    </GluestackUIProvider>
  
    )
}

const styles = StyleSheet.create({})