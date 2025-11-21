import {oc} from "@orpc/contract";
import {z} from "zod";

export const r2WriteContract = {
    uploadPhoto : oc
    .input(
        z.object({
            fileName: z.string().min(1, "Please select a photo"),
            fileType: z.string().min(1, "Invalid email type"),
        })
    )
    .output(
        z.object({
            uploadUrl: z.string(),
            publicUrl: z.string(),
            key: z.string(),
        })
    )
    .errors({
        INVALID_CREDENTIALS: {},
        INTERNAL_SERVER_ERROR: {},
    }),
};
