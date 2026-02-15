/**
 * Example Apollo Client configuration for AppSync
 *
 * Copy this to your root apollo-client.ts and update with your AppSync endpoint
 * and API key from the CDK deployment outputs.
 */

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_APPSYNC_URL || '', // Set this from CDK output
});

const authLink = setContext((_, { headers }) => {
  const apiKey = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

  if (!apiKey) {
    console.warn('AppSync API key not configured');
  }

  return {
    headers: {
      ...headers,
      'x-api-key': apiKey || '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
