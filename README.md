# S3-presignedURL-Lambda-APIGateway-setup
This is the template to setup S3 presigned URL, Lambda and API Gatway

To Deploy with a new bucket set an env name such as this:

export BUCKET_NAME=my-custom-audio-bucket
serverless deploy --stage=prod

Smoke-test:
export API_URL=$(serverless info --verbose \
  | grep POST | awk '{print $3}')
curl -X POST "$API_URL/generate-upload-url" \
  -H "Content-Type: application/json" \
  -d '{"fileExt":"wav","contentType":"audio/wav"}'

