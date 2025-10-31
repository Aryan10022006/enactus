#!/bin/bash

# Enactus Bidding App - Production Deployment Script
# Run this script to deploy to Firebase Hosting

echo "🚀 Enactus Bidding App - Deployment"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Build the app
echo "🔨 Building production bundle..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build completed successfully"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI ready"
echo ""

# Check if logged in to Firebase
echo "🔐 Checking Firebase authentication..."
firebase login:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "🔐 Please log in to Firebase..."
    firebase login
fi

echo "✅ Firebase authentication verified"
echo ""

# Deploy to Firebase
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""
echo "📱 Your app is now live!"
echo "🌐 Check your Firebase Console for the URL"
echo ""
echo "Next steps:"
echo "1. Visit your app URL"
echo "2. Test admin login at /#/admin"
echo "3. Share URLs with your team"
echo ""
echo "Happy bidding! 🎉"
