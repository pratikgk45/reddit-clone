'use client';

import { useSession } from "next-auth/react";
import Avatar from "./Avatar";
import { LinkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_POST, ADD_SUBREDDIT } from "../../graphql/mutation";
import client from "../../apollo-client";
import { GET_POSTS, GET_SUBREDDITS_BY_TOPIC } from "../../graphql/queries";
import toast from "react-hot-toast";

interface FormData {
    title: string;
    body: string;
    image: string;
    subreddit: string;
}

export default function PostBox({ subreddit_id }: { subreddit_id: string; }) {
    const { data: session } = useSession();
    const [imageBoxOpen, setImageBoxOpen] = useState<boolean>(false);

    const [addPost] = useMutation(ADD_POST, {
        refetchQueries: [
            GET_POSTS, 'getPosts'
        ]
    });
    const [addSubreddit] = useMutation(ADD_SUBREDDIT);

    const {
        register,
        handleSubmit,
        watch
      } = useForm<FormData>({  defaultValues: { subreddit: subreddit_id } });

    if (!session) {
        return <></>;
    }

    const isGoodToSubmit = !!watch('title') && !!watch('subreddit');

    const onSubmit = handleSubmit(async (formData) => {
        const notification = toast.loading('Posting 🚀');

        try {
            // query for subreddit
            const {
                data: { subredditsByTopic }
            } = await client.query({
                query: GET_SUBREDDITS_BY_TOPIC,
                variables: {
                    topic: formData.subreddit
                }
            });

            let [subreddit] = subredditsByTopic;

            if (!subreddit) {
                // create subreddit

                const { data: { insertSubredditByTopic: newSubreddit } } = await addSubreddit({
                    variables: {
                        topic: formData.subreddit
                    }
                });

                subreddit = newSubreddit;
            }

            const image = formData.image || '';

            const { data: { insertPost: newPost } } = await addPost({
                variables: {
                    title: formData.title,
                    body: formData.body,
                    subreddit_id: subreddit?.id || '',
                    username: session.user?.name,
                    image
                }
            });

            console.log('New post', newPost);

            toast.success('Posted successfully 😊', {
                id: notification
            });
        } catch (error) {
            toast.error('Whoops, something went wrong 😕', {
                id: notification
            });
        }
    });

    return (
        <div className="flex space-x-1 border border-gray-300 rounded-xl bg-white">
            <div className="p-4 pr-0 flex-shrink-0">
                <Avatar />
            </div>

            <form className="p-4 flex flex-1 flex-col space-y-2" onSubmit={onSubmit}>
                <div className="flex flex-1 items-center space-x-3">
                    <input type="text" placeholder={`Let's post something${subreddit_id && ' here'}...`}
                        className="bg-blue-50 p-2 outline-none rounded-md flex-1 border hover:border-orange-400"
                        {...register('title', { required: true })}
                    />

                    {!!watch('title') && (
                        <>
                            <PhotoIcon className={`h-6 text-gray-300 cursor-pointer ${imageBoxOpen && 'text-blue-500'}`} onClick={() => setImageBoxOpen(!imageBoxOpen)} />
                            {/* <LinkIcon className="h-6 text-gray-300" /> */}
                        </>
                    )}
                </div>

                { !!watch('title') && (
                    <>
                        <div className="flex flex-col py-2 space-y-3">
                            <div className="flex items-center">
                                <textarea placeholder="Post content..." {...register('body')} className="flex-1 bg-blue-50 p-2 rounded-md outline-none" />
                            </div>

                            {
                                !subreddit_id && 
                                <div className="flex items-center">
                                    <input type="text" placeholder="Subreddit e.g. Next.js" {...register('subreddit', { required: true })} className="rounded-md flex-1 bg-blue-50 p-2 outline-none" />
                                </div>
                            }

                            {imageBoxOpen && (
                                <div className="flex items-center">
                                    <input type="text" placeholder="Image Url" {...register('image')} className="flex-1 bg-blue-50 p-2 rounded-md outline-none" />
                                </div>
                            )}                        
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-full bg-orange-400 p-2 text-white disabled:bg-gray-300"
                            disabled={!isGoodToSubmit}>
                            Create Post
                        </button>
                    </>
                )}
            </form>
        </div>
    )
}