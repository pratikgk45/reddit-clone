'use client';

import Feed from '@/Components/Feed';
import PostBox from '@/Components/PostBox';
import TopCommunities from '@/Components/TopCommunities';

export default function Home() {
  return (
    <div className="my-7 mx-auto max-w-5xl flex flex-col space-y-2">
      <PostBox />

      <div className="flex space-x-2">
        <Feed />

        <TopCommunities />
      </div>
    </div>
  );
}
