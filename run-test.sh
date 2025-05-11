#!/bin/bash

export API_URL=$(
  serverless info --verbose 2>&1 \
    | grep 'HttpApiUrl:' \
    | awk '{print $2}'
)
echo "API_URL is: $API_URL"


curl -v -X POST "$API_URL/generate-upload-url" \
  -H "Content-Type: application/json" \
  -d '{"fileExt":"wav","contentType":"audio/wav"}'

