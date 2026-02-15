#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RedditStack } from '../lib/reddit-stack';
import { UnifiedAppStack } from '../lib/unified-app-stack';

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

// Unified app stack (Portfolio + Reddit) - only in production
if (environment === 'production') {
  const unifiedStack = new UnifiedAppStack(app, 'UnifiedAppStack', {
    env: { account, region },
    appsyncUrl: backendStack.api.graphqlUrl,
    appsyncApiKey: backendStack.api.apiKey || '',
    nextauthSecret: process.env.NEXTAUTH_SECRET || 'change-me-in-production',
    redditClientId: process.env.REDDIT_CLIENT_ID || '',
    redditClientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    domainName: process.env.DOMAIN_NAME,
    description: 'Unified stack with Portfolio and Reddit Clone',
    tags: {
      Environment: environment,
      Project: 'Unified',
      ManagedBy: 'CDK',
    },
  });

  unifiedStack.addDependency(backendStack);
}
