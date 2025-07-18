#!/bin/bash

echo "🔧 Installing test dependencies..."

cd /home/ubuntu/repos/devin-teams-app/teams-v2-sdk

echo "Installing Jest and TypeScript testing dependencies..."
npm install --save-dev jest@^29.7.0 @types/jest@^29.5.5 ts-jest@^29.1.1

echo "✅ Dependencies installed successfully!"
echo ""
echo "Available test commands:"
echo "- npm run test:cards          # Run main test suite"
echo "- npm run test:cards:basic    # Run basic card tests"
echo "- npm run test:cards:simple   # Run simple card tests"
echo "- npm run test:jest           # Run Jest unit tests"
echo ""
echo "To run tests: npm run test:cards"
