import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import GradientCard2 from './GradientCard2'
import { GradientButton } from './GradientButton'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function JoinSpectate() {
    const [gameId, setGameId] = useState("")
    return (
        <GradientCard2 padding={20}>
            <View style={styles.cardInner}>

                <View style={[
                    styles.inputContainer,
                    {
                        borderColor: "#B048C2",
                        borderWidth: 1,
                    }
                ]}>
                    <Ionicons
                        name="game-controller-outline"
                        size={18}
                        color="#B048C2"
                        style={{ marginRight: 10 }}
                    />
                    <TextInput
                        placeholder="Game Id..."
                        placeholderTextColor="#6B7280"
                        value={gameId}
                        onChangeText={setGameId}
                        style={styles.input}
                        cursorColor="#B048C2"
                        autoCorrect={false}
                        autoCapitalize="none"
                        autoComplete="off"
                    />
                </View>

                <View style={{
                    marginTop: 26,
                    gap: 10,
                    opacity: false ? .5 : 1,
                    flexDirection: "row",
                    justifyContent: "space-between"
                }}>
                    <GradientButton
                        minWidth={145}
                        text={"JOIN ARENA"}
                        onPress={() => {
                            router.push({
                                pathname: "/JoinCustom/[gameId]",
                                params: {
                                    gameId,
                                },
                            })
                        }}
                        fontFamily="Orbitron_900Black"
                        disabled={false}
                    />
                    <GradientButton
                        minWidth={145}
                        text={"SPECTATE"}
                        onPress={() => {}}
                        fontFamily="Orbitron_900Black"
                        disabled={false}
                    />
                </View>
            </View>
        </GradientCard2>
    )
}

const styles = StyleSheet.create({
    cardBorder: {
        padding: 3,
        borderRadius: 18,
        marginBottom: 28,
    },

    cardInner: {
        borderRadius: 16,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1F1F24",
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1,
        borderColor: "#2A2A30",
    },
    input: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 14,
        letterSpacing: 1,
    },

})