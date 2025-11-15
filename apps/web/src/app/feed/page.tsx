import Post from "./_components/post";
import { data } from "./_data/data";

export default function FeedPage() {
  return (
    <>
      <Post postData={data} />
      <Post postData={data} />
      <Post postData={data} />
      <Post postData={data} />
      <Post postData={data} />
      <Post postData={data} />
    </>
  );
}
