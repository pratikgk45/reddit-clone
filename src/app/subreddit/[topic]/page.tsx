'use client';

import Avatar from "@/Components/Avatar";
import Feed from "@/Components/Feed";
import PostBox from "@/Components/PostBox";
import { useParams } from "next/navigation";

export default function Subreddit() {
    const { topic } = useParams();

    return (
        <div className={`h-24 bg-red-400 p-8`}>
            <div className="-mx-8 mt-10 bg-white">
                <div className="mx-auto flex max-w-5xl items-center space-x-4 pb-3">
                    <div className="-mt-5">
                        <Avatar seed={topic as string} large />
                    </div>

                    <div className="py-2">
                        <h1 className="text-2xl font-semibold">r/{topic}</h1>
                    </div>
                </div>
            </div>

            <div className="my-7 mx-auto max-w-5xl flex flex-col space-y-2">
                <PostBox subreddit_id={topic as string} />

                <div className="flex flex-col">
                    <Feed topic={topic as string} />
                </div>
            </div>
        </div>
    );
}