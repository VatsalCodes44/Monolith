import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

export function SegmentToggle<T extends string>({
    options,
    selected,
    onChange,
    fontsLoaded
}: {
    options: readonly T[],
    selected: T,
    onChange: (value: T) => void,
    fontsLoaded: boolean
}) {
    return (
        <View style={styles.segmentContainer}>
            {options.map(option => {
                const active = selected === option

                return (
                    <TouchableOpacity
                        key={option}
                        style={{ flex: 1 }}
                        activeOpacity={0.9}
                        onPress={() => onChange(option)}
                    >
                        {active ? (
                            <LinearGradient
                                colors={['#B048C2', '#9082DB', '#3DE3B4']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.segmentItem}
                            >
                                <Text style={[
                                    styles.segmentTextActive,
                                    {
                                        fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto"
                                    }
                                ]}>
                                    {option}
                                </Text>
                            </LinearGradient>
                        ) : (
                            <View style={styles.segmentItem}>
                                <Text style={[
                                    styles.segmentTextInactive,
                                    {
                                        fontFamily: fontsLoaded ? "Orbitron_900Black" : "Roboto"
                                    }
                                ]}>
                                    {option}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({

    segmentContainer: {
        flexDirection: "row",
        backgroundColor: "#1A1A1F",
        borderRadius: 16,
        marginBottom: 18,
    },

    segmentItem: {
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16
    },

    segmentTextActive: {
        color: "#FFFFFF",
        fontSize: 12,
        letterSpacing: 2,
    },

    segmentTextInactive: {
        color: "#6B7280",
        fontSize: 12,
        letterSpacing: 2,
    },

})