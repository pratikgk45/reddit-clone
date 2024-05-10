'use client';

import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { GET_POST_BY_ID } from "../../../../graphql/queries";
import Post from "@/Components/Post";
import Loader from "@/Components/Loader";
import { useSession } from "next-auth/react";

export default function PostPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    
    const { data, error } = useQuery(GET_POST_BY_ID, { variables: { id } });

    const post: Post = data?.post;
    
    if (!post) {
        return (
            <div className="flex w-full items-center justify-center p-10 text-xl">
                <Loader />
            </div>
        )
    }

    return (
        <div className="mx-auto my-7 max-w-5xl">
            <Post post={post} allowComments />
        </div>
    );
}