import type { internalPostSchema } from "@swapparel/contracts";
import { Button } from "@swapparel/shad-ui/components/button";
import type { z } from "zod";
import TradingImage from "./trade-image";

type trading = {
  post: z.infer<typeof internalPostSchema>;
  onClick: () => void;
};

export default function TradingBox({ post, onClick }: trading) {
  return (
    <div className="fixed inset-0 z-2 flex items-center justify-center">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onMouseDown={onClick} />
      <div className="relative max-h-[90vh] w-1/2 items-center overflow-y-auto rounded-2xl border border-secondary bg-accent p-10 pt-5 text-foreground">
        <p className={"mb-5 flex justify-center font-light text-2xl"}>TRADING POST</p>
        <div className={"grid w-full grid-cols-1 items-center gap-5 xl:grid-cols-2"}>
          {/* FIRST IMAGE */}
          <TradingImage images={post.images} />
          {/* SECOND IMAGE */}
          <div className={"flex min-h-150 rounded-md border-2 border-secondary"}>
            <p>Choose your post</p>
          </div>

          {/*<TradingImage images={post.images} />*/}
        </div>
        <Button className={"mt-5 flex w-full cursor-pointer items-center justify-center"}>SUBMIT</Button>
      </div>
    </div>
  );
}
