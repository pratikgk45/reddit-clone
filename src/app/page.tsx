import Feed from "@/Components/Feed";
import PostBox from "@/Components/PostBox";

export default function Home() {

  return (
    <div className="my-7 mx-auto max-w-5xl flex flex-col space-y-2">
      <PostBox />

      <div className="flex">
        <Feed />
      </div>
    </div>
  );
}
