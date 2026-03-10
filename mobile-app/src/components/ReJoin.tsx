import { Modal, Pressable, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useRef, ReactNode } from 'react';

export const ReJoin = ({
    isDisconnected,
    width,
}: {
    isDisconnected: boolean,
    width?: number,
}) => {
    const blockCloseRef = useRef(false);

    useEffect(() => {
        if (isDisconnected) {
            blockCloseRef.current = true;
            const timer = setTimeout(() => {
                blockCloseRef.current = false;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isDisconnected]);

    return (
        <Modal
            visible={isDisconnected}
            transparent
            animationType="fade"
            onRequestClose={() => { }}
        >
            <View style={{ flex: 1 }}>

                {/* BACKDROP */}
                <Pressable
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    }}
                />

                {/* CONTENT */}
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    pointerEvents="box-none"
                >
                    <View
                        style={{
                            backgroundColor: '#1a1a1a',
                            borderRadius: 12,
                            padding: 20,
                            maxHeight: 200,
                            width: width || '90%',
                        }}
                    >
                        <ActivityIndicator color={"#CE2EDF"} size={64} />
                        <Text style={{
                            color: "#ffffffff",
                            fontFamily: "Orbitron_900Black",
                            textAlign: "center",
                            fontSize: 22
                        }}>
                            Disconnected from server
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};