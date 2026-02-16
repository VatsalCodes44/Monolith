import { StatusBar, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { Tabs } from 'expo-router'
import FontAwesome from "@expo/vector-icons/Ionicons"
import { socketConnection } from '@/src/store/store'
import { WS_URL } from '@/src/config/config'
import { ConnectingToServer } from '@/src/components/connectingToServer'

export default function () {
    const socket = socketConnection((state) => state.socket)
    const setSocket = socketConnection((state) => state.setSocket)
    const removeSocket = socketConnection((state) => state.removeSocket)
    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            setSocket(ws);
        };

        ws.onclose = () => {
            removeSocket();
        };

        ws.onerror = () => {
            removeSocket();
        };

        return () => {
            ws.close();
        };

    }, []);

    if (!socket) {
        return <ConnectingToServer />
    }

    return (
        <>
            <StatusBar barStyle={"default"} />
            <Tabs screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#191919"
                },
                tabBarActiveTintColor: "#3DE3B4",
                tabBarInactiveTintColor: "#B048C2",
                tabBarShowLabel: false,
                
            }}>
                <Tabs.Screen name='index' options={{
                    tabBarIcon: ({color, focused}) => <FontAwesome color={color} name={focused ? "home" : "home-outline"} size={focused ? 26: 24} />,
                }}/>
                <Tabs.Screen name='games' options={{
                    tabBarIcon: ({color, focused}) => <FontAwesome color={color} name={focused ? "game-controller" : "game-controller-outline"} size={focused ? 26: 24} />,
                }}/>
                <Tabs.Screen name='wallet' options={{
                    tabBarIcon: ({color, focused}) => <FontAwesome color={color} name={focused ? "wallet" : "wallet-outline"}  size={focused ? 26: 24} />,
                }}/>
                <Tabs.Screen name='profile' options={{
                    tabBarIcon: ({color, focused}) => <FontAwesome color={color} name={focused ? "person" : "person-outline"} size={focused ? 26: 24} />,
                }}/>
                
            </Tabs>
        </>
    )
}

const styles = StyleSheet.create({})