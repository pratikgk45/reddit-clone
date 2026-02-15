#!/bin/bash

# Deployment script for Reddit Clone
# Handles infrastructure and application deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=${1:-dev}

echo -e "${BLUE}🚀 Deploying Reddit Clone${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid options: dev, staging, production"
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_REGION:-us-east-1}

echo -e "${GREEN}✅ AWS Account: $ACCOUNT_ID${NC}"
echo -e "${GREEN}✅ Region: $REGION${NC}"
echo ""

# Deploy infrastructure
echo -e "${BLUE}📦 Deploying infrastructure...${NC}"
cd infrastructure

# Check if CDK is bootstrapped
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region "$REGION" &> /dev/null; then
    echo "Bootstrapping CDK..."
    cdk bootstrap aws://$ACCOUNT_ID/$REGION
fi

# Set environment variables
export ENVIRONMENT=$ENVIRONMENT
export CDK_DEFAULT_ACCOUNT=$ACCOUNT_ID
export CDK_DEFAULT_REGION=$REGION

# Show diff
echo ""
echo "Previewing changes..."
cdk diff || true

echo ""
read -p "Continue with deployment? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy
echo ""
echo "Deploying..."
npm run deploy:$ENVIRONMENT

# Get outputs
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Stack Outputs:"
echo "=============="

API_URL=$(aws cloudformation describe-stacks \
    --stack-name "RedditStack${ENVIRONMENT:+-$ENVIRONMENT}" \
    --query 'Stacks[0].Outputs[?OutputKey==`GraphQLAPIURL`].OutputValue' \
    --output text 2>/dev/null || echo "N/A")

API_KEY=$(aws cloudformation describe-stacks \
    --stack-name "RedditStack${ENVIRONMENT:+-$ENVIRONMENT}" \
    --query 'Stacks[0].Outputs[?OutputKey==`GraphQLAPIKey`].OutputValue' \
    --output text 2>/dev/null || echo "N/A")

TABLE_NAME=$(aws cloudformation describe-stacks \
    --stack-name "RedditStack${ENVIRONMENT:+-$ENVIRONMENT}" \
    --query 'Stacks[0].Outputs[?OutputKey==`TableName`].OutputValue' \
    --output text 2>/dev/null || echo "N/A")

echo "GraphQL API URL: $API_URL"
echo "GraphQL API Key: $API_KEY"
echo "DynamoDB Table: $TABLE_NAME"
echo ""

cd ..

# Update .env.local if it exists
if [ -f .env.local ]; then
    echo "Updating .env.local..."
    
    # Update AppSync URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_APPSYNC_URL=.*|NEXT_PUBLIC_APPSYNC_URL=$API_URL|" .env.local
        sed -i '' "s|NEXT_PUBLIC_APPSYNC_API_KEY=.*|NEXT_PUBLIC_APPSYNC_API_KEY=$API_KEY|" .env.local
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_APPSYNC_URL=.*|NEXT_PUBLIC_APPSYNC_URL=$API_URL|" .env.local
        sed -i "s|NEXT_PUBLIC_APPSYNC_API_KEY=.*|NEXT_PUBLIC_APPSYNC_API_KEY=$API_KEY|" .env.local
    fi
    
    echo -e "${GREEN}✅ .env.local updated${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Create it with these values:"
    echo "NEXT_PUBLIC_APPSYNC_URL=$API_URL"
    echo "NEXT_PUBLIC_APPSYNC_API_KEY=$API_KEY"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update GitHub Secrets with the API URL and Key (if using CI/CD)"
echo "2. Start development server: npm run dev"
echo "3. Test the application"
echo ""

