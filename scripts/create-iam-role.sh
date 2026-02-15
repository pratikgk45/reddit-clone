#!/bin/bash

# Script to create IAM role for GitHub Actions OIDC
# This role allows GitHub Actions to deploy to AWS

set -e

echo "🔐 Creating IAM Role for GitHub Actions"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")

if [ -z "$ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Error: AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS Account ID: $ACCOUNT_ID${NC}"
echo ""

# Get GitHub repository info
read -p "Enter GitHub username/organization: " GITHUB_USER
read -p "Enter repository name (default: reddit-2): " REPO_NAME
REPO_NAME=${REPO_NAME:-reddit-2}

ROLE_NAME="GitHubActionsDeployRole"
POLICY_NAME="${ROLE_NAME}Policy"

echo ""
echo "Configuration:"
echo "  Account ID: $ACCOUNT_ID"
echo "  Repository: $GITHUB_USER/$REPO_NAME"
echo "  Role Name: $ROLE_NAME"
echo ""

read -p "Continue? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Creating OIDC provider (if not exists)..."

# Check if OIDC provider exists
OIDC_EXISTS=$(aws iam list-open-id-connect-providers --query "OpenIDConnectProviderList[?contains(Arn, 'token.actions.githubusercontent.com')]" --output text 2>/dev/null || echo "")

if [ -z "$OIDC_EXISTS" ]; then
    echo "Creating OIDC provider..."
    aws iam create-open-id-connect-provider \
        --url https://token.actions.githubusercontent.com \
        --client-id-list sts.amazonaws.com \
        --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 1c58a3a8518e8759bf075b76b750d4f2df2faf32 \
        > /dev/null 2>&1 || echo "OIDC provider may already exist or creation failed"
else
    echo "OIDC provider already exists"
fi

echo ""
echo "Creating trust policy..."

# Create trust policy
cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_USER}/${REPO_NAME}:*"
        }
      }
    }
  ]
}
EOF

echo "Creating IAM role..."

# Create role
aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document file:///tmp/trust-policy.json \
    --description "Role for GitHub Actions to deploy Reddit Clone infrastructure" \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Role created${NC}"
else
    echo -e "${YELLOW}⚠️  Role may already exist${NC}"
fi

echo ""
echo "Attaching policies..."

# Attach PowerUserAccess (adjust as needed for your security requirements)
aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

echo -e "${GREEN}✅ Policy attached${NC}"

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)

echo ""
echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Role ARN: $ROLE_ARN"
echo ""
echo "Next Steps:"
echo "1. Add this to GitHub Secrets:"
echo "   Name: AWS_DEPLOY_ROLE_ARN"
echo "   Value: $ROLE_ARN"
echo ""
echo "2. Also add:"
echo "   - AWS_ACCOUNT_ID: $ACCOUNT_ID"
echo "   - AWS_REGION: (your preferred region, e.g., us-east-1)"
echo ""
echo "3. Run: ./scripts/setup-github-secrets.sh"
echo ""

# Cleanup
rm -f /tmp/trust-policy.json

