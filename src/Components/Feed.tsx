'use client';

import { useQuery } from "@apollo/client";
import { GET_POSTS, GET_POSTS_BY_TOPIC } from "../../graphql/queries";
import Post from "./Post";

export default function Feed({ topic }: { topic?: string; }) {
    const postsByTopic = useQuery(GET_POSTS_BY_TOPIC, { variables: { topic }, skip: !topic }).data?.postListByTopic ?? [];
    const allPosts = useQuery(GET_POSTS, { skip: !!topic }).data?.postList ?? [];
    const posts: Post[] = topic ? postsByTopic: allPosts;

    return (
        <div className="flex flex-col space-y-3">
            {
                posts.map(post => <Post key={post.id} post={post} allowComments={false} />)
            }
        </div>
    )
}