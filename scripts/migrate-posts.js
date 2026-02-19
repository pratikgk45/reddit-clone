#!/usr/bin/env node

/**
 * Migration script to fix GSI1PK for existing posts
 * Updates GSI1PK from SUBREDDIT#<uuid> to SUBREDDIT#<topic>
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const TABLE_NAME = 'reddit-data';
const REGION = 'us-east-1';

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function getSubredditTopic(subredditId) {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `SUBREDDIT#${subredditId}`,
      SK: 'METADATA'
    }
  }));
  
  return result.Item?.topic;
}

async function migratePost(post) {
  const topic = await getSubredditTopic(post.subreddit_id);
  
  if (!topic) {
    console.log(`⚠️  Skipping post ${post.id} - subreddit not found`);
    return false;
  }

  const newGSI1PK = `SUBREDDIT#${topic}`;
  
  if (post.GSI1PK === newGSI1PK) {
    console.log(`✓ Post ${post.id} already has correct GSI1PK`);
    return false;
  }

  await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: post.PK,
      SK: post.SK
    },
    UpdateExpression: 'SET GSI1PK = :gsi1pk',
    ExpressionAttributeValues: {
      ':gsi1pk': newGSI1PK
    }
  }));

  console.log(`✅ Updated post ${post.id}: ${post.GSI1PK} → ${newGSI1PK}`);
  return true;
}

async function scanAndMigrate() {
  let lastEvaluatedKey = undefined;
  let totalPosts = 0;
  let updatedPosts = 0;

  console.log('🔍 Scanning for posts...\n');

  do {
    const scanResult = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
      ExpressionAttributeValues: {
        ':pk': 'POST#',
        ':sk': 'METADATA'
      },
      ExclusiveStartKey: lastEvaluatedKey
    }));

    const posts = scanResult.Items || [];
    totalPosts += posts.length;

    for (const post of posts) {
      const updated = await migratePost(post);
      if (updated) updatedPosts++;
    }

    lastEvaluatedKey = scanResult.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  console.log(`\n📊 Migration complete!`);
  console.log(`   Total posts found: ${totalPosts}`);
  console.log(`   Posts updated: ${updatedPosts}`);
  console.log(`   Posts skipped: ${totalPosts - updatedPosts}`);
}

// Run migration
scanAndMigrate()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
