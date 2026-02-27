import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native'
import React, { memo, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import FontAwesome5 from '@expo/vector-icons/Ionicons'
import { Message } from '@/app/(Game)/Game'
import { MESSAGE_CUSTOM_TYPE_TS, MESSAGE_TYPE_TS } from '../config/serverInputs'
import { MESSAGE, MESSAGE_CUSTOM } from '../config/serverResponds'

export const SendMessage = memo(({
    color,
    setShowMessages,
    showMenuIcon,
    setMessages,
    gameId,
    sol,
    isDevnet,
    jwt,
    socket,
    gameType
}: {
    color: "w" | "b",
    setShowMessages: React.Dispatch<React.SetStateAction<boolean>>,
    showMenuIcon: boolean,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    gameId: string | null,
    sol: "0.01" | "0.05" | "0.1",
    isDevnet: boolean,
    jwt: string,
    socket: WebSocket,
    gameType: "CUSTOM" | "NORMAL"
}) => {
    const [message, setMessage] = useState<string>("")

    const handleSend = () => {
        if (!message.trim() || !gameId) return;
        if (gameType == "NORMAL") {
            const messageInput: MESSAGE_TYPE_TS = {
                type: MESSAGE,
                payload: {
                    from: color,
                    message,
                    gameId,
                    sol,
                    network: isDevnet ? "DEVNET" : "MAINNET",
                    jwt
                }
            }
            socket.send(JSON.stringify(messageInput))
        }
        else {
            const messageInput: MESSAGE_CUSTOM_TYPE_TS = {
                type: MESSAGE_CUSTOM,
                payload: {
                    from: color,
                    message,
                    gameId,
                    jwt
                }
            }
            socket.send(JSON.stringify(messageInput))
        }
        setMessages(p => [...p, { from: color, message }])
        setMessage("");
    }

    return (
        <LinearGradient
            colors={['#B048C2', '#9082DB', '#3DE3B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient]}>
            <View style={{
                backgroundColor: "#000000",
                width: "100%",
                borderRadius: 100,
                flexDirection: "row",
                alignItems: "stretch",
                justifyContent: "space-between",
            }}>
                <TextInput
                    value={message}
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
                {showMenuIcon && <TouchableOpacity
                    style={{ height: "100%" }}
                    onPress={() => {
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
                </TouchableOpacity>}
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