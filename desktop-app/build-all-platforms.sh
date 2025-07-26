#!/bin/bash
set -e

echo "🚀 Building Francis Desktop for all platforms..."

# Variables
VERSION=$(node -p "require('./package.json').version")
echo "📦 Version: $VERSION"

# Nettoyage
echo "🧹 Cleaning previous builds..."
rm -rf dist/ out/ build/

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build renderer
echo "⚛️ Building React renderer..."
npm run build:renderer

# Detect OS and build accordingly
OS=$(uname -s)
case "$OS" in
  Darwin)
    echo "🍎 Building on macOS - can build all platforms"
    
    # macOS builds
    echo "🍎 Building macOS versions..."
    npm run build:mac
    
    # Windows build (if wine available)
    if command -v wine &> /dev/null; then
      echo "🪟 Building Windows version (via Wine)..."
      npm run build:win
    else
      echo "⚠️ Wine not found - skipping Windows build"
    fi
    
    # Linux build
    echo "🐧 Building Linux version..."
    npm run build:linux
    ;;
    
  Linux)
    echo "🐧 Building on Linux"
    npm run build:linux
    
    # Try Windows build if wine available
    if command -v wine &> /dev/null; then
      echo "🪟 Building Windows version (via Wine)..."
      npm run build:win
    fi
    ;;
    
  MINGW* | CYGWIN* | MSYS*)
    echo "🪟 Building on Windows"
    npm run build:win
    ;;
    
  *)
    echo "❓ Unknown OS: $OS - building for current platform only"
    npm run build
    ;;
esac

# List generated files
echo "📋 Generated files:"
find dist -type f -name "*.exe" -o -name "*.dmg" -o -name "*.pkg" -o -name "*.zip" -o -name "*.AppImage" | sort

echo "✅ Build complete! Files are in the dist/ directory."
echo "🌍 Upload these files to your server's /downloads/ directory for distribution."
