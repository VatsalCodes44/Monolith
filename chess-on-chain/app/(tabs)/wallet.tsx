import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback } from 'react'
import { TopContainer } from '@/src/components/TopContainer'
import { HeroSection } from '@/src/components/HeroSection'
import { useWallet } from '@/src/hooks/useWallet'
throw new Error("THIS FILE IS RUNNING");
const 
games= [
    {
    id: "match-001",
    lamports: 10000000,
    status: "LIVE",
    fen: "start",
    history: [],
    winner: null,
    player1PublicKey: "Alpha",
    player2PublicKey: "Beta",
    timer1: 120,
    timer2: 93,
    customGame: false,
    skr: 0,
    },
    {
    id: "match-002",
    lamports: 0,
    status: "FINISHED",
    fen: "start",
    history: [],
    winner: "w",
    player1PublicKey: "CustomA",
    player2PublicKey: "CustomB",
    timer1: 0,
    timer2: 0,
    customGame: true,
    skr: 75000000,
    },
    {
    id: "match-003",
    lamports: 50000000,
    status: "LIVE",
    fen: "start",
    history: [],
    winner: null,
    player1PublicKey: "Knight",
    player2PublicKey: "Rook",
    timer1: 300,
    timer2: 287,
    customGame: false,
    skr: 0,
    },
]

export default function Wallet() {

    const wallet = useWallet()

    return (
    <TopContainer>
        <HeroSection
            publicKey={wallet.publicKey}
            isDevnet={wallet.isDevnet}
            fontsLoaded={true}
            title='CHESS on CHAIN'
            tagline='Instant Deposit. Instant Withdraw.'
            showSol={true}
            fetchbalance={async () => {
                
            }}
            onPress={async () => {
            }}
            lamports={1000}
            skr={1000}
        />
    </TopContainer>
    )
}

const styles = StyleSheet.create({})