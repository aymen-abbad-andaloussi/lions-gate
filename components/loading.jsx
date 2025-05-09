import { StyleSheet, View, SafeAreaView, Animated, Easing } from 'react-native';

import { AntDesign } from '@expo/vector-icons';
import { useEffect } from 'react';

const LoadingScreen = () => {
    const spinValue = new Animated.Value(0);

    const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start(() => spin());
    };
    useEffect(() => {
        spin();
    }, []);

    const rotate = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    return (
            <Animated.View style={{ transform: [{ rotate }] }}>
                <AntDesign name={'loading2'} color={'#fcc801'} size={50} />
            </Animated.View>
    );
}

export default LoadingScreen;