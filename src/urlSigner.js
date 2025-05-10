import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({});

export const handler = async (event) => {

  //const { fileExt = "wav", contentType = "audio/wav" } = JSON.parse(event.body || "{}");
  // Read extension + MIME type from client
  const { fileExt, contentType } = JSON.parse(event.body || "{}");
  // Basic validation: ensure we got something reasonable
  if (!fileExt || !contentType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing fileExt or contentType" }),
    };
  }
  // Optional: whitelist common audio types
  const allowed = ["wav", "mp3", "webm", "ogg", "flac", "m4a"];
  if (!allowed.includes(fileExt.toLowerCase())) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Extension '${fileExt}' not allowed.` }),
    };
  }

  const timestamp = Date.now();
  //const key = `uploads/${timestamp}.${fileExt.replace(/^\./, '')}`;
  const extSanitized = fileExt.replace(/^\./, "").toLowerCase();
  const key = `uploads/${timestamp}.${extSanitized}`;

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadUrl, key }),
  };
};
