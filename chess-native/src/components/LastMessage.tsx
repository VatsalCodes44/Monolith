import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Message } from '@/app/(Game)/Game'

export function LastMessage({lastMessage, color, width}: {lastMessage: Message, color: "w" | "b", width: number}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
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
        display: visible ? "flex" : "none",
        borderRadius: 100,
        maxHeight: 96,
        width: "auto",
        flexDirection: "row"
    }}>
        <Text 
        numberOfLines={5}
        ellipsizeMode="tail"
        style={{
            color: "#ffffff",
            backgroundColor: color == lastMessage.from ? '#B048C2' : '#3DE3B4',
            maxWidth: width/1.5
        }}>
            {lastMessage.message}
        </Text>
    </View>
    )
}

const styles = StyleSheet.create({})