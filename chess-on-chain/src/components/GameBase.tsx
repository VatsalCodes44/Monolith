import { StyleSheet, View, Text, useWindowDimensions, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef } from 'react'
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
import { Audio } from 'expo-av'
export interface GameOver {
    winner: "b" | "w" | null,
    gameOverType: "checkmate" | "stalemate" | "draw" | "time_out" | null,
    isGameOver: boolean
}

export interface Message {
    from: "w" | "b",
    message: string,
}

function GameBaseComponent({
    width,
    showMessages,
    setShowMessages,
    messages,
    scrollRef,
    color,
    socket,
    setMessages,
    jwt,
    gameIdRef,
    isDevnet,
    sol,
    chess,
    fontsLoaded,
    timer1,
    timer2,
    gameStarted,
    gameover,
    moves,
    from,
    prevFrom,
    setFrom,
    prevTo,
    lastMessage,
    player1Pubkey,
    player2Pubkey,
    gameType,
}: {
    width: number,
    showMessages: boolean,
    setShowMessages: (value: React.SetStateAction<boolean>) => void,
    messages: Message[],
    scrollRef: React.RefObject<ScrollView | null>,
    color: "b" | "w",
    socket: React.RefObject<WebSocket | null>,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    jwt: string,
    gameIdRef: React.RefObject<string | null>,
    isDevnet: boolean,
    sol: "0.01" | "0.05" | "0.1",
    chess: Chess,
    fontsLoaded: boolean,
    timer1: number,
    timer2: number,
    gameStarted: boolean,
    gameover: GameOver,
    moves: Move[],
    from: Square | null,
    prevFrom: Square | null,
    setFrom: React.Dispatch<React.SetStateAction<Square | null>>,
    prevTo: Square | null,
    lastMessage: Message | undefined,
    player1Pubkey: string | null,
    player2Pubkey: string | null,
    gameType: "NORMAL" | "CUSTOM",
    skr?: number
}) {

    const moveSoundRef = useRef<Audio.Sound | null>(null);
    const checkSoundRef = useRef<Audio.Sound | null>(null);
    const illegalSoundRef = useRef<Audio.Sound | null>(null);
    const lowOnTimeSoundRef = useRef<Audio.Sound | null>(null);

    const playMoveSound = async () => {
    if (!moveSoundRef.current) return;

    try {
        await moveSoundRef.current.stopAsync();
        await moveSoundRef.current.setPositionAsync(0);
        await moveSoundRef.current.playAsync();
    } catch (err) {
        console.log("Move sound error:", err);
    }
    };

    const playCheckSound = async () => {
    if (!checkSoundRef.current) return;

    try {
        await checkSoundRef.current.stopAsync();
        await checkSoundRef.current.setPositionAsync(0);
        await checkSoundRef.current.playAsync();
    } catch (err) {
        console.log("Check sound error:", err);
    }
    };

    const playIllegalMoveSound = async () => {
    if (!illegalSoundRef.current) return;

    try {
        await illegalSoundRef.current.stopAsync();
        await illegalSoundRef.current.setPositionAsync(0);
        await illegalSoundRef.current.playAsync();
    } catch (err) {
        console.log("Check sound error:", err);
    }
    };

    const playLowOnTimeSound = async () => {
    if (!lowOnTimeSoundRef.current) return;

    try {
        await lowOnTimeSoundRef.current.stopAsync();
        await lowOnTimeSoundRef.current.setPositionAsync(0);
        await lowOnTimeSoundRef.current.playAsync();
    } catch (err) {
        console.log("Check sound error:", err);
    }
    };

    useEffect(() => {
        const loadSounds = async () => {
            await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            playThroughEarpieceAndroid: true,
            });

            const moveSound = new Audio.Sound();
            const checkSound = new Audio.Sound();
            const illegalSound = new Audio.Sound();
            const lowOnTimeSound = new Audio.Sound();

            await moveSound.loadAsync(
            require('../../assets/audios/moveSound.mp3')
            );

            await checkSound.loadAsync(
            require('../../assets/audios/checkSound.mp3')
            );

            await illegalSound.loadAsync(
            require('../../assets/audios/illegalMoveSound.mp3')
            );

            await lowOnTimeSound.loadAsync(
            require('../../assets/audios/lowOnTime.mp3')
            );

            moveSoundRef.current = moveSound;
            checkSoundRef.current = checkSound;
            illegalSoundRef.current = illegalSound;
            lowOnTimeSoundRef.current = lowOnTimeSound;
        };

        loadSounds();

        return () => {
            // Do NOT unload on unmount
            // Let Expo AV handle destruction.
            // moveSoundRef.current?.unloadAsync();
            // checkSoundRef.current?.unloadAsync();
            // illegalSoundRef.current?.unloadAsync();
            // lowOnTimeSoundRef.current?.unloadAsync();
        };
        }, []);

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: "#000000",
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
                                            justifyContent: color == item.from ? "flex-end" : "flex-start",
                                            marginVertical: 8
                                        }}
                                    >
                                        <Text style={{
                                            color: "#ffffff",
                                            backgroundColor: color == item.from ? "#3DE3B4" : "#B048C2",
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
                                socket={socket.current!}
                                setMessages={setMessages}
                                color={color}
                                setShowMessages={setShowMessages}
                                showMenuIcon={false}
                                jwt={jwt}
                                gameId={gameIdRef.current}
                                isDevnet={isDevnet}
                                sol={sol}
                                gameType={gameType}
                            />
                        </View> :
                        <Text style={{ color: "#ffffff", fontSize: 25, textAlign: "center", opacity: .3 }}>
                            No messages
                        </Text>
                }
            </ShowMessages>

            <SolanaDuelHeader
                player1Pubkey={player1Pubkey}
                player2Pubkey={player2Pubkey}
                turnColor={chess.turn()}
                myColor={color}
                stake={`${sol} sol`}
                fontsLoaded={fontsLoaded}
            />

            <View style={{ paddingHorizontal: 4 }}>
                <Timer
                    fontsLoaded={fontsLoaded}
                    timer1={timer1}
                    timer2={timer2}
                    turn={chess.turn()}
                    gameStarted={gameStarted}
                    GameOver={gameover}
                    playLowOnTimeSound={playLowOnTimeSound}
                    color={color}
                />
            </View>
            <View style={{
                height: 60,
                marginVertical: 4,
                width: "100%",
            }}>
                <Captured moves={moves} color={color} />
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
                    <MoveHistory moves={moves} />
                </View>
                <ChessBoard
                    chess={chess}
                    from={from}
                    setFrom={setFrom}
                    socket={socket.current!}
                    color={color}
                    prevFrom={prevFrom}
                    prevTo={prevTo}
                    GameOver={gameover}
                    gameStarted={gameStarted}
                    playIllegalMoveSound={playIllegalMoveSound}
                    playCheckSound={playCheckSound}
                    gameId={gameIdRef.current}
                    network={isDevnet ? "DEVNET" : "MAINNET"}
                    sol={sol}
                    jwt={jwt}
                    gameType={gameType}
                    playMoveSound={playMoveSound}
                />
            </View>

            <View style={{
                marginHorizontal: 15,
                gap: 10,
                height: 60,
                justifyContent: "flex-end",
                flex: 1
            }}>
                {lastMessage && <LastMessage color={color} lastMessage={lastMessage} width={width} />}
                <SendMessage
                    setMessages={setMessages}
                    color={color}
                    setShowMessages={setShowMessages}
                    showMenuIcon={true}
                    gameId={gameIdRef.current}
                    jwt={jwt}
                    isDevnet={isDevnet}
                    sol={sol}
                    socket={socket.current!}
                    gameType={gameType}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({})

export const GameBase = React.memo(GameBaseComponent);