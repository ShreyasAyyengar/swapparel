import { DetectModerationLabelsCommand, RekognitionClient } from "@aws-sdk/client-rekognition";
import { write } from "bun";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { env } from "../../env";
import { R2 } from "../../libs/r2-client";

export const convertToJpeg = async (fileBuffer: Buffer) => Buffer.from(await sharp(fileBuffer).jpeg({ quality: 100 }).toBuffer());

export const uploadToR2 = async (postId: string, fileBuffer: Buffer, index: number) => {
  const type = await fileTypeFromBuffer(fileBuffer);

  if (!type) {
    throw new Error("Unsupported file type");
  }

  const key = `${postId}/${index}.${type.ext}`;

  await write(
    R2.file(key),
    new Blob([fileBuffer], {
      type: type.mime,
    })
  );

  return key;
};

const rekognition = new RekognitionClient({
  region: "us-west-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET,
  },
});

export async function moderateImage(fileBuffer: Buffer) {
  const command = new DetectModerationLabelsCommand({
    Image: {
      Bytes: fileBuffer,
    },
    MinConfidence: 70,
  });

  const result = await rekognition.send(command);

  return (
    result.ModerationLabels?.map((label) => ({
      name: label.Name,
      parentName: label.ParentName,
      confidence: label.Confidence,
    })) ?? []
  );
}

type ModerationLabel = {
  name?: string;
  parentName?: string;
  confidence?: number;
};

const BLOCK_RULES: Record<string, number> = {
  // Explicit
  "Explicit Nudity": 70,
  "Exposed Male Genitalia": 70,
  "Exposed Female Genitalia": 70,
  "Exposed Buttocks or Anus": 70,
  "Exposed Female Nipple": 70,
  "Explicit Sexual Activity": 70,
  "Sex Toys": 80,

  // Violence / disturbing
  "Graphic Violence": 80,
  "Weapon Violence": 80,
  "Physical Violence": 80,
  "Self-Harm": 70,
  "Blood & Gore": 75,
  Corpses: 70,

  // Hate
  "Hate Symbols": 70,
  "Nazi Party": 70,
  "White Supremacy": 70,
  Extremist: 70,

  // Optional family-friendly blocks
  "Obstructed Female Nipple": 90,
  "Obstructed Male Genitalia": 90,
  "Middle Finger": 90,
};

export function getBlockingLabel(labels: ModerationLabel[]) {
  return labels.find((label) => {
    if (!label.name) return false;

    const threshold = BLOCK_RULES[label.name];

    return threshold !== undefined && (label.confidence ?? 0) >= threshold;
  });
}
