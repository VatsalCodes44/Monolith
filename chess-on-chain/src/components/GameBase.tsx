import { StyleSheet, View, Text, useWindowDimensions, ScrollView, TouchableOpacity, ImageBackground } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChessBoard } from "@/src/components/ChessBoard"
import { Chess, Move, Square } from 'chess.js'
import { Timer } from '@/src/components/Timer'
import { LastMessage } from '@/src/components/LastMessage'
import { SendMessage } from '@/src/components/SendMessage'
import { MoveHistory } from '@/src/components/MoveHistory'
import { Captured } from '@/src/components/Captured'
import { ShowMessages } from '@/src/components/ShowMessages'
import { SolanaDuelHeader } from '@/src/components/SolanaDuelHeader'
import { GAME_STATE, Message } from '../config/game'
import { GameOverModal } from './GameOverModal'

function GameBaseComponent({
    width,
    showMessages,
    setShowMessages,
    scrollRef,
    socket,
    jwt,
    gameIdRef,
    isDevnet,
    sol,
    gameStarted,
    lastMessage,
    player1Pubkey,
    gameType,
    spectator,
    gameState,
    setGameState,
    messages,
    setMessages,
    playIllegalMoveSound,
    playCheckSound,
    playLowOnTimeSound,
    setLastMessage,
    showGameOver,
    setShowGameOver
}: {
    width: number,
    showMessages: boolean,
    setShowMessages: (value: React.SetStateAction<boolean>) => void,
    scrollRef: React.RefObject<ScrollView | null>,
    socket: React.RefObject<WebSocket | null>,
    jwt: string,
    gameIdRef: React.RefObject<string | null>,
    isDevnet: boolean,
    sol: "0.01" | "0.05" | "0.1",
    gameStarted: boolean,
    lastMessage: Message | undefined,
    player1Pubkey: string | null,
    gameType: "NORMAL" | "CUSTOM",
    skr?: number,
    spectator: boolean,
    gameState: GAME_STATE,
    setGameState: React.Dispatch<React.SetStateAction<GAME_STATE>>,
    messages: Message[],
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    playIllegalMoveSound: () => Promise<void>,
    playCheckSound: () => Promise<void>,
    playLowOnTimeSound: () => Promise<void>,
    setLastMessage: React.Dispatch<React.SetStateAction<Message | undefined>>,
    setShowGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    showGameOver: boolean
}) {

    return (
        <ImageBackground
        source={require("../../assets/image/chessBg.jpg")}
        resizeMode="cover"
        style={{
            flex: 1,
            backgroundColor: "#191919"
        }}
        imageStyle={{opacity: 5}}
        >
            <SafeAreaView style={{
                flex: 1,
                paddingVertical: 0,
            }}>

                <ShowMessages
                    width={width * 0.95}
                    isOpen={showMessages}
                    onClose={() => {
                        setShowMessages(false);
                    }} >
                    {
                        messages.length > 0 ?
                            <View style={{ height: 450, gap: 15 }}>
                                <ScrollView
                                    ref={scrollRef}
                                    style={{ flex: 1 }}
                                    contentContainerStyle={{ paddingBottom: 10 }}
                                    nestedScrollEnabled
                                    showsVerticalScrollIndicator={false}
                                >
                                    {messages.map((item, index) => (
                                        <View
                                            key={index}
                                            style={{
                                                width: "100%",
                                                flexDirection: "row",
                                                justifyContent: gameState.color == item.from ? "flex-end" : "flex-start",
                                                marginVertical: 8
                                            }}
                                        >
                                            <Text style={{
                                                color: "#ffffff",
                                                backgroundColor: gameState.color == item.from ? "#3DE3B4" : "#B048C2",
                                                paddingVertical: 2,
                                                paddingHorizontal: 8,
                                                borderRadius: 8,
                                                fontSize: 18,
                                                maxWidth: "80%"
                                            }}>
                                                {item.message}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                                <SendMessage
                                    setLastMessage={setLastMessage}
                                    socket={socket.current!}
                                    setMessages={setMessages}
                                    color={gameState.color}
                                    setShowMessages={setShowMessages}
                                    showMenuIcon={false}
                                    jwt={jwt}
                                    gameId={gameIdRef.current}
                                    isDevnet={isDevnet}
                                    sol={sol}
                                    gameType={gameType}
                                    spectator={spectator}
                                />
                            </View> :
                            <Text style={{ color: "#ffffff", fontSize: 25, textAlign: "center", opacity: .3 }}>
                                No messages
                            </Text>
                    }
                </ShowMessages>

                <GameOverModal onClose={() => setShowGameOver(false)} isOpen={showGameOver} text={gameState.gameover.gameOverType?.toUpperCase() || "GAME OVER"} />

                <SolanaDuelHeader
                    player1Pubkey={player1Pubkey}
                    player2Pubkey={gameState.opponentPubkey}
                    turnColor={gameState.chess.turn()}
                    myColor={gameState.color}
                    stake={`${sol} sol`}
                />

                <View style={{ paddingHorizontal: 4 }}>
                    <Timer
                        timer1={gameState.timer1}
                        timer2={gameState.timer2}
                        turn={gameState.chess.turn()}
                        gameStarted={gameStarted}
                        GameOver={gameState.gameover}
                        playLowOnTimeSound={playLowOnTimeSound}
                        color={gameState.color}
                    />
                </View>
                <View style={{
                    height: 60,
                    marginVertical: 4,
                    width: "100%",
                }}>
                    <Captured moves={gameState.moves} color={gameState.color} />
                </View>

                <View style={{
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <View style={{
                        height: 60,
                        marginVertical: 4,
                        width: "100%",
                    }}>
                        <MoveHistory moves={gameState.moves} />
                    </View>
                    <ChessBoard
                        spectator={spectator}
                        socket={socket.current!}
                        gameStarted={gameStarted}
                        gameId={gameIdRef.current}
                        network={isDevnet ? "DEVNET" : "MAINNET"}
                        sol={sol}
                        jwt={jwt}
                        gameType={gameType}
                        gameState={gameState}
                        setGameState={setGameState}
                        playIllegalMoveSound={playIllegalMoveSound}
                        playCheckSound={playCheckSound}
                    />
                </View>

                <View style={{
                    marginHorizontal: 15,
                    gap: 10,
                    height: 60,
                    justifyContent: "flex-end",
                    flex: 1
                }}>
                    {lastMessage && <LastMessage color={gameState.color} lastMessage={lastMessage} width={width} />}
                    <SendMessage
                        setLastMessage={setLastMessage}
                        setMessages={setMessages}
                        color={gameState.color}
                        setShowMessages={setShowMessages}
                        showMenuIcon={true}
                        gameId={gameIdRef.current}
                        jwt={jwt}
                        isDevnet={isDevnet}
                        sol={sol}
                        socket={socket.current!}
                        gameType={gameType}
                        spectator={spectator}
                    />
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({})

export const GameBase = React.memo(GameBaseComponent);