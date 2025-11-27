import Badge13 from "@swapparel/shad-ui/components/shadcn-studio/badge/badge-13";

export default function FilterSection({ title, valueArray }: { title: string; valueArray: readonly string[] }) {
  return (
    <>
      <p className="mb-2 font-bold">{title}</p>
      <div className="mb-2 w-auto border-1" />
      <div className="mb-2">
        {valueArray.map((value) => (
          // <div className="m-2" key={value}>
          //   <Badge13 value={value} />
          // </div>
          <Badge13 value={value} key={value} />
        ))}
      </div>
    </>
  );
}
