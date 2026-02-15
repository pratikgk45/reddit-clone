#!/bin/bash

# Setup script for App Runner GitHub connection
# This must be run once before deploying the App Runner stack

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     App Runner GitHub Connection Setup                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

REGION="${AWS_REGION:-us-east-1}"
CONNECTION_NAME="reddit-clone-github"

echo "Creating GitHub connection..."
CONNECTION_ARN=$(aws apprunner create-connection \
  --connection-name "$CONNECTION_NAME" \
  --provider-type GITHUB \
  --region "$REGION" \
  --query 'Connection.ConnectionArn' \
  --output text 2>/dev/null || echo "")

if [ -z "$CONNECTION_ARN" ]; then
  echo "Connection may already exist. Checking..."
  CONNECTION_ARN=$(aws apprunner list-connections \
    --region "$REGION" \
    --query "ConnectionSummaryList[?ConnectionName=='$CONNECTION_NAME'].ConnectionArn | [0]" \
    --output text)
fi

echo "✅ Connection ARN: $CONNECTION_ARN"
echo ""
echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "1. Open AWS Console:"
echo "   https://console.aws.amazon.com/apprunner/home?region=$REGION#/connections"
echo ""
echo "2. Find connection: $CONNECTION_NAME"
echo ""
echo "3. Click 'Complete handshake' and authorize GitHub"
echo ""
echo "4. After authorization, set the GitHub secret:"
echo "   echo \"$CONNECTION_ARN\" | gh secret set APPRUNNER_CONNECTION_ARN"
echo ""
echo "5. Deploy with CDK:"
echo "   cd infrastructure"
echo "   cdk deploy RedditAppRunnerStack --parameters GitHubConnectionArn=$CONNECTION_ARN"
echo ""

# Open browser
if command -v open &> /dev/null; then
  open "https://console.aws.amazon.com/apprunner/home?region=$REGION#/connections"
fi
