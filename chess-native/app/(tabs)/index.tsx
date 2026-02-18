import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFonts, Orbitron_900Black } from '@expo-google-fonts/orbitron'
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GameBet } from '@/src/store/store';

export default function index() {
  const [fontsLoaded] = useFonts({
    Orbitron_900Black,
  });
  const {sol, setSol} = GameBet(s=> s)
  const [initializing, setInitializing] = useState(false)
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (loaded) {
    }
  }, [loaded])

  useEffect(()=>{
    setInitializing(false)
  }, [])

  if (!loaded) {
    return null
  }

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.titleWrap}>
          <Text style={{...styles.title, fontFamily: fontsLoaded ? "Orbitron_900Black": "Roboto"}}>
              SeekMate
          </Text>
          <LinearGradient
            colors={['#B048C2', '#9082DB', '#3DE3B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.underline}
          />
        </View>

        <View style={styles.imageView}>
          <Image style={styles.chessBoard} source={require("@/assets/image/chessboard-unblured.png")} />
        </View>

        <View style={{justifyContent: "center", flexDirection:"row"}}>
          <View style={styles.sol}>
            <FlatList
              data={[1, 0.5, 0.1]}
              horizontal
              scrollEnabled={false}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => {
                const isSelected = sol === item;

                if (isSelected) {
                  return (
                    <LinearGradient
                      colors={['#B048C2', '#9082DB', '#3DE3B4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientBorder}
                    >
                      <Pressable
                        style={styles.innerButton}
                        onPress={() => setSol(item)}
                      >
                        <Text
                          style={{
                            ...styles.solText,
                            fontFamily: fontsLoaded
                              ? "Orbitron_900Black"
                              : "Roboto",
                          }}
                        >
                          {item} SOL
                        </Text>
                      </Pressable>
                    </LinearGradient>
                  );
                }

                return (
                  <Pressable
                    style={styles.innerButton}
                    onPress={() => setSol(item)}
                  >
                    <Text
                      style={{
                        ...styles.solText,
                        fontFamily: fontsLoaded
                          ? "Orbitron_900Black"
                          : "Roboto",
                      }}
                    >
                      {item} SOL
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
        
        <TouchableOpacity disabled={initializing} style={{
          ...styles.startMatch,
          opacity: initializing ? 0.5 : 1
        }} onPress={() => {
          setInitializing(true)
          router.push("/Game");
          setInitializing(false)
        }}>
          <LinearGradient
            colors={['#B048C2', '#9082DB', '#3DE3B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {!initializing && <Text style={{...styles.text, fontFamily: fontsLoaded ? "Orbitron_900Black": "Roboto"}}>Start Match</Text>}
            {initializing && <ActivityIndicator color={"#ffffff"} size={32}/>}
          </LinearGradient>
        </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191919"
  },
  
  titleWrap: {
    alignItems: "center",
    marginVertical: 60,
  },
  
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    textAlign: "center",
    letterSpacing: 2
    
  },
  
  underline: {
    marginTop: 10,  
    height: 8,      
    width: 240,     
    borderRadius: 3,
  },

  imageView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  chessBoard: {
    width: 460,
    height: 460,
  },

  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginHorizontal: 50,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: ""
  },

  text: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 1,
  },

  sol: {
    justifyContent: "space-evenly",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 30,
  },

  gradientBorder: {
    padding: 2,
    borderRadius: 50,
    marginHorizontal: 6,
  },

  innerButton: {
    backgroundColor: "#191919",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  solText: {
    color: "#FFFFFF",
    fontSize: 16,
    letterSpacing: 1,
  },

  startMatch: {
    marginBottom: 60
  }
})