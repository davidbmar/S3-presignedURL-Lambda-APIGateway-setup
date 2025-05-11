#!/bin/bash

# (If you used a custom bucket name stack, supply the same env var & stage)
#export BUCKET_NAME=my-custom-audio-bucket
export BUCKET_NAME=my-custom-audio-bucket
serverless remove --stage=dev

