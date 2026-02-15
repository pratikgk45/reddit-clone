#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RedditStack } from '../lib/reddit-stack';
import { EcsStack } from '../lib/ecs-stack';
import { DomainStack } from '../lib/domain-stack';

const app = new cdk.App();

const environment = process.env.ENVIRONMENT || 'dev';
const account = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID || '123456789012';
const region = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';

const stackName = environment === 'production' ? 'RedditStack' : `RedditStack-${environment}`;

const backendStack = new RedditStack(app, stackName, {
  environment,
  env: {
    account,
    region,
  },
  description: `Reddit clone infrastructure with AppSync and DynamoDB (${environment})`,
  tags: {
    Environment: environment,
    Project: 'RedditClone',
    ManagedBy: 'CDK',
  },
});

// ECS Fargate stack for frontend (only in production)
if (environment === 'production') {
  const ecsStack = new EcsStack(app, 'RedditEcsStack', {
    env: {
      account,
      region,
    },
    appsyncUrl: backendStack.api.graphqlUrl,
    appsyncApiKey: backendStack.api.apiKey || '',
    nextauthSecret: process.env.NEXTAUTH_SECRET || 'change-me-in-production',
    redditClientId: process.env.REDDIT_CLIENT_ID || '',
    redditClientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    description: 'Reddit clone ECS Fargate service with ALB',
    tags: {
      Environment: environment,
      Project: 'RedditClone',
      ManagedBy: 'CDK',
    },
  });

  // Domain stack (optional - only if DOMAIN_NAME is set)
  if (process.env.DOMAIN_NAME) {
    new DomainStack(app, 'RedditDomainStack', {
      env: {
        account,
        region: 'us-east-1', // ACM certificates for CloudFront must be in us-east-1
      },
      domainName: process.env.DOMAIN_NAME,
      albDnsName: ecsStack.alb.loadBalancerDnsName,
      description: 'Reddit clone custom domain with Route 53 and CloudFront',
      tags: {
        Environment: environment,
        Project: 'RedditClone',
        ManagedBy: 'CDK',
      },
    });
  }
}
