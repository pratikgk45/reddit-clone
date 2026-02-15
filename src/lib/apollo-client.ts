/**
 * Apollo Client configuration for AWS AppSync
 * Includes error handling, retry logic, and proper authentication
 */

import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { env } from './env';

// HTTP Link
const httpLink = createHttpLink({
  uri: env.NEXT_PUBLIC_APPSYNC_URL || '',
});

// Auth Link - Add API key to headers
const authLink = setContext((_, { headers }) => {
  const apiKey = env.NEXT_PUBLIC_APPSYNC_API_KEY;

  if (!apiKey) {
    console.warn('⚠️ AppSync API key not configured');
  }

  return {
    headers: {
      ...headers,
      'x-api-key': apiKey || '',
      'Content-Type': 'application/json',
    },
  };
});

// Error Link - Handle GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);

      // Log error details in development
      if (env.NODE_ENV === 'development' && extensions) {
        console.error('Error extensions:', extensions);
      }

      // Handle specific error types
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Handle authentication errors
        console.error('Authentication error - user may need to re-authenticate');
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError.message}`);

    // Handle network errors (ServerError has statusCode)
    const statusCode = 'statusCode' in networkError ? networkError.statusCode : undefined;
    if (statusCode === 401) {
      console.error('Unauthorized - check API key');
    } else if (statusCode === 403) {
      console.error('Forbidden - check permissions');
    }
  }
});

// Retry Link - Retry failed requests
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors, but not on GraphQL errors
      return !!error && !error.graphQLErrors;
    },
  },
});

// Create Apollo Client
const client = new ApolloClient({
  link: from([errorLink, retryLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Post: {
        fields: {
          comment: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          vote: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: env.NODE_ENV === 'development',
});

export default client;
