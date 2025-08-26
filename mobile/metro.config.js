const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve and watch files in the repo root (monorepo setup)
config.watchFolders = [path.resolve(__dirname, '..')];

module.exports = config;
