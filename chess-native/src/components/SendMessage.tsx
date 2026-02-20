import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { memo, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Input } from 'tamagui'
import FontAwesome5 from '@expo/vector-icons/Ionicons'
import { Message } from '@/app/(Game)/Game'

export const SendMessage = memo(({
    sendMessage,
    color,
    setShowMessages,
    showMenuIcon,
    setMessages
}: {
    sendMessage(message: Message): void,
    color: "w" | "b",
    setShowMessages: React.Dispatch<React.SetStateAction<boolean>>,
    showMenuIcon: boolean,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}) => {
    const [message, setMessage] = useState<string>("")
    
    const handleSend = () => {
        if (!message.trim()) return;
        sendMessage({
            from: color,
            message
        });
        setMessages(p=>[...p, {from: color, message}])
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
                <Input
                    value={message}
                    bg="black"
                    borderWidth={0}
                    placeholder='Send message'
                    placeholderTextColor='$purple12'
                    borderBottomLeftRadius="$12"
                    borderBottomStartRadius="$12"
                    borderTopLeftRadius="$12"
                    borderTopStartRadius="$12"
                    color="$purple11"
                    returnKeyType='send'
                    onSubmitEditing={handleSend}
                    flex={1}
                    multiline={false}
                    onChangeText={setMessage}
                    submitBehavior='blurAndSubmit'
                    marginRight={showMenuIcon ? 0 : 15}
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