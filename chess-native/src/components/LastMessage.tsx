import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Message } from '@/app/(Game)/Game'

export function LastMessage({lastMessage, color, width}: {lastMessage: Message, color: "w" | "b", width: number}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true)
        const timer = setTimeout(() => {
            setVisible(false);
        }, 3000)

        return () => {
            clearTimeout(timer)
        }
    }, [lastMessage])
    return (
    <View style={{
        justifyContent: color == lastMessage.from ? "flex-end" : "flex-start",
        borderRadius: 100,
        flexDirection: "row",
        alignItems: "flex-end"
    }}>
        <Text 
        ellipsizeMode="tail"
        style={{
            color: "#ffffff",
            backgroundColor: color == lastMessage.from ? '#B048C2' : '#3DE3B4',
            maxWidth: width/1.5,
            fontSize: 18,
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 15,
            overflow: "hidden",
            display: visible ? "flex" : "none",
        }}>
            {lastMessage.message}
        </Text>
    </View>
    )
}

const styles = StyleSheet.create({})