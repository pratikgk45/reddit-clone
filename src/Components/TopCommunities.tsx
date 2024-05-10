'use client';

import { useQuery } from "@apollo/client";
import { GET_SUBREDDITS } from "../../graphql/queries";
import SubredditRow from "./SubredditRow";
import Loader from "./Loader";

export default function TopCommunities() {
    const { data } = useQuery(GET_SUBREDDITS);

    let content;
    if (!data) {
        content = (
            <div className="flex w-full items-center justify-center p-10 text-xl">
                <Loader />
            </div>
        )
    } else {
        let subreddits: Subreddit[] = data.subredditList ?? [];
        subreddits = [...subreddits].sort((a, b) => (a.post.length < b.post.length ? 1: -1));

        content = subreddits.map((subreddit, i) => <SubredditRow key={i} index={i} subreddit={subreddit}/>);
    }

    return (
        <div className="hidden h-fit min-w-[300px] rounded-md border border-gray-300 bg-white lg:inline">
            <p className="text-sm mb-1 px-3 py-2 font-semibold">
                Top Communities
            </p>

            <div className="flex flex-col space-y-2">
                {content}
            </div>
        </div>
    )
}