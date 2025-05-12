# S3 Pre-Signed URL Template

**This is the template to setup S3 pre-signed URL, Lambda, API Gateway and API Key management**

A lightweight Serverless Framework template that provisions:

* An **S3 bucket** (locked down via public access block)
* A **Lambda function** (`urlSigner`) that generates pre-signed PUT URLs for uploading audio files directly to S3
* An **HTTP API** route (`/generate-upload-url`) secured by an **API Gateway API Key**
* A **Usage Plan** with configurable quotas and throttle settings

Use this repository to spin up a secure, rate-limited upload flow in minutes, then extend it with Cognito authentication, S3 triggers, or additional processing.

---

## Repository

[https://github.com/davidbmar/S3-presignedURL-Lambda-APIGateway-setup.git](https://github.com/davidbmar/S3-presignedURL-Lambda-APIGateway-setup.git)

---

## Why Use This Repository?

* **Rapid prototyping**: Stand up all AWS resources with a single command (`sls deploy`).
* **Secure**: Requests require a valid API key enforced at the HTTP API level.
* **Rate-limited**: Usage Plan defines quotas and throttle limits.
* **Modular**: Override bucket names and stages via environment variables—no code edits needed.
* **Extensible**: Easy to layer on Cognito, S3 event notifications, or Step Functions.

---

## Prerequisites

Ensure you have:

* **AWS Account** with CLI configured (`aws configure`)
* An IAM user or role with permissions to manage:

  * CloudFormation
  * IAM (create roles/policies)
  * S3
  * Lambda
  * API Gateway (HTTP APIs + API Keys)
* **Python 3** and **boto3** (for `generate_key.py`)
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

3. **Deploy the stack**:

   ```bash
   # (Optional) Override default bucket name:
   export BUCKET_NAME=my-custom-audio-bucket

   # Deploy to 'dev' stage (use --stage=prod for production)
   sls deploy --stage=dev
   ```

   Output will list:

   * The **POST** endpoint for `/generate-upload-url`
   * The **API Key Name** (`<service>-<stage>-key`)
   * Your **Usage Plan** details (throttle, quota)

---

## Generating an API Key for a User

Once your stack is deployed, follow these steps to create and retrieve an API key tied to the Usage Plan:

1. **Set your service and stage variables** (for reuse):

   ```bash
   # Capture both stdout and stderr so 'sls info' output is parsed correctly
   export SLS_SERVICE=$(sls info --verbose 2>&1 | grep "service:" | awk '{print $2}')
   export SLS_STAGE=dev  # or prod
   ```

2. **Retrieve the Usage Plan ID**:

   ```bash
   USAGE_PLAN_ID=$(aws apigateway get-usage-plans \
     --query "items[?name=='${SLS_SERVICE}-${SLS_STAGE}'].id" \
     --output text)
   echo "Usage Plan ID: $USAGE_PLAN_ID"
   ```

   > **Note:** In this template, the Usage Plan is named `${service}-${stage}`, without the `-key` suffix.

3. **Generate a new API key** for a given user (or service):

   ```bash
   python generate_key.py myusername $USAGE_PLAN_ID
   ```

   Example output:

   ```text
   Created API Key:
     id:  abcd1234
     name: myusername-key
     value: JKLI8as9df8ASDF9as0dF==
   Attached to Usage Plan: $USAGE_PLAN_ID
   ```

   * **Save** the `value` (API Key Value) securely. This is the only time you can retrieve it.

4. **Export the API Key** for testing:

   ```bash
   export API_KEY=JKLI8as9df8ASDF9as0dF==
   ```

---

## Smoke-test the Flow

1. **Export the base URL**:

   ```bash
   # Using the ServiceEndpoint output from 'sls info'
   export API_URL=$(sls info --verbose 2>&1 | grep "ServiceEndpoint:" | awk '{print $2}')
   ```

2. **Request a pre-signed URL** with your API key:

   ```bash
   curl -v -X POST "$API_URL/generate-upload-url" \
     -H "Content-Type: application/json" \
     -H "x-api-key: $API_KEY" \
     -d '{"fileExt":"wav","contentType":"audio/wav"}'
   ```

   Expected response:

   ```json
   { "uploadUrl": "https://...", "key": "<prefix>/<timestamp>.wav" }
   ```

3. **Upload a sample file**:

   ```bash
   echo "test data" > sample.wav
   curl -v -X PUT \
     -H "Content-Type: audio/wav" \
     --data-binary @sample.wav \
     "$(jq -r .uploadUrl <<< '{"uploadUrl":"https://..."}')"
   ```

4. **Verify in S3**:

   ```bash
   aws s3 ls s3://$BUCKET_NAME/<prefix>/
   ```

---

## Cleanup

To remove all resources created:

1. **Empty the bucket**:

   ```bash
   aws s3 rm s3://$BUCKET_NAME --recursive
   ```
2. **Remove the stack**:

   ```bash
   sls remove --stage=dev
   ```

---

## Next Steps

* **Add Cognito Authentication**: Secure the API further with a JWT authorizer.
* **Trigger Transcription**: Hook S3 events to a transcription Lambda.
* **Version Control**: Tag releases and manage updates via the template repo.

Contributions and feedback welcome!

