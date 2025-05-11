mkdir -p src
cat > src/urlSigner.js << 'EOF'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({});

export const handler = async (event) => {
  const { fileExt = "wav", contentType = "audio/wav" } = JSON.parse(event.body || "{}");
  const timestamp = Date.now();
  const key = `uploads/${timestamp}.${fileExt.replace(/^\./, '')}`;

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
EOF

