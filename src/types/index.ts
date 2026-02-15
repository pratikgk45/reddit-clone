/**
 * Shared TypeScript types for the application
 */

export interface Post {
  id: string;
  title: string;
  body?: string;
  username: string;
  subreddit_id: string;
  image?: string;
  created_at: string;
  vote: Vote[];
  comment: Comment[];
  subreddit: Subreddit;
}

export interface Subreddit {
  id: string;
  topic: string;
  created_at: string;
  post?: Post[];
}

export interface Comment {
  id: string;
  post_id: string;
  text: string;
  username: string;
  created_at: string;
}

export interface Vote {
  id: string;
  post_id: string;
  upvote: boolean;
  username: string;
  created_at: string;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}
