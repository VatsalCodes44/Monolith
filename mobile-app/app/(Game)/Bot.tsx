import { View, useWindowDimensions } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Chess } from 'chess.js'
import { GAME_STATE, Message } from '@/src/config/game'
import { BotBase } from '@/src/components/BotBase'
import { BotReplies } from '@/src/utils/BotReplies'
import { Audio } from 'expo-av'

export default function Bot() {
    const { width } = useWindowDimensions()

    const botReplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isMountedRef = useRef(true)

    // 🔥 GLOBAL CLOCK ENGINE
    const lastTickRef = useRef<number>(Date.now())

    const [gameState, setGameState] = useState<GAME_STATE>({
        chess: new Chess(),
        color: "w",
        from: null,
        prevFrom: null,
        prevTo: null,
        moves: [],
        timer1: 600000,
        timer2: 600000,
        opponentPubkey: "BOT",
        gameover: {
            winner: null,
            gameOverType: null,
            isGameOver: false
        }
    })

    const [messages, setMessages] = useState<Message[]>([])
    const [lastMessage, setLastMessage] = useState<Message | undefined>()
    const [showMessages, setShowMessages] = useState(false)
    const [showGameOver, setShowGameOver] = useState(false);
    const scrollRef = useRef<any>(null)
    const moveSoundRef = useRef<Audio.Sound | null>(null);
    const checkSoundRef = useRef<Audio.Sound | null>(null);
    const illegalSoundRef = useRef<Audio.Sound | null>(null);
    const lowOnTimeSoundRef = useRef<Audio.Sound | null>(null);

    const playMoveSound = useCallback(async () => {
        if (!moveSoundRef.current) {
            await new Promise(r => setTimeout(r, 600));
            if(!moveSoundRef.current) return;
        };

        try {
            await moveSoundRef.current.stopAsync();
            await moveSoundRef.current.setPositionAsync(0);
            await moveSoundRef.current.playAsync();
        } catch (err) {
            console.log("Move sound error:", err);
        }
    }, []);

    const playCheckSound = useCallback(async () => {
        if (!checkSoundRef.current) {
            await new Promise(r => setTimeout(r, 600));
            if (!checkSoundRef.current) return;
        };

        try {
            await checkSoundRef.current.stopAsync();
            await checkSoundRef.current.setPositionAsync(0);
            await checkSoundRef.current.playAsync();
        } catch (err) {
            console.log("Check sound error:", err);
        }
    }, []);

    const playIllegalMoveSound = useCallback(async () => {
        if (!illegalSoundRef.current) {
            await new Promise(r => setTimeout(r, 600));
            if (!illegalSoundRef.current) return;
        };

        try {
            await illegalSoundRef.current.stopAsync();
            await illegalSoundRef.current.setPositionAsync(0);
            await illegalSoundRef.current.playAsync();
        } catch (err) {
            console.log("Check sound error:", err);
        }
    }, []);

    const playLowOnTimeSound = useCallback(async () => {
        if (!lowOnTimeSoundRef.current) {
            await new Promise(r => setTimeout(r, 600));
            if (!lowOnTimeSoundRef.current) return;
        };

        try {
            await lowOnTimeSoundRef.current.stopAsync();
            await lowOnTimeSoundRef.current.setPositionAsync(0);
            await lowOnTimeSoundRef.current.playAsync();
        } catch (err) {
            console.log("Check sound error:", err);
        }
    }, []);


    useEffect(() => {
        const loadSounds = async () => {
            await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            playThroughEarpieceAndroid: false,
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

    useEffect(() => {
        const interval = setInterval(() => {
            setGameState(prev => {
                if (prev.gameover.isGameOver) return prev

                const now = Date.now()
                const elapsed = now - lastTickRef.current
                lastTickRef.current = now

                if (prev.chess.turn() === "w") {
                    const newTime = prev.timer1 - elapsed
                    if (newTime <= 0) {
                        return {
                            ...prev,
                            timer1: 0,
                            gameover: {
                                isGameOver: true,
                                winner: "b",
                                gameOverType: "time_out"
                            }
                        }
                    }
                    return { ...prev, timer1: newTime }
                } else {
                    const newTime = prev.timer2 - elapsed
                    if (newTime <= 0) {
                        return {
                            ...prev,
                            timer2: 0,
                            gameover: {
                                isGameOver: true,
                                winner: "w",
                                gameOverType: "time_out"
                            }
                        }
                    }
                    return { ...prev, timer2: newTime }
                }
            })
        }, 250) // 250ms is smooth and efficient

        return () => clearInterval(interval)
    }, [])



    // BOT AUTO REPLY (CHAT)
    useEffect(() => {
        if (!lastMessage) return
        const botColor: "w" | "b" = gameState.color === "w" ? "b" : "w"

        if (lastMessage.from !== botColor) {
            botReplyTimeoutRef.current = setTimeout(() => {
                if (!isMountedRef.current) return
                const reply = BotReplies[Math.floor(Math.random() * BotReplies.length)]
                const botMsg: Message = { from: botColor, message: reply }
                setMessages(p => [...p, botMsg])
                setLastMessage(botMsg)
            }, 800)
        }

        return () => {
            if (botReplyTimeoutRef.current)
                clearTimeout(botReplyTimeoutRef.current)
        }
    }, [lastMessage])

    useEffect(() => {
        return () => { isMountedRef.current = false }
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <BotBase
                width={width}
                showGameOver={showGameOver}
                setShowGameOver={setShowGameOver}
                showMessages={showMessages}
                setShowMessages={setShowMessages}
                scrollRef={scrollRef}
                gameStarted={true}
                lastMessage={lastMessage}
                player1Pubkey={"YOU"}
                spectator={false}
                gameState={gameState}
                setGameState={setGameState}
                messages={messages}
                setMessages={setMessages}
                playIllegalMoveSound={playIllegalMoveSound}
                playCheckSound={playCheckSound}
                playMoveSound={playMoveSound}
                playLowOnTimeSound={playLowOnTimeSound}
                setLastMessage={setLastMessage}
            />
        </View>
    )
}