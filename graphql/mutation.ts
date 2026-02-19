import { gql } from '@apollo/client';

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
  mutation AddSubreddit($topic: String!) {
    insertSubredditByTopic(topic: $topic) {
      topic
      created_at
      id
    }
  }
`;

export const ADD_COMMENT = gql`
  mutation addComment($username: String!, $post_id: ID!, $text: String!) {
    addComment(username: $username, post_id: $post_id, text: $text) {
      created_at
      id
      post_id
      text
      username
    }
  }
`;

export const ADD_VOTE = gql`
  mutation addVote($username: String!, $post_id: ID!, $upvote: Boolean!) {
    addVote(username: $username, post_id: $post_id, upvote: $upvote) {
      id
      created_at
      post_id
      upvote
      username
    }
  }
`;

export const UPDATE_VOTE = gql`
  mutation updateVote($id: ID!, $upvote: Boolean!) {
    updateVote(id: $id, upvote: $upvote) {
      id
      upvote
    }
  }
`;

export const DELETE_VOTE = gql`
  mutation deleteVote($id: ID!) {
    deleteVote(id: $id) {
      id
    }
  }
`;
