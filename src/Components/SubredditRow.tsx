import Link from "next/link";
import Avatar from "./Avatar";

export default function SubredditRow({ subreddit, index }: { subreddit: Subreddit; index: number }) {
    return (
        <div className="flex items-center space-x-4 border-t bg-white px-4 py-2 last:rounded-b">
            <p className="font-semibold">{index + 1}</p>
            <Avatar seed={subreddit.topic} />
            <div className="flex flex-col flex-1">
                <p className="font-semibold">r/{subreddit.topic}</p>
                <div className="text-gray-400">{subreddit.post.length} Posts</div>
            </div>
            <Link href={`/subreddit/${subreddit.topic}`}>
                <button className="bg-blue-400 px-3 rounded-3xl text-white">View</button>
            </Link>
        </div>
    );
}