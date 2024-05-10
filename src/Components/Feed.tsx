'use client';

import { useQuery } from "@apollo/client";
import { GET_POSTS, GET_POSTS_BY_TOPIC } from "../../graphql/queries";
import Post from "./Post";
import Loader from "./Loader";

export default function Feed({ topic }: { topic?: string; }) {
    const postsByTopicData = useQuery(GET_POSTS_BY_TOPIC, { variables: { topic }, skip: !topic }).data;
    const allPostsData = useQuery(GET_POSTS, { skip: !!topic }).data;

    if ((topic && !postsByTopicData) || (!topic && !allPostsData)) {
        return (
            <div className="flex w-full items-center justify-center p-10 text-xl">
                <Loader />
            </div>
        )
    }

    const posts: Post[] = (topic ? postsByTopicData?.postListByTopic: allPostsData?.postList) ?? [];

    return (
        <div className="flex flex-1 flex-col space-y-3">
            {
                posts.map(post => <Post key={post.id} post={post} allowComments={false} />)
            }
        </div>
    )
}