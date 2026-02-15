# Infrastructure (AWS CDK)

AppSync + DynamoDB stack for the Reddit clone.

```bash
npm install
cdk bootstrap   # first time per account/region
cdk deploy
```

Set `ENVIRONMENT=dev|staging|production` to deploy that env. Outputs: GraphQL API URL, API Key, table name — use them in the app’s `.env.local`.
