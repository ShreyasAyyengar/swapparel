import {oc} from "@orpc/contract";
import {z} from "zod";

export const r2ReadContract = z.object({
    imageToDisplay: z.array(z.url())
    
});

