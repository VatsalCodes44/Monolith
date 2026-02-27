// metro.config.js

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    buffer: require.resolve('buffer'),
    process: require.resolve('process'),
};

module.exports = config;