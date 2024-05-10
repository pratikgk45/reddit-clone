'use client';

import { ArrowDownIcon, ArrowUpIcon, ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import Avatar from "./Avatar";
import ReactTimeago from "react-timeago";
import Link from "next/link";

export default function Post({ post }: { post: Post }) {

    return (
        <div className="flex space-x-4 px-2 py-4 bg-white border cursor-pointer border-gray-100 shadom-sm rounded-md hover:border hover:border-gray-400">
            <div className="flex flex-col items-center justify-start space-y-1 rounded-l-md text-gray-400 cursor-pointer">
                <ArrowUpIcon className="vote-button hover:text-green-400" />
                <p className="text-xs font-bold text-black cursor-default select-none">{ post.vote.length }</p>
                <ArrowDownIcon className="vote-button hover:text-red-400" />
            </div>

            <div className="flex flex-col space-y-2">
                <Link href={`subreddit/${post.subreddit_id}`}>
                    <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2 items-center">
                            <Avatar seed={post.subreddit.topic}></Avatar>
                            <p className="text-gray-400 text-sm">
                                <span className="font-bold">r/{post.subreddit.topic}</span>
                                &nbsp;• Posted by u/{post.username}
                                &nbsp;• <ReactTimeago date={post.created_at} />
                            </p>
                        </div>
                        <div className="font-bold text-lg">{ post.title }</div>
                        <div>{ post.body }</div>
                        <div className="w-full rounded-xl">
                            <img src={post.image} alt="" className="m-auto" />
                        </div>
                    </div>
                </Link>


                <div className="flex space-x-4 text-gray-400">
                    <div className="flex space-x-2 cursor-pointer">
                        <ChatBubbleBottomCenterIcon className="h-6 w-6" />
                        {post.comment.length > 0 && <p>{post.comment.length}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}