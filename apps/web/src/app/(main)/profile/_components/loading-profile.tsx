import PostsSectionSkeleton from "./post-panel-skeleton";
import ProfileHeaderSkeleton from "./profile-header-skeleton";

export default function LoadingProfile() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <ProfileHeaderSkeleton />
      <PostsSectionSkeleton />
    </div>
  );
}
