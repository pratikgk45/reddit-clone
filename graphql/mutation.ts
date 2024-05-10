import { gql } from "@apollo/client";

export const ADD_POST = gql`
    mutation AddPost(
        $title: String!
        $body: String!
        $subreddit_id: ID!
        $username: String!
        $image: String!
    ) {
        insertPost(
            title: $title
            body: $body
            subreddit_id: $subreddit_id
            username: $username
            image: $image
        ) {
            body
            created_at
            id
            image
            subreddit_id
            title
            username
        }
    }
`;

export const ADD_SUBREDDIT = gql`
    mutation AddSubreddit(
        $topic: String!
    ) {
        insertSubredditByTopic(
            topic: $topic
        ) {
            topic
            created_at
            id
        }
    }
`;