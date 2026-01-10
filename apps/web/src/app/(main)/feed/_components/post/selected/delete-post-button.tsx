import { Button } from "@swapparel/shad-ui/components/button";
import { useMutation } from "@tanstack/react-query";
import { webClientORPC } from "../../../../../../lib/orpc-web-client";

export default function DeletePostButton({ onClick, postId }: { onClick: () => void; postId: string }) {
  const deletePostMutation = useMutation(
    webClientORPC.posts.deletePost.mutationOptions({
      onSuccess: (data) => {
        // window.location.reload();
      },
    })
  );

  const deletePost = async (id: string) => {
    await deletePostMutation.mutateAsync({ id });
  };

  return (
    <div className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 flex h-40 w-1/3 flex-col items-center justify-center rounded-md bg-black/60">
      <Button className="w-[90%] cursor-pointer rounded-t-md rounded-b-none bg-primary hover:bg-red-800" onClick={() => deletePost(postId)}>
        DELETE POST
      </Button>
      <Button className="w-[90%] cursor-pointer rounded-t-none rounded-b-md bg-accent-900 text-accent hover:bg-accent-800" onClick={onClick}>
        Cancel
      </Button>
    </div>
  );
}
