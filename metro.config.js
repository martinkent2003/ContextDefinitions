const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// allow bundling WebAssembly assets (needed for expo-sqlite on web)
config.resolver.assetExts.push("wasm");

module.exports = config;