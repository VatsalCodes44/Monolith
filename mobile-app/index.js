// index.js (ROOT LEVEL)

import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import process from 'process';

// Polyfill globals BEFORE anything else
global.Buffer = global.Buffer || Buffer;
global.process = global.process || process;

if (!global.crypto) {
    global.crypto = {
        getRandomValues: require('react-native-get-random-values'),
    };
}

// Load Expo Router AFTER polyfills
import 'expo-router/entry';