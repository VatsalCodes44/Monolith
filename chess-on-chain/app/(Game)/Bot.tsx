import { View, useWindowDimensions } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { GAME_STATE, Message } from '@/src/config/game'
import { BotBase } from '@/src/components/BotBase'
import { BotReplies } from '@/src/utils/BotReplies'

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
    const scrollRef = useRef<any>(null)

    // =========================
    // 🔥 CLOCK ENGINE
    // =========================
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

    // =========================
    // BOT AUTO REPLY (CHAT)
    // =========================
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
                showMessages={showMessages}
                setShowMessages={setShowMessages}
                scrollRef={scrollRef}
                fontsLoaded={true}
                gameStarted={true}
                lastMessage={lastMessage}
                player1Pubkey={"YOU"}
                spectator={false}
                gameState={gameState}
                setGameState={setGameState}
                messages={messages}
                setMessages={setMessages}
                playIllegalMoveSound={async () => {}}
                playCheckSound={async () => {}}
                playLowOnTimeSound={async () => {}}
                setLastMessage={setLastMessage}
            />
        </View>
    )
}