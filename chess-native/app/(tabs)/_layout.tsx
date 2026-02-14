import { StatusBar, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import FontAwesome from "@expo/vector-icons/Ionicons"

export default function () {
  return (
    <>
        <StatusBar barStyle={"default"} />
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: "#191919"
            },
            tabBarActiveTintColor: "#24E9A9",
            tabBarInactiveTintColor: "#CE2EDF",
            tabBarShowLabel: false,
            
        }}>
            <Tabs.Screen name='index' options={{
                tabBarIcon: ({color, focused}) => <FontAwesome color={color} name={focused ? "home" : "home-outline"} size={focused ? 26: 24} />,
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