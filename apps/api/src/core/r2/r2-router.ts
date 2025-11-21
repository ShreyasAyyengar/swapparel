import { r2WriteContract } from "@swapparel/contracts";
import { r2ReadContract } from "@swapparel/contracts";
import {z} from "zod";
import { publicProcedure } from "../../libs/orpc";
import { PostCollection } from "../post/post-schema";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  //endpoint: process.env.ENPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

async function generateUploadUrl(userId: string, fileName: string, fileType: string) {
  const key = `${userId}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5min timer
  const publicUrl = `https://${process.env.CLOUDFLARE_R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;

  return { uploadUrl, publicUrl, key };
}
