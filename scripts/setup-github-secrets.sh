#!/bin/bash
set -e

echo "🔐 GitHub Secrets Setup Script"
echo "================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
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

# Function to set secret
set_secret() {
    local name=$1
    local value=$2
    local required=$3
    
    if [ -z "$value" ]; then
        if [ "$required" = "true" ]; then
            echo "⚠️  $name is required but not provided"
            read -p "Enter $name: " value
        else
            echo "⏭️  Skipping optional secret: $name"
            return
        fi
    fi
    
    if [ -n "$value" ]; then
        echo "$value" | gh secret set "$name"
        echo "✅ Set $name"
    fi
}

# AWS Secrets
echo "📦 AWS Configuration"
echo "-------------------"
read -p "AWS Account ID: " AWS_ACCOUNT_ID
read -p "AWS Deploy Role ARN: " AWS_DEPLOY_ROLE_ARN
read -p "AWS Region [us-east-1]: " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

set_secret "AWS_ACCOUNT_ID" "$AWS_ACCOUNT_ID" "true"
set_secret "AWS_DEPLOY_ROLE_ARN" "$AWS_DEPLOY_ROLE_ARN" "true"
set_secret "AWS_REGION" "$AWS_REGION" "false"

echo ""
echo "🔑 Application Secrets"
echo "---------------------"

# Generate NEXTAUTH_SECRET if not provided
read -p "NEXTAUTH_SECRET (leave empty to generate): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated: $NEXTAUTH_SECRET"
fi

read -p "NEXTAUTH_URL (production URL): " NEXTAUTH_URL

set_secret "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET" "true"
set_secret "NEXTAUTH_URL" "$NEXTAUTH_URL" "true"

echo ""
echo "🌐 AppSync Configuration (from CDK outputs)"
echo "------------------------------------------"
read -p "NEXT_PUBLIC_APPSYNC_URL (leave empty if not deployed yet): " APPSYNC_URL
read -p "NEXT_PUBLIC_APPSYNC_API_KEY (leave empty if not deployed yet): " APPSYNC_KEY

set_secret "NEXT_PUBLIC_APPSYNC_URL" "$APPSYNC_URL" "false"
set_secret "NEXT_PUBLIC_APPSYNC_API_KEY" "$APPSYNC_KEY" "false"

echo ""
echo "🔐 OAuth Providers (Optional)"
echo "----------------------------"
read -p "Configure Reddit OAuth? (y/N): " SETUP_REDDIT
if [[ "$SETUP_REDDIT" =~ ^[Yy]$ ]]; then
    read -p "REDDIT_CLIENT_ID: " REDDIT_CLIENT_ID
    read -p "REDDIT_CLIENT_SECRET: " REDDIT_CLIENT_SECRET
    set_secret "REDDIT_CLIENT_ID" "$REDDIT_CLIENT_ID" "false"
    set_secret "REDDIT_CLIENT_SECRET" "$REDDIT_CLIENT_SECRET" "false"
fi

read -p "Configure Google OAuth? (y/N): " SETUP_GOOGLE
if [[ "$SETUP_GOOGLE" =~ ^[Yy]$ ]]; then
    read -p "GOOGLE_CLIENT_ID: " GOOGLE_CLIENT_ID
    read -p "GOOGLE_CLIENT_SECRET: " GOOGLE_CLIENT_SECRET
    set_secret "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID" "false"
    set_secret "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET" "false"
fi

echo ""
echo "📦 Vercel Configuration (Optional)"
echo "---------------------------------"
read -p "Configure Vercel deployment? (y/N): " SETUP_VERCEL
if [[ "$SETUP_VERCEL" =~ ^[Yy]$ ]]; then
    read -p "VERCEL_TOKEN: " VERCEL_TOKEN
    read -p "VERCEL_ORG_ID: " VERCEL_ORG_ID
    read -p "VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID
    set_secret "VERCEL_TOKEN" "$VERCEL_TOKEN" "false"
    set_secret "VERCEL_ORG_ID" "$VERCEL_ORG_ID" "false"
    set_secret "VERCEL_PROJECT_ID" "$VERCEL_PROJECT_ID" "false"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Push to main branch to trigger deployment"
echo "2. Or manually trigger: gh workflow run deploy.yml"
echo "3. After infrastructure deploys, update AppSync secrets"
echo ""
echo "View secrets: gh secret list"
echo "View workflows: gh workflow list"
