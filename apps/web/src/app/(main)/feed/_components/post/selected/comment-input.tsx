import type {internalPostSchema} from "@swapparel/contracts";
import {useMutation} from "@tanstack/react-query";
import {useState} from "react";
import type {z} from "zod";
import {webClientORPC} from "../../../../../../lib/orpc-web-client";

export default function CommentInput({post, sentence}: { post: z.infer<typeof internalPostSchema>; sentence: string }) {
    const [writingComment, setWritingComment] = useState(false);

    const addCommentMutation = useMutation(
        webClientORPC.posts.createNewComment.mutationOptions({
            onSuccess: (data) => {
                window.location.reload();
            },
        })
    );

    const submitComment = (comment: string) => {
        addCommentMutation.mutateAsync({
            postId: post._id,
            comment,
        });
    };

    return (
        <form
            action={(e) => {
                const comment = e.get("comment-input") as string;
                if (!comment) return;
                submitComment(comment);
            }}
        >
            <p
                className="cursor-pointer text-xs underline"
                onClick={() => setWritingComment(true)}
                onKeyDown={(e) => e.key === "Enter" && setWritingComment(true)}
            >
                {sentence}
            </p>
            {writingComment && (
                <input
                    autoComplete="off"
                    name="comment-input"
                    className="mt-2 w-full resize-none rounded-md border-2 border-secondary px-3 py-2 align-top leading-relaxed transition-colors focus:border-secondary"
                    placeholder="Is this washer safe?"
                />
            )}
        </form>
    );
}
