import { Modal, Pressable, View } from 'react-native';
import { useEffect, useRef, ReactNode } from 'react';

export const ShowMessages = ({
    isOpen,
    onClose,
    children,
    width,
}:{
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode,
    width?: number
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
            <View
                style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 20,
                maxHeight: 500,
                width: width || '90%',
                }}
            >
                {children}
            </View>
            </View>
        </View>
        </Modal>
    );
};