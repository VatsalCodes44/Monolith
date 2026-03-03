import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SolanaDuelHeader } from './SolanaDuelHeader'
import { Timer } from './Timer'
import { Captured } from './Captured'
import { MoveHistory } from './MoveHistory'
import { StaticChessBoard } from './StaticChessboard'
import { Chess, Move } from 'chess.js'
import { StaticTimer } from './StaticTimer'

export function FinalPosition({
    chess,
    player1Pubkey,
    player2Pubkey,
    color,
    fontsLoaded,
    sol,
    timer1,
    timer2,
    moves,
    custom,
    skr,
}: {
    chess: Chess
    player1Pubkey: string,
    player2Pubkey: string,
    color: "w" | "b",
    fontsLoaded: boolean,
    sol: string,
    timer1: number,
    timer2: number,
    moves: Move[],
    skr: string,
    custom: boolean
}) {
  return (
    <ImageBackground
    source={require("../../assets/image/chessBg.jpg")}
    resizeMode="cover"
    style={{
        flex: 1,
        backgroundColor: "#191919"
    }}
    imageStyle={{opacity: 1}}
    >
        <SafeAreaView style={{
            flex: 1,
            paddingVertical: 0,
        }}>

            <SolanaDuelHeader
                player1Pubkey={player1Pubkey}
                player2Pubkey={player2Pubkey}
                turnColor={chess.turn()}
                myColor={color}
                stake={custom ? `${sol} sol` : `${skr} skr`}
                fontsLoaded={fontsLoaded}
            />

            <View style={{ paddingHorizontal: 4 }}>
                <StaticTimer
                    timer1={timer1}
                    timer2={timer2}
                    fontsLoaded={fontsLoaded}
                    turn={chess.turn()}
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

                <StaticChessBoard
                    chess={chess}
                    color={color}

                />
            </View>
        </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({})