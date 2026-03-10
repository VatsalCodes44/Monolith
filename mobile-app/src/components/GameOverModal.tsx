import { Modal, Pressable, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export const GameOverModal = ({
    isOpen,
    width,
    text,
    onClose
}: {
    isOpen: boolean,
    width?: number,
    text: string,
    onClose: () => void,
}) => {
    const blockCloseRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            blockCloseRef.current = true;
            const timer = setTimeout(() => {
                blockCloseRef.current = false;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        if (!blockCloseRef.current) {
            onClose();
        }
    };

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
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
                    onPress={handleClose}
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
                    {/* 🔥 Only this changed */}
                    <LinearGradient
                        colors={["#B048C2", "#9082DB", "#3DE3B4"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            borderRadius: 12,
                            padding: 20,
                            maxHeight: 500,
                            width: width || '90%',
                        }}
                    >
                        <Text style={{
                            fontFamily: "Orbitron_900Black",
                            fontSize: 28,
                            color: "#ffffff",
                            textAlign: "center"
                        }}>
                            {text}
                        </Text>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};