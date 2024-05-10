'use client';

import { useQuery } from "@apollo/client";
import { GET_POSTS, GET_POSTS_BY_TOPIC } from "../../graphql/queries";
import Post from "./Post";

export default function Feed({ topic }: { topic: string; }) {
    let posts: Post[] = [];

    if (topic) {
        const { data, error } = useQuery(GET_POSTS_BY_TOPIC, { variables: { topic } });

        posts = data?.postListByTopic ?? [];
    } else {
        const { data, error } = useQuery(GET_POSTS);

        posts = data?.postList ?? [];
    }

    return (
        <div className="flex flex-col space-y-3">
            {
                posts.map(post => <Post key={post.id} post={post} />)
            }
        </div>
    )
}