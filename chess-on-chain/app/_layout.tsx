import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen';
import { Orbitron_900Black, useFonts } from '@expo-google-fonts/orbitron';
import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAssets } from 'expo-asset';

SplashScreen.preventAutoHideAsync();

export default function () {
    const [loaded, error] = useFonts({
        Orbitron_900Black,
    });
    const [assets] = useAssets([require('../assets/image/homescreen.jpg')]);

    const onLayoutRootView = useCallback(async () => {
        if ((loaded || error) && assets) {
            await SplashScreen.hideAsync();
        }
    }, [loaded, error, assets]);

    if ((!loaded && !error) || !assets) return null;

    return(
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
    )
}