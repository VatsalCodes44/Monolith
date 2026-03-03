// FIXES:
// 1. Replaced Ionicons with FontAwesome5 from 'expo-vector-icons/Ionicons' — exactly matching SendMessage
// 2. Added returnKeyType="send", multiline={false}, submitBehavior="blurAndSubmit" — matching SendMessage
// 3. Fixed gradient style to match SendMessage exactly (paddingVertical/Horizontal: 2, not padding: 2)
// 4. Fixed container to use width:"100%" + alignItems:"stretch" matching SendMessage
// 5. Fixed menu icon TouchableOpacity to have height:"100%" wrapper View with proper border radius
// 6. Added spectator check on menu icon press (was missing)

import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import React, { memo, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import FontAwesome5 from '@expo/vector-icons/Ionicons'
import { Message } from '@/src/config/game'

export const BotSendMessage = memo(({
    color,
    setShowMessages,
    showMenuIcon,
    setMessages,
    setLastMessage,
    spectator = false
}: {
    color: "w" | "b",
    setShowMessages: React.Dispatch<React.SetStateAction<boolean>>,
    showMenuIcon: boolean,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setLastMessage: React.Dispatch<React.SetStateAction<Message | undefined>>,
    spectator?: boolean,
}) => {
    const [message, setMessage] = useState<string>("")

    const handleSend = () => {
        if (spectator) return
        if (!message.trim()) return
        const newMsg: Message = { from: color, message }
        setMessages(p => [...p, newMsg])
        setLastMessage(newMsg)
        setMessage("")
    }

    return (
        <LinearGradient
            colors={['#B048C2', '#9082DB', '#3DE3B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
        >
            <View style={{
                backgroundColor: "#000000",
                width: "100%",
                borderRadius: 100,
                flexDirection: "row",
                alignItems: "stretch",
                justifyContent: "space-between",
            }}>
                <TextInput
                    value={spectator ? "" : message}
                    placeholder='Send message'
                    placeholderTextColor='#cf96d8'
                    returnKeyType='send'
                    onSubmitEditing={handleSend}
                    multiline={false}
                    onChangeText={setMessage}
                    submitBehavior='blurAndSubmit'
                    style={{
                        backgroundColor: "#000",
                        borderWidth: 0,
                        borderTopLeftRadius: 50,
                        borderBottomLeftRadius: 50,
                        borderBottomStartRadius: 50,
                        borderTopStartRadius: 50,
                        color: "#B048C2",
                        flex: 1,
                        marginRight: showMenuIcon ? 0 : 15,
                    }}
                />
                {showMenuIcon && (
                    <TouchableOpacity
                        style={{ height: "100%" }}
                        onPress={() => {
                            if (spectator) return
                            setShowMessages(true)
                        }}
                    >
                        <View style={{
                            borderTopRightRadius: 100,
                            borderBottomRightRadius: 100,
                            justifyContent: "center",
                            paddingHorizontal: 12,
                            height: "100%"
                        }}>
                            <FontAwesome5 name="menu-sharp" color="#3DE3B4" size={28} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </LinearGradient>
    )
})

const styles = StyleSheet.create({
    gradient: {
        paddingVertical: 2,
        paddingHorizontal: 2,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 100,
        overflow: "hidden",
        height: 48
    }
})