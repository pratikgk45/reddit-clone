#!/bin/bash

# Setup script for Reddit Clone project
# This script helps set up the development environment

set -e

echo "🚀 Setting up Reddit Clone project..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20 or higher is required. Current version: $(node -v)"
  exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install infrastructure dependencies
echo "📦 Installing infrastructure dependencies..."
cd infrastructure
npm install
cd ..

# Setup environment file
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your configuration"
else
  echo "✅ .env.local already exists"
fi

# Setup Husky
echo "🐕 Setting up Husky..."
npm run prepare

# Generate NextAuth secret if not set
if ! grep -q "NEXTAUTH_SECRET" .env.local || grep -q "NEXTAUTH_SECRET=$" .env.local; then
  echo "🔐 Generating NEXTAUTH_SECRET..."
  SECRET=$(openssl rand -base64 32)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$SECRET|" .env.local
  else
    # Linux
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$SECRET|" .env.local
  fi
  echo "✅ NEXTAUTH_SECRET generated"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Deploy infrastructure: cd infrastructure && cdk deploy"
echo "3. Update .env.local with AppSync URL and API key from CDK outputs"
echo "4. Run development server: npm run dev"
echo ""

