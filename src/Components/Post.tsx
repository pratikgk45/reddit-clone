'use client';

import { ArrowDownIcon, ArrowUpIcon, ChatBubbleBottomCenterIcon } from "@heroicons/react/24/outline";
import Avatar from "./Avatar";
import ReactTimeago from "react-timeago";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { ADD_COMMENT, ADD_VOTE, DELETE_VOTE, UPDATE_VOTE } from "../../graphql/mutation";
import { GET_POST_BY_ID } from "../../graphql/queries";
import { useRouter } from "next/navigation";


export default function Post({ post, allowComments }: { post: Post; allowComments: boolean }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isCommentVisible, setIsCommentVisible] = useState(false);
    const [addComment] = useMutation(ADD_COMMENT, {
        refetchQueries: [{ query: GET_POST_BY_ID, variables: { id: post.id } }]
    });
    const [addVote] = useMutation(ADD_VOTE, {
        refetchQueries: [{ query: GET_POST_BY_ID, variables: { id: post.id } }]
    });
    const [updateVote] = useMutation(UPDATE_VOTE, {
        refetchQueries: [{ query: GET_POST_BY_ID, variables: { id: post.id } }]
    });
    const [deleteVote] = useMutation(DELETE_VOTE, {
        refetchQueries: [{ query: GET_POST_BY_ID, variables: { id: post.id } }]
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue
    } = useForm<{ comment: string }>();

    const insertVote = async (upvote: boolean) => {
        const username = session?.user?.name;
        
        const prevVote = post.vote.find(vote => vote.username === username);

        if (prevVote) {
            if (prevVote.upvote === upvote) {
                await deleteVote({
                    variables: {
                        id: prevVote.id
                    }
                });
            } else {
                await updateVote({
                    variables: {
                        id: prevVote.id,
                        username,
                        post_id: post.id,
                        upvote
                    }
                });
            }
        } else {        
            await addVote({
                variables: {
                    username,
                    post_id: post.id,
                    upvote
                }
            });
        }
    };

    const upvotes = post.vote.reduce((c, v) => (c + (v.upvote ? 1: -1)), 0);
    const prevVote = post.vote.find(vote => vote.username === session?.user?.name);
    const curState = prevVote ? (prevVote.upvote ? 'uv': 'dv'): 'nv';

    const insertComment = handleSubmit(async (formData) => {
        const notification = toast.loading('Posting your comment...');

        await addComment({
            variables: {
                username: session?.user?.name,
                post_id: post.id,
                text: formData.comment
            }
        });

        setValue('comment', '');

        toast.success('Comment successfully posted 🙂', { id: notification });
    });

    return (
        <div className="flex space-x-4 px-2 py-4 bg-white border cursor-pointer border-gray-100 shadom-sm rounded-md hover:border hover:border-gray-400">
            <div className="flex flex-col items-center justify-start space-y-1 rounded-l-md text-gray-400 cursor-pointer">
                <ArrowUpIcon className={`vote-button hover:text-green-600 ${(curState === 'uv') && 'text-green-600'}`} onClick={() => insertVote(true)} />
                <p className="text-xs font-bold text-black cursor-default select-none">{ upvotes }</p>
                <ArrowDownIcon className={`vote-button hover:text-red-600 ${(curState === 'dv') && 'text-red-600'}`} onClick={() => insertVote(false)} />
            </div>

            <div className="flex flex-1 flex-col space-y-2">
                <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2 items-center">
                        <Avatar seed={post.subreddit.topic}></Avatar>
                        <p className="text-gray-400 text-sm">
                            <Link href={`/subreddit/${post.subreddit.topic}`}>
                                <span className="font-bold hover:text-blue-400">r/{post.subreddit.topic}</span>
                            </Link>
                            &nbsp;• Posted by u/{post.username}
                            &nbsp;• <ReactTimeago date={post.created_at} />
                        </p>
                    </div>
                    <Link href={`/post/${post.id}`}>
                        <div className="font-bold text-lg">{ post.title }</div>
                        <div>{ post.body }</div>
                        <div className="w-full rounded-xl">
                            <img src={post.image} alt="" className="m-auto" />
                        </div>
                    </Link>
                </div>


                <div className="flex space-x-4 text-gray-400">
                    <div className={`flex space-x-2 cursor-pointer hover:text-gray-600 ${isCommentVisible && 'text-blue-400'}`} 
                        onClick={() => allowComments ? setIsCommentVisible(!isCommentVisible): router.push(`/post/${post.id}`) }>
                        <ChatBubbleBottomCenterIcon className="h-6 w-6" />
                        {post.comment.length > 0 && <p>{post.comment.length}</p>}
                    </div>
                </div>



                {session && allowComments && isCommentVisible && (
                    <div className="flex flex-col space-y-4">
                        <form onSubmit={insertComment} className="py-2 flex flex-col flex-1 space-y-2">
                            <textarea placeholder="Add a comment" {...register('comment')} className="flex flex-1 flex-end  bg-blue-50 p-2 rounded-md outline-none" />
                            <div className="flex-end justify-end text-white">
                                <button className="flex-end bg-orange-600 rounded-xl p-2 disabled:bg-gray-200" disabled={!watch('comment')} type="submit">Comment</button>
                            </div>
                        </form>

                        <div className="flex flex-col space-y-4">
                            {post.comment.map((comment) => (
                                <div className="flex space-x-2 py-1" key={comment.id}>
                                    <Avatar seed={comment.username}></Avatar>

                                    <div className="flex flex-col space-y-2">
                                        <p className="text-gray-400 text-sm">
                                            <span className="font-bold">{comment.username}</span>
                                            &nbsp;• <ReactTimeago date={comment.created_at} />
                                        </p>

                                        <div>
                                            {comment.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}