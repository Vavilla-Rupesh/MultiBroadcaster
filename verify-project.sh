#!/bin/bash

echo "=== MultiBroadcaster Project Verification ==="
echo ""

echo "✅ Checking project structure..."
if [ -f "package.json" ] && [ -f "App.tsx" ] && [ -d "src" ]; then
    echo "   Project structure: OK"
else
    echo "   Project structure: MISSING FILES"
fi

echo ""
echo "✅ Checking source files..."
if [ -f "src/screens/LoginScreen.tsx" ] && [ -f "src/screens/DashboardScreen.tsx" ] && [ -f "src/services/AuthService.ts" ]; then
    echo "   Core files: OK"
else
    echo "   Core files: MISSING"
fi

echo ""
echo "✅ Checking TypeScript compilation..."
npx tsc --noEmit --skipLibCheck 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   TypeScript: OK"
else
    echo "   TypeScript: ERRORS"
fi

echo ""
echo "✅ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   Dependencies: INSTALLED"
else
    echo "   Dependencies: NOT INSTALLED"
fi

echo ""
echo "=== Project Summary ==="
echo "📱 React Native + Expo mobile application"
echo "🔐 Dual authentication (hardcoded + YouTube OAuth)"
echo "📺 YouTube Live Streaming integration"
echo "👥 Multi-user session management"
echo "⚙️  Configuration-based credential system"
echo ""

echo "🚀 Ready for development!"
echo "   Run 'npm start' to begin development"
echo "   Use Expo Go app to test on mobile device"