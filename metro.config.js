const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite charge un moteur SQLite compilé en WebAssembly pour le web
// (wa-sqlite) — sans ça, Metro ne sait pas résoudre les imports `*.wasm`.
config.resolver.assetExts.push('wasm');

module.exports = config;
