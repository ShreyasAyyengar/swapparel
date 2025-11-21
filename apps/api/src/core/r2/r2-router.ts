import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../env";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export async function generateUploadUrl(userId: string, fileName: string, fileType: string) {
  const key = `${userId}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5min timer
  const publicUrl = `https://${process.env.CLOUDFLARE_R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;

  return { uploadUrl, publicUrl, key };
}
