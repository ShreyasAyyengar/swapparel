export default function ProfileHeaderSkeleton() {
  return (
    <div className="mt-5 grid w-1/2 grid-cols-1 justify-items-center overflow-hidden rounded-full border border-secondary bg-primary p-5 px-10 text-foreground md:grid-cols-2 md:justify-between md:justify-items-stretch">
      {/* Avatar */}
      <div className="mb-5 h-[100px] w-[100px] animate-pulse rounded-full bg-muted md:mb-0" />

      <div className="flex flex-col items-center gap-3 md:items-end">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />

        <div className="flex w-3/4 flex-col gap-2 rounded-md px-2 py-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
