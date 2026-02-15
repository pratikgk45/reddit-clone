import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { getConfig } from './config';

export interface RedditStackProps extends cdk.StackProps {
  environment?: string;
}

export class RedditStack extends cdk.Stack {
  public readonly api: appsync.GraphqlApi;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: RedditStackProps) {
    super(scope, id, props);

    const config = getConfig(props?.environment);

    // DynamoDB Table - Single Table Design
    // Using single table design for efficient queries and cost optimization
    const table = new dynamodb.Table(this, 'RedditTable', {
      tableName: config.tableName,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy:
        config.removalPolicy === 'RETAIN' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: config.pointInTimeRecovery,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
    });

    // Global Secondary Indexes for efficient querying
    // GSI1: Query posts by subreddit (GSI1PK = SUBREDDIT#topic, GSI1SK = POST#created_at)
    // GSI2: Query subreddits by topic (GSI2PK = TOPIC, GSI2SK = SUBREDDIT#id)
    // GSI3: Query votes by post (GSI3PK = POST#id, GSI3SK = VOTE#username)
    // GSI4: Query comments by post (GSI4PK = POST#id, GSI4SK = COMMENT#created_at)

    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI3',
      partitionKey: { name: 'GSI3PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI3SK', type: dynamodb.AttributeType.STRING },
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI4',
      partitionKey: { name: 'GSI4PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI4SK', type: dynamodb.AttributeType.STRING },
    });

    // CloudWatch Log Group for AppSync
    const logGroup = new logs.LogGroup(this, 'AppSyncLogGroup', {
      logGroupName: `/aws/appsync/apis/${config.apiName}`,
      retention:
        config.environment === 'production'
          ? logs.RetentionDays.ONE_MONTH
          : logs.RetentionDays.ONE_WEEK,
      removalPolicy:
        config.removalPolicy === 'RETAIN' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // AppSync API
    const api = new appsync.GraphqlApi(this, 'RedditGraphQLApi', {
      name: config.apiName,
      definition: appsync.Definition.fromFile('schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
        // Optional: Add Cognito User Pool for authenticated access
        // additionalAuthorizationModes: [{
        //   authorizationType: appsync.AuthorizationType.USER_POOL,
        //   userPoolConfig: {
        //     userPool: userPool,
        //   },
        // }],
      },
      logConfig: {
        fieldLogLevel:
          config.logLevel === 'ALL'
            ? appsync.FieldLogLevel.ALL
            : config.logLevel === 'ERROR'
              ? appsync.FieldLogLevel.ERROR
              : appsync.FieldLogLevel.NONE,
        excludeVerboseContent: false,
      },
      xrayEnabled: config.enableXRay,
    });

    // DynamoDB DataSource
    const dynamoDataSource = api.addDynamoDbDataSource('DynamoDataSource', table);

    // Create Resolvers
    this.createResolvers(api, dynamoDataSource);
    this.createFieldResolvers(api, dynamoDataSource);

    // Store references
    this.api = api;
    this.table = table;

    // Outputs
    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
      description: 'AppSync GraphQL API URL',
    });

    new cdk.CfnOutput(this, 'GraphQLAPIKey', {
      value: api.apiKey || '',
      description: 'AppSync API Key',
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
      description: 'DynamoDB Table Name',
    });
  }

  private createResolvers(api: appsync.GraphqlApi, dataSource: appsync.DynamoDbDataSource) {
    // Query Resolvers
    dataSource.createResolver('GetPostResolver', {
      typeName: 'Query',
      fieldName: 'post',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Query.getPost.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Query.getPost.res.vtl'),
    });

    dataSource.createResolver('GetPostListResolver', {
      typeName: 'Query',
      fieldName: 'postList',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Query.postList.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Query.postList.res.vtl'),
    });

    dataSource.createResolver('GetPostListByTopicResolver', {
      typeName: 'Query',
      fieldName: 'postListByTopic',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Query.postListByTopic.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Query.postListByTopic.res.vtl'
      ),
    });

    dataSource.createResolver('GetSubredditListResolver', {
      typeName: 'Query',
      fieldName: 'subredditList',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Query.subredditList.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Query.subredditList.res.vtl'
      ),
    });

    dataSource.createResolver('GetSubredditsByTopicResolver', {
      typeName: 'Query',
      fieldName: 'subredditsByTopic',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Query.subredditsByTopic.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Query.subredditsByTopic.res.vtl'
      ),
    });

    // Mutation Resolvers
    dataSource.createResolver('InsertPostResolver', {
      typeName: 'Mutation',
      fieldName: 'insertPost',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.insertPost.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.insertPost.res.vtl'
      ),
    });

    dataSource.createResolver('InsertSubredditResolver', {
      typeName: 'Mutation',
      fieldName: 'insertSubredditByTopic',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.insertSubredditByTopic.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.insertSubredditByTopic.res.vtl'
      ),
    });

    dataSource.createResolver('AddCommentResolver', {
      typeName: 'Mutation',
      fieldName: 'addComment',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.addComment.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.addComment.res.vtl'
      ),
    });

    dataSource.createResolver('AddVoteResolver', {
      typeName: 'Mutation',
      fieldName: 'addVote',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.addVote.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.addVote.res.vtl'
      ),
    });

    dataSource.createResolver('UpdateVoteResolver', {
      typeName: 'Mutation',
      fieldName: 'updateVote',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.updateVote.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.updateVote.res.vtl'
      ),
    });

    dataSource.createResolver('DeleteVoteResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteVote',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.deleteVote.req.vtl'
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        'resolvers/Mutation.deleteVote.res.vtl'
      ),
    });
  }

  private createFieldResolvers(api: appsync.GraphqlApi, dataSource: appsync.DynamoDbDataSource) {
    // Field Resolvers for relationships
    dataSource.createResolver('PostCommentResolver', {
      typeName: 'Post',
      fieldName: 'comment',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Post.comment.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Post.comment.res.vtl'),
    });

    dataSource.createResolver('PostVoteResolver', {
      typeName: 'Post',
      fieldName: 'vote',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Post.vote.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Post.vote.res.vtl'),
    });

    dataSource.createResolver('PostSubredditResolver', {
      typeName: 'Post',
      fieldName: 'subreddit',
      requestMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Post.subreddit.req.vtl'),
      responseMappingTemplate: appsync.MappingTemplate.fromFile('resolvers/Post.subreddit.res.vtl'),
    });
  }
}
