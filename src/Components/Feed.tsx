'use client';

import { useQuery } from "@apollo/client";
import { GET_POSTS, GET_POSTS_BY_TOPIC } from "../../graphql/queries";
import Post from "./Post";

export default function Feed({ topic }: { topic: string; }) {
    let posts: Post[] = [];
    const { data, error } = topic ? useQuery(GET_POSTS_BY_TOPIC, { variables: { topic } }): useQuery(GET_POSTS);

    posts = (topic ? data?.postListByTopic: data?.postList) ?? [];

    return (
        <div className="flex flex-col space-y-3">
            {
                posts.map(post => <Post key={post.id} post={post} />)
            }
        </div>
    )
}