import { gql } from "@apollo/client";

export const GET_SUBREDDITS_BY_TOPIC = gql`
    query getSubredditsByTopic($topic: String!) {
        subredditsByTopic(topic: $topic) {
            id
            topic
            created_at
        }
    }
`;

export const GET_POSTS = gql`
    query getPosts {
        postList {
            body
            created_at
            id
            image
            subreddit_id
            title
            username
            vote {
                upvote
            }
            subreddit {
                topic
            }
            comment {
                id
            }
        }
    }
`;

export const GET_POSTS_BY_TOPIC = gql`
    query postListByTopic($topic: String!) {
        postListByTopic(topic: $topic) {
            body
            created_at
            id
            image
            subreddit_id
            title
            username
            vote {
                upvote
            }
            subreddit {
                topic
            }
            comment {
                id
            }
        }
    }
`;