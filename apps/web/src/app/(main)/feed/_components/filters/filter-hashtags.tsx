import { Checkbox } from "@swapparel/shad-ui/components/checkbox";
import Badge12 from "@swapparel/shad-ui/components/shadcn-studio/badge/badge-12";
import { useFilterStore } from "./filter-store";

export default function FilterHashtags({
  hashtagList,
  setHashtagList,
  setOnlyHashtag,
  onlyHashtag,
}: {
  hashtagList: string[];
  setHashtagList: (values: string[]) => void;
  setOnlyHashtag: (only: boolean) => void;
  onlyHashtag: boolean;
}) {
  // const [hashtagList, setHashtagList] = useState<string[]>([]);

  const { filteredHashtags, setFilteredHashtags, filteredHashtagOnly, setFilteredHashtagOnly } = useFilterStore();

  const addHashtag = (data: FormData) => {
    let newHashtag: string = data.get("hashtag") as string;

    if (newHashtag[0] !== "#") newHashtag = `#${newHashtag}`;
    if (hashtagList.find((loopedPost) => loopedPost === newHashtag) || newHashtag === "#") return;
    setFilteredHashtags([...filteredHashtags, newHashtag]);
  };

  const handleDelete = (hashtag: string) => {
    const newHashtags = filteredHashtags.filter((hashtagItem) => hashtagItem !== hashtag);
    setFilteredHashtags(newHashtags);
  };

  const handleCheck = (checked: boolean) => {
    setFilteredHashtagOnly(checked);
  };

  const hashtagBadges = filteredHashtags.map((hashtag) => <Badge12 key={hashtag} name={hashtag} handleDelete={handleDelete} />);

  return (
    <>
      <p className="mb-2 font-bold">
        HashTags <span className="font-normal text-xs"> | Match ONLY</span>
        <Checkbox className={"ml-2"} checked={filteredHashtagOnly} onCheckedChange={handleCheck} />
      </p>
      <div className="mb-2 w-auto border" />
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
