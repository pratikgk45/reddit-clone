# GitHub Actions Deployment Setup

## Overview
Automated CI/CD pipeline that deploys infrastructure and frontend on every push to `main`.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)
**Triggers**: Push/PR to `main` or `develop`

**Jobs**:
- ✅ Lint & Type Check
- ✅ Unit Tests (Jest)
- ✅ E2E Tests (Playwright)
- ✅ Build Validation
- ✅ Infrastructure Synth

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)
**Triggers**: 
- Push to `main` (automatic)
- Manual trigger via GitHub UI

**Jobs**:
1. **Deploy Infrastructure** (AWS CDK)
   - Deploys AppSync + DynamoDB
   - Outputs API URL and Key
   
2. **Deploy Frontend** (Vercel)
   - Builds Next.js app
   - Deploys to Vercel

## Required GitHub Secrets

### AWS Secrets
```bash
AWS_DEPLOY_ROLE_ARN      # IAM role ARN for OIDC
AWS_ACCOUNT_ID           # Your AWS account ID
AWS_REGION               # e.g., us-east-1 (optional, defaults to us-east-1)
```

### Application Secrets
```bash
NEXT_PUBLIC_APPSYNC_URL      # From CDK output
NEXT_PUBLIC_APPSYNC_API_KEY  # From CDK output
NEXTAUTH_URL                 # Your production URL
NEXTAUTH_SECRET              # 32+ character secret
```

### Optional OAuth Secrets
```bash
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

### Vercel Secrets (if using Vercel)
```bash
VERCEL_TOKEN        # Vercel API token
VERCEL_ORG_ID       # Vercel organization ID
VERCEL_PROJECT_ID   # Vercel project ID
```

## Setup Instructions

### Step 1: Configure AWS OIDC

Create an IAM role for GitHub Actions:

```bash
# Run this script to create the role
./scripts/create-iam-role.sh
```

Or manually:
1. Go to AWS IAM → Roles → Create Role
2. Select "Web Identity"
3. Identity provider: `token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`
5. Add condition: `token.actions.githubusercontent.com:sub` = `repo:YOUR_USERNAME/reddit-2:ref:refs/heads/main`
6. Attach policies: `AdministratorAccess` (or custom CDK policy)
7. Copy the Role ARN

### Step 2: Add GitHub Secrets

```bash
# Navigate to: Settings → Secrets and variables → Actions → New repository secret

# Add each secret:
gh secret set AWS_DEPLOY_ROLE_ARN --body "arn:aws:iam::123456789012:role/GitHubActionsRole"
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set NEXTAUTH_URL --body "https://your-app.vercel.app"
```

### Step 3: Deploy Infrastructure First

Option A: Manual trigger
1. Go to Actions → Deploy → Run workflow
2. Select environment: `production`
3. Click "Run workflow"

Option B: Push to main
```bash
git push origin main
```

### Step 4: Update AppSync Secrets

After infrastructure deploys, get the outputs:

```bash
cd infrastructure
cdk deploy --outputs-file outputs.json
cat outputs.json
```

Add to GitHub secrets:
```bash
gh secret set NEXT_PUBLIC_APPSYNC_URL --body "https://xxx.appsync-api.us-east-1.amazonaws.com/graphql"
gh secret set NEXT_PUBLIC_APPSYNC_API_KEY --body "da2-xxxxxxxxxxxxx"
```

### Step 5: Setup Vercel (Optional)

If using Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Get project details
vercel project ls

# Add secrets
gh secret set VERCEL_TOKEN --body "your-vercel-token"
gh secret set VERCEL_ORG_ID --body "your-org-id"
gh secret set VERCEL_PROJECT_ID --body "your-project-id"
```

## Workflow Behavior

### On Push to `main`:
1. ✅ Run CI checks (lint, test, build)
2. ✅ Deploy AWS infrastructure (CDK)
3. ✅ Deploy Next.js to Vercel
4. ✅ Post deployment summary

### On Pull Request:
1. ✅ Run CI checks only
2. ❌ No deployment

### Manual Trigger:
1. Choose environment (dev/staging/production)
2. Deploy infrastructure
3. Deploy frontend

## Monitoring Deployments

### View Workflow Runs
```
https://github.com/YOUR_USERNAME/reddit-2/actions
```

### Check Deployment Status
- **Infrastructure**: AWS CloudFormation console
- **Frontend**: Vercel dashboard

### Logs
- GitHub Actions logs show detailed output
- CloudWatch logs for AppSync/Lambda
- Vercel logs for frontend

## Troubleshooting

### Deployment Fails: "No credentials"
- Check AWS_DEPLOY_ROLE_ARN is correct
- Verify OIDC trust relationship in IAM role

### CDK Deploy Fails: "Stack already exists"
- Run `cdk destroy` to remove old stack
- Or update the stack name in `infrastructure/bin/reddit.ts`

### Vercel Deploy Skipped
- Ensure VERCEL_TOKEN secret is set
- Check Vercel project is linked

### Build Fails: "Invalid environment"
- Verify all required secrets are set
- Check secret names match exactly

## Alternative Deployment Options

### AWS Amplify (instead of Vercel)

Replace Vercel step with:
```yaml
- name: Deploy to Amplify
  run: |
    aws amplify start-deployment \
      --app-id ${{ secrets.AMPLIFY_APP_ID }} \
      --branch-name main
```

### Self-Hosted

Replace Vercel step with:
```yaml
- name: Deploy to Server
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /var/www/reddit-app
      git pull
      npm install
      npm run build
      pm2 restart reddit-app
```

## Security Best Practices

1. ✅ Use OIDC instead of long-lived AWS credentials
2. ✅ Rotate NEXTAUTH_SECRET regularly
3. ✅ Use least-privilege IAM policies
4. ✅ Store all secrets in GitHub Secrets
5. ✅ Enable branch protection on `main`
6. ✅ Require PR reviews before merge

## Cost Optimization

- Infrastructure deploys only on changes
- Use CDK context caching
- Destroy dev/staging stacks when not in use
- Monitor AWS costs in Cost Explorer
