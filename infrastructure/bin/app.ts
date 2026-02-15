#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RedditStack } from '../lib/reddit-stack';

const app = new cdk.App();

const environment = process.env.ENVIRONMENT || 'dev';
const account = process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID;
const region = process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';

if (!account) {
  throw new Error('AWS Account ID must be provided via CDK_DEFAULT_ACCOUNT or AWS_ACCOUNT_ID');
}

const stackName = environment === 'production' ? 'RedditStack' : `RedditStack-${environment}`;

new RedditStack(app, stackName, {
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
