import {oc} from "@orpc/contract";
import {z} from "zod";

export const uploadUrlContract = {
    uploadPhoto : oc
    .input(
        z.object({
            fileName: z.string().min(1),
            fileType: z.string().min(1),
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
        NOT_FOUND: {},
        INTERNAL_SERVER_ERROR: {},
    }),
};
