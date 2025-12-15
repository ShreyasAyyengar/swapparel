import Badge12 from "@swapparel/shad-ui/components/shadcn-studio/badge/badge-12";
import type { Dispatch, SetStateAction } from "react";

export default function FilterHashtags({
  hashtagList,
  setHashtagList,
  handleFilterSubmit,
}: {
  hashtagList: string[];
  setHashtagList: Dispatch<SetStateAction<string[]>>;
  handleFilterSubmit: () => void;
}) {
  // const [hashtagList, setHashtagList] = useState<string[]>([]);

  const addHashtag = (data: FormData) => {
    let newHashtag: string = data.get("hashtag") as string;

    if (newHashtag[0] !== "#") {
      newHashtag = `#${newHashtag}`;
    }
    if (hashtagList.find((loopedPost) => loopedPost === newHashtag) || newHashtag === "#") return;

    // console.log(hashtagList);
    setHashtagList((prev) => [...prev, newHashtag]);
    // console.log(hashtagList);
    handleFilterSubmit();
  };

  const handleDelete = (hashtag: string) => {
    // const newArray = hashtagList.filter((hashtagItem) => hashtagItem !== hashtag);
    setHashtagList((prevList) => prevList.filter((hashtagItem) => hashtagItem !== hashtag));
    handleFilterSubmit();
  };

  const hashtagBadges = hashtagList.map((hashtag) => <Badge12 key={hashtag} name={hashtag} handleDelete={handleDelete} />);

  return (
    <>
      <p className="mb-2 font-bold">HashTags</p>
      <div className="mb-2 w-auto border-1" />
      <form action={addHashtag} className={"mb-2"}>
        <input
          type="text"
          placeholder="e.g. #spooky"
          aria-label="Search Hashtags"
          name="hashtag"
          className="w-full max-w-xl rounded-full border border-foreground bg-secondary-foreground p-1 pl-2 placeholder-gray-400 transition duration-200 focus:border-accent focus:outline-none focus:ring-accent"
        />
      </form>
      <div className={"flex flex-wrap gap-1"}>{hashtagList.length > 0 && hashtagBadges}</div>
    </>
  );
}
