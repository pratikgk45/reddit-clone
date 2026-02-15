# Squarespace DNS Setup for Reddit Clone

## Current Resources (What You're Paying For)

### Active AWS Resources:
1. **ECS Fargate** - Running your app (~$30-50/month)
   - 1-4 tasks with auto-scaling
   - 1 vCPU, 2GB RAM per task
2. **Application Load Balancer** - Routes traffic (~$16/month)
3. **NAT Gateway** - Allows ECS to reach internet (~$32/month)
4. **DynamoDB** - Database (pay per request, likely <$5/month)
5. **AppSync** - GraphQL API (pay per request, likely <$5/month)
6. **CloudWatch Logs** - 7-day retention (~$1/month)

**Total: ~$85-110/month**

### Removed (Not Paying For):
- ❌ Route 53 Hosted Zone ($0.50/month) - REMOVED
- ❌ CloudFront Distribution - REMOVED
- ❌ ACM Certificate (was free anyway)

## Setup Instructions

### 1. Get Your ALB URL
```
http://reddit-clone-alb-1695477752.us-east-1.elb.amazonaws.com
```

### 2. In Squarespace DNS Settings

Add a **CNAME record**:
- **Host**: `projects.reddit` (or whatever subdomain you want)
- **Points to**: `reddit-clone-alb-1695477752.us-east-1.elb.amazonaws.com`
- **TTL**: 3600

This will make your app accessible at:
```
http://projects.reddit.pratik-kale.com
```

### 3. Update NEXTAUTH_URL

After DNS is set up, update the environment variable:
```bash
# Add to GitHub secrets
echo "http://projects.reddit.pratik-kale.com" | gh secret set NEXTAUTH_URL_OVERRIDE

# Then update ecs-stack.ts to use it
```

### 4. Update OAuth Redirect URLs

**Reddit**: https://www.reddit.com/prefs/apps
- Add: `http://projects.reddit.pratik-kale.com/api/auth/callback/reddit`

**Google**: https://console.cloud.google.com/apis/credentials
- Add: `http://projects.reddit.pratik-kale.com/api/auth/callback/google`

## Notes

- **No HTTPS**: ALB doesn't have SSL certificate. For HTTPS, you'd need:
  - ACM certificate (free)
  - CloudFront distribution (~$1-5/month)
  - Route 53 hosted zone ($0.50/month)
  
- **Path-based routing** (/projects/reddit): Not possible with direct ALB. Would need CloudFront + Lambda@Edge.

- **Recommendation**: If you want `pratik-kale.com/projects/reddit` with HTTPS, we need the DomainStack back. Otherwise, use a subdomain like `reddit.pratik-kale.com`.

