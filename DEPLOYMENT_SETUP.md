# 🚀 Automated Deployment Setup Complete

## ✅ What's Configured

### GitHub Actions Workflows

#### 1. **CI Workflow** (`.github/workflows/ci.yml`)
Runs on: Push/PR to `main` or `develop`

**Jobs:**
- ✅ Lint & Type Check (ESLint + TypeScript)
- ✅ Unit Tests (Jest with coverage)
- ✅ E2E Tests (Playwright - 18 tests)
- ✅ Build Validation (Next.js production build)
- ✅ Infrastructure Test (CDK synth)

**Duration:** ~3-5 minutes

#### 2. **Deploy Workflow** (`.github/workflows/deploy.yml`)
Runs on: 
- Automatic: Push to `main`
- Manual: GitHub Actions UI

**Jobs:**
1. **Deploy Infrastructure** (AWS CDK)
   - Configures AWS credentials via OIDC
   - Runs CDK bootstrap (if needed)
   - Deploys AppSync + DynamoDB stack
   - Outputs API URL and Key
   
2. **Deploy Frontend** (Vercel)
   - Builds Next.js application
   - Deploys to Vercel production
   - Posts deployment summary

**Duration:** ~5-10 minutes

### Scripts Created

1. **`scripts/setup-github-secrets.sh`**
   - Interactive setup for all GitHub secrets
   - Generates NEXTAUTH_SECRET automatically
   - Validates required secrets

2. **`scripts/create-iam-role.sh`** (existing)
   - Creates AWS IAM role for GitHub OIDC
   - Configures trust relationship

### Documentation

1. **`QUICKSTART.md`** - Quick reference for daily use
2. **`.github/DEPLOYMENT.md`** - Comprehensive deployment guide
3. **`TEST_REPORT.md`** - Test suite documentation
4. **`e2e/README.md`** - E2E test documentation

## 🔐 Required Secrets

### Must Configure Before First Deploy

```bash
AWS_DEPLOY_ROLE_ARN      # IAM role for GitHub Actions
AWS_ACCOUNT_ID           # Your AWS account ID
NEXTAUTH_SECRET          # 32+ character secret
NEXTAUTH_URL             # Production URL (e.g., https://app.vercel.app)
```

### Configure After Infrastructure Deploy

```bash
NEXT_PUBLIC_APPSYNC_URL      # From CDK output
NEXT_PUBLIC_APPSYNC_API_KEY  # From CDK output
```

### Optional (for full functionality)

```bash
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# OAuth
REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

## 🎯 Deployment Flow

```
Developer pushes to main
         ↓
GitHub Actions triggered
         ↓
┌─────────────────────┐
│   CI Checks         │
│  - Lint             │
│  - Type Check       │
│  - Unit Tests       │
│  - E2E Tests        │
│  - Build            │
└─────────────────────┘
         ↓
    All Pass? ✅
         ↓
┌─────────────────────┐
│ Deploy Infra (CDK)  │
│  - AppSync API      │
│  - DynamoDB Table   │
│  - CloudWatch Logs  │
└─────────────────────┘
         ↓
┌─────────────────────┐
│ Deploy Frontend     │
│  - Build Next.js    │
│  - Deploy to Vercel │
└─────────────────────┘
         ↓
    🎉 Live!
```

## 📋 Setup Checklist

### One-Time Setup

- [ ] Create AWS IAM role for GitHub OIDC
  ```bash
  ./scripts/create-iam-role.sh
  ```

- [ ] Configure GitHub secrets
  ```bash
  ./scripts/setup-github-secrets.sh
  ```

- [ ] Enable GitHub Actions
  - Go to Settings → Actions → General
  - Allow all actions

- [ ] Protect main branch (recommended)
  - Settings → Branches → Add rule
  - Require PR reviews
  - Require status checks

### First Deployment

- [ ] Push to main or trigger manually
  ```bash
  git push origin main
  # OR
  gh workflow run deploy.yml
  ```

- [ ] Wait for infrastructure deployment (~5 min)

- [ ] Update AppSync secrets
  ```bash
  cd infrastructure
  cdk deploy --outputs-file outputs.json
  gh secret set NEXT_PUBLIC_APPSYNC_URL --body "$(jq -r '.RedditStack.GraphQLAPIURL' outputs.json)"
  gh secret set NEXT_PUBLIC_APPSYNC_API_KEY --body "$(jq -r '.RedditStack.GraphQLAPIKey' outputs.json)"
  ```

- [ ] Trigger deployment again to use new secrets
  ```bash
  gh workflow run deploy.yml
  ```

- [ ] Verify deployment
  - Check GitHub Actions logs
  - Visit production URL
  - Test GraphQL queries

## 🔄 Daily Workflow

### Make Changes
```bash
git checkout -b feature/my-feature
# Make changes
git commit -m "Add feature"
git push origin feature/my-feature
```

### Create PR
- CI checks run automatically
- Review and merge

### Deploy
- Merge to main → automatic deployment
- Or manually trigger: `gh workflow run deploy.yml`

## 📊 Monitoring

### GitHub Actions
```bash
# View workflow runs
gh run list

# Watch live
gh run watch

# View logs
gh run view <run-id> --log
```

### AWS Resources
- CloudFormation: Stack status
- AppSync: API metrics
- DynamoDB: Table metrics
- CloudWatch: Logs and alarms

### Vercel
- Dashboard: Deployment status
- Analytics: Performance metrics
- Logs: Runtime logs

## 🛠️ Troubleshooting

### Deployment Fails

**"No credentials"**
```bash
# Check role ARN
gh secret list | grep AWS_DEPLOY_ROLE_ARN

# Verify IAM role trust relationship
aws iam get-role --role-name GitHubActionsRole
```

**"CDK bootstrap required"**
```bash
cd infrastructure
cdk bootstrap aws://ACCOUNT_ID/REGION
```

**"Build fails"**
```bash
# Verify secrets
gh secret list

# Test locally
npm run build
```

### CI Checks Fail

**Lint errors**
```bash
npm run lint:fix
```

**Type errors**
```bash
npm run type-check
```

**E2E tests fail**
```bash
npm run test:e2e:headed  # See browser
```

## 🎉 Success Indicators

After successful deployment:

✅ GitHub Actions shows green checkmarks  
✅ CloudFormation stack status: `CREATE_COMPLETE` or `UPDATE_COMPLETE`  
✅ Vercel deployment shows "Ready"  
✅ Production URL loads successfully  
✅ GraphQL queries return data  
✅ No console errors in browser  

## 📚 Additional Resources

- **Quick Reference**: `QUICKSTART.md`
- **Full Guide**: `.github/DEPLOYMENT.md`
- **Test Docs**: `TEST_REPORT.md`
- **GitHub Actions**: https://docs.github.com/actions
- **AWS CDK**: https://docs.aws.amazon.com/cdk
- **Vercel**: https://vercel.com/docs

## 🚀 Next Steps

1. Run setup script: `./scripts/setup-github-secrets.sh`
2. Push to main: `git push origin main`
3. Monitor deployment: `gh run watch`
4. Update AppSync secrets after first deploy
5. Enjoy automated deployments! 🎉
