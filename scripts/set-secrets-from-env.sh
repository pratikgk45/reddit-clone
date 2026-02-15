#!/bin/bash
set -e

echo "🔐 GitHub Secrets Quick Setup"
echo "=============================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install: brew install gh"
    echo ""
    echo "Or set secrets manually at:"
    echo "https://github.com/YOUR_USERNAME/reddit-clone/settings/secrets/actions"
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged in to GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Read from .env.local
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    exit 1
fi

echo "📖 Reading from .env.local..."
echo ""

# Extract values
APPSYNC_URL=$(grep NEXT_PUBLIC_APPSYNC_URL .env.local | cut -d '=' -f2)
APPSYNC_KEY=$(grep NEXT_PUBLIC_APPSYNC_API_KEY .env.local | cut -d '=' -f2)
NEXTAUTH_SECRET=$(grep NEXTAUTH_SECRET .env.local | cut -d '=' -f2)
NEXTAUTH_URL=$(grep NEXTAUTH_URL .env.local | cut -d '=' -f2)
REDDIT_CLIENT_ID=$(grep REDDIT_CLIENT_ID .env.local | cut -d '=' -f2)
REDDIT_CLIENT_SECRET=$(grep REDDIT_CLIENT_SECRET .env.local | cut -d '=' -f2)
GOOGLE_CLIENT_ID=$(grep GOOGLE_CLIENT_ID .env.local | cut -d '=' -f2)
GOOGLE_CLIENT_SECRET=$(grep GOOGLE_CLIENT_SECRET .env.local | cut -d '=' -f2)

echo "Found values:"
echo "  NEXT_PUBLIC_APPSYNC_URL: ${APPSYNC_URL:0:50}..."
echo "  NEXT_PUBLIC_APPSYNC_API_KEY: ${APPSYNC_KEY:0:20}..."
echo "  NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:0:10}..."
echo "  NEXTAUTH_URL: $NEXTAUTH_URL"
echo ""

read -p "Set these secrets in GitHub? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "Setting secrets..."

# Set secrets
echo "$APPSYNC_URL" | gh secret set NEXT_PUBLIC_APPSYNC_URL
echo "✅ NEXT_PUBLIC_APPSYNC_URL"

echo "$APPSYNC_KEY" | gh secret set NEXT_PUBLIC_APPSYNC_API_KEY
echo "✅ NEXT_PUBLIC_APPSYNC_API_KEY"

echo "$NEXTAUTH_SECRET" | gh secret set NEXTAUTH_SECRET
echo "✅ NEXTAUTH_SECRET"

echo "$NEXTAUTH_URL" | gh secret set NEXTAUTH_URL
echo "✅ NEXTAUTH_URL"

if [ -n "$REDDIT_CLIENT_ID" ]; then
    echo "$REDDIT_CLIENT_ID" | gh secret set REDDIT_CLIENT_ID
    echo "✅ REDDIT_CLIENT_ID"
fi

if [ -n "$REDDIT_CLIENT_SECRET" ]; then
    echo "$REDDIT_CLIENT_SECRET" | gh secret set REDDIT_CLIENT_SECRET
    echo "✅ REDDIT_CLIENT_SECRET"
fi

if [ -n "$GOOGLE_CLIENT_ID" ]; then
    echo "$GOOGLE_CLIENT_ID" | gh secret set GOOGLE_CLIENT_ID
    echo "✅ GOOGLE_CLIENT_ID"
fi

if [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    echo "$GOOGLE_CLIENT_SECRET" | gh secret set GOOGLE_CLIENT_SECRET
    echo "✅ GOOGLE_CLIENT_SECRET"
fi

echo ""
echo "🎉 Secrets set successfully!"
echo ""
echo "⚠️  Still needed for deployment:"
echo "  • AWS_DEPLOY_ROLE_ARN (run ./scripts/create-iam-role.sh)"
echo "  • AWS_ACCOUNT_ID (your AWS account ID)"
echo ""
echo "View secrets: gh secret list"
