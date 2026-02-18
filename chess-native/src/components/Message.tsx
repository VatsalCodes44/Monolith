import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { memo, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { TextArea } from 'tamagui'
import FontAwesome5 from '@expo/vector-icons/Ionicons'
import { Message } from '@/app/(Game)/Game'

export const Messages = memo(({
    sendMessage,
    color
}: {
    sendMessage(message: Message): void,
    color: "w" | "b"
}) => {
    const [message, setMessage] = useState<string>("")
    
    const handleSend = () => {
        if (!message.trim()) return;
        sendMessage({
            from: color,
            message
        });
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
                height: "100%",
                borderRadius: 100,
                flexDirection: "row",
                alignItems: "stretch",
                justifyContent: "space-between",
            }}>
                <TextArea
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
                />
                <TouchableOpacity 
                    style={{ height: "100%" }}
                    onPress={handleSend}
                >
                    <View style={{
                        backgroundColor: "#3DE3B4",
                        borderTopRightRadius: 100,
                        borderBottomRightRadius: 100,
                        justifyContent: "center",
                        paddingHorizontal: 12,
                        height: "100%"
                    }}>
                        <FontAwesome5 name="send" size={18} />
                    </View>
                </TouchableOpacity>
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
        marginHorizontal: 15,
        height: 48
    }
})