import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen';
import { Orbitron_900Black, useFonts } from '@expo-google-fonts/orbitron';
import { useCallback, useEffect, useRef  } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAssets } from 'expo-asset';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from '@/src/utils/notifications';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

export default function () {
    const router = useRouter();
    const responseListener = useRef<Notifications.EventSubscription>(null);
    const [loaded, error] = useFonts({
        Orbitron_900Black,
    });
    const [assets] = useAssets([require('../assets/image/homescreen.jpg')]);

    const onLayoutRootView = useCallback(async () => {
        if ((loaded || error) && assets) {
            await SplashScreen.hideAsync();
        }
    }, [loaded, error, assets]);

    useEffect(() => {
        registerForPushNotifications()
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            const data = response.notification.request.content.data;
            router.push("/")
        }
        );

        return () => {
            responseListener.current?.remove();
        };
    }, []);

    if ((!loaded && !error) || !assets) return null;

    return(
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
                <Stack screenOptions={{ headerShown: false }} />
            </GestureHandlerRootView>
        </ErrorBoundary>
    )
}