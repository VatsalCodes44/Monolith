import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import React, { useRef, useState } from 'react'

import { Redirect, useLocalSearchParams } from "expo-router";
import { gamesStore } from '@/src/stores/gamesStore';
import { GameOver, Message } from '../Game';
import { useWalletStore } from '@/src/stores/wallet-store';
import { FinalPosition } from '@/src/components/FinalPosition';
import { Chess, Move } from 'chess.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function SpectateGame() {
    const fontsLoaded = true;
    const { gameId } = useLocalSearchParams<{ gameId: string }>();
    const games = gamesStore(s => s.games)
    const game = games.find(g => g.id == gameId)
    const publicKey = useWalletStore(s => s.publicKey);
    const color = game && publicKey && game.player1PublicKey == publicKey ? "w" : "b";
    console.log(game)
    if (!game || !publicKey) {
        return <Redirect href={"/games"} />
    }

    return (
        <View style={{ flex: 1 }}>
            <FinalPosition 
                chess={new Chess(game.fen)}
                color={color}
                fontsLoaded={fontsLoaded}
                moves={game.history ? JSON.parse(game.history) as Move[] : []}
                player1Pubkey={publicKey}
                player2Pubkey={game.player1PublicKey == publicKey ? game.player2PublicKey : game.player1PublicKey}
                sol={(game.lamports/LAMPORTS_PER_SOL).toFixed(2).toString()}
                timer1={game.timer1}
                timer2={game.timer2}
                custom={game.customGame}
                skr={(game.skr/1_000_000).toFixed(2).toString()}
            />
        </View>
    )
}

const styles = StyleSheet.create({})