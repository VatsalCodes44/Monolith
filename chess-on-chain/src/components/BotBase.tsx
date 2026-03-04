import { StyleSheet, View, Text, ScrollView, ImageBackground } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Timer } from '@/src/components/Timer'
import { LastMessage } from '@/src/components/LastMessage'
import { MoveHistory } from '@/src/components/MoveHistory'
import { Captured } from '@/src/components/Captured'
import { ShowMessages } from '@/src/components/ShowMessages'
import { SolanaDuelHeader } from '@/src/components/SolanaDuelHeader'
import { GAME_STATE, Message } from '@/src/config/game'
import { BotSendMessage } from './BotSendMessage'
import { BotBoard } from './BotBoard'
import { BotTimer } from './BotTimer'
import { GameOverModal } from './GameOverModal'

export function BotBase({
    width,
    showMessages,
    setShowMessages,
    scrollRef,
    gameStarted,
    lastMessage,
    player1Pubkey,
    spectator,
    gameState,
    setGameState,
    messages,
    setMessages,
    playIllegalMoveSound,
    playCheckSound,
    playLowOnTimeSound,
    playMoveSound,
    setLastMessage,
    showGameOver,
    setShowGameOver
}: {
    width: number,
    showMessages: boolean,
    setShowMessages: React.Dispatch<React.SetStateAction<boolean>>,
    scrollRef: React.RefObject<ScrollView | null>,
    gameStarted: boolean,
    lastMessage: Message | undefined,
    player1Pubkey: string | null,
    spectator: boolean,
    gameState: GAME_STATE,
    setGameState: React.Dispatch<React.SetStateAction<GAME_STATE>>,
    messages: Message[],
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    playIllegalMoveSound: () => Promise<void>,
    playCheckSound: () => Promise<void>,
    playLowOnTimeSound: () => Promise<void>,
    playMoveSound: () => Promise<void>,
    setLastMessage: React.Dispatch<React.SetStateAction<Message | undefined>>,
    setShowGameOver: React.Dispatch<React.SetStateAction<boolean>>,
    showGameOver: boolean
}) {
    return (
        <ImageBackground
            source={require("../../assets/image/chessBg.jpg")}
            resizeMode="cover"
            style={{ flex: 1, backgroundColor: "#191919" }}
            imageStyle={{ opacity: 5 }}
        >
            <SafeAreaView style={{ flex: 1, paddingVertical: 0 }}>

                <ShowMessages
                    width={width * 0.95}
                    isOpen={showMessages}
                    onClose={() => setShowMessages(false)}
                >
                    {messages.length > 0 ?
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
                            <BotSendMessage
                                setLastMessage={setLastMessage}
                                setMessages={setMessages}
                                color={gameState.color}
                                setShowMessages={setShowMessages}
                                showMenuIcon={false}
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
                    player2Pubkey={"BOT"}
                    turnColor={gameState.chess.turn()}
                    myColor={gameState.color}
                    stake={`BOT MATCH`}
                />

                <View style={{ paddingHorizontal: 4 }}>
                    <BotTimer
                    timer1={gameState.timer1}
                    timer2={gameState.timer2}
                    color={gameState.color}
                    playLowOnTimeSound={playLowOnTimeSound}
                    />
                </View>

                <View style={{ height: 60, marginVertical: 4, width: "100%" }}>
                    <Captured moves={gameState.moves} color={gameState.color} />
                </View>

                <View style={{ justifyContent: "center", alignItems: "center" }}>
                    <View style={{ height: 60, marginVertical: 4, width: "100%" }}>
                        <MoveHistory gameState={gameState} />
                    </View>
                    <BotBoard
                        spectator={spectator}
                        gameStarted={gameStarted}
                        gameState={gameState}
                        setGameState={setGameState}
                        playIllegalMoveSound={playIllegalMoveSound}
                        playCheckSound={playCheckSound}
                        playMoveSound={playMoveSound}
                        setShowGameOver={setShowGameOver}
                        showGameOver={showGameOver}
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
                    <BotSendMessage
                        setLastMessage={setLastMessage}
                        setMessages={setMessages}
                        color={gameState.color}
                        setShowMessages={setShowMessages}
                        showMenuIcon={true}
                        spectator={spectator}
                    />
                </View>

            </SafeAreaView>
        </ImageBackground>
    )
}