type Comment = {
    created_at: DateTime;
    id: ID;
    post: Post;
    post_id: ID;
    text: string;
    username: string;
}

type Post = {
    body: string;
    comment: Comment[];
    created_at: DateTime;
    id: ID;
    image: string;
    subreddit: Subreddit;
    subreddit_id: ID;
    title: string;
    username: string;
    vote: Vote[];
}
  
type Subreddit = {
    created_at: DateTime;
    id: ID;
    post: Post[];
    topic: string;
}
  
type Vote = {
    created_at: DateTime;
    id: ID;
    post: Post;
    post_id: ID;
    upvote: boolean;
    username: string;
}