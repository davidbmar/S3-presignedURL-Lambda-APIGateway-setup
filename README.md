# S3 Pre-Signed URL Template

**This is the template to setup S3 presigned URL, Lambda and API Gateway**

A lightweight Serverless Framework template that provisions:

* An **S3 bucket** (locked down via public access block)
* A **Lambda function** (`urlSigner`) that generates pre-signed PUT URLs for uploading audio files directly to S3
* An **HTTP API** route (`/generate-upload-url`) to invoke the Lambda

Use this repository to spin up a secure, disposable upload flow in minutes, then extend it with Cognito authentication, S3 event triggers, or additional processing.

---

## Repository

[https://github.com/davidbmar/S3-presignedURL-Lambda-APIGateway-setup.git](https://github.com/davidbmar/S3-presignedURL-Lambda-APIGateway-setup.git)

---

## Why Use This Repository?

* **Rapid prototyping**: Stand up all AWS resources with a single command (`sls deploy`).
* **Least-privilege**: IAM policies scoped to only allow `PutObject` on the designated bucket.
* **Modular design**: Parameterize bucket names and stages (`dev`, `prod`) without editing code.
* **Extensible**: Base flow can be extended with AWS Cognito, S3 event notifications, or Step Functions.

---

## Prerequisites

Ensure you have:

* **AWS Account** with CLI configured (`aws configure`)
* An IAM user or role with permissions to manage:

  * CloudFormation
  * IAM (create roles/policies)
  * S3
  * Lambda
  * API Gateway (HTTP APIs)
* **Node.js** (≥16.x) and **npm**
* **Serverless Framework CLI** (`npm install -g serverless`)
* **Git** (to clone this repository)

---

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/davidbmar/S3-presignedURL-Lambda-APIGateway-setup.git
   cd S3-presignedURL-Lambda-APIGateway-setup
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Deploy with a new bucket**:

   ```bash
   export BUCKET_NAME=my-custom-audio-bucket
   serverless deploy --stage=prod
   ```

4. **Smoke-test**:

   ```bash
   export API_URL=$(serverless info --verbose \
     | grep POST | awk '{print $3}')
   curl -X POST "$API_URL/generate-upload-url" \
     -H "Content-Type: application/json" \
     -d '{"fileExt":"wav","contentType":"audio/wav"}'
   ```

Expected response:

```json
{ "uploadUrl": "https://...", "key": "uploads/1234567890.wav" }
```

---

## Cleanup

To remove all resources created by this template:

1. **Empty the bucket** (if non-empty):

   ```bash
   aws s3 rm s3://$BUCKET_NAME --recursive
   ```

2. **Tear down the stack**:

   ```bash
   serverless remove --stage=prod
   ```

---

## Next Steps

* **Add Cognito Authentication**: Secure the API with a JWT authorizer so only signed-in users can obtain URLs.
* **Trigger Transcription**: Configure S3 event notifications to invoke a second Lambda for transcription.
* **Version Control**: Tag releases (`v1.0.0` for bare flow, `v1.1.0` for Cognito) and pull in upstream updates.

Feel free to open issues or submit pull requests to improve this template!

