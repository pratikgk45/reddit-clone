# Unified AWS Deployment (Portfolio + Reddit Clone)

## What's Being Deployed

Single unified infrastructure with:
- **Shared VPC** (1 NAT Gateway)
- **Shared ECS Cluster**
- **Shared ALB** with path-based routing:
  - `/` → Portfolio
  - `/projects/reddit*` → Reddit Clone
- **CloudFront** with HTTPS
- **Route 53** for pratik-kale.com

## Cost Savings

**Before (Separate):**
- 2x NAT Gateway: $64/month
- 2x ALB: $32/month
- 2x ECS: $60-100/month
- Total: ~$156-196/month

**After (Unified):**
- 1x NAT Gateway: $32/month
- 1x ALB: $16/month
- 2x ECS: $60-100/month
- CloudFront: $1-5/month
- Route 53: $0.50/month
- **Total: ~$109-153/month**

**Savings: ~$47-43/month**

## Deployment Steps

### 1. Delete Old Reddit ECS Stack

```bash
aws cloudformation delete-stack --stack-name RedditEcsStack --region us-east-1
```

Wait for deletion to complete (~5 minutes).

### 2. Deploy Unified Stack

```bash
cd /Users/pratikgk45/Documents/my_workspace/reddit-2
git add -A
git commit -m "feat: unified deployment with portfolio"
git push origin main
```

This will:
- Keep RedditStack (AppSync + DynamoDB)
- Deploy UnifiedAppStack (both apps in one VPC)
- Create CloudFront distribution
- Set up custom domain

### 3. Update Squarespace DNS

After deployment, get nameservers from output and update Squarespace to point to AWS Route 53.

### 4. Update OAuth URLs

**Reddit**: https://www.reddit.com/prefs/apps
- Add: `https://pratik-kale.com/projects/reddit/api/auth/callback/reddit`

**Google**: https://console.cloud.google.com/apis/credentials
- Add: `https://pratik-kale.com/projects/reddit/api/auth/callback/google`

## Architecture

```
pratik-kale.com (Route 53)
         ↓
CloudFront Distribution (HTTPS)
         ↓
Application Load Balancer
    ├── / → Portfolio ECS Task
    └── /projects/reddit* → Reddit ECS Task
         ↓
Shared VPC (1 NAT Gateway)
```

## Timeline

- Stack deletion: ~5 minutes
- Unified stack deployment: ~15-20 minutes
- Certificate validation: ~10-15 minutes
- DNS propagation: 24-48 hours

