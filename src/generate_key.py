#!/Users/dmar/.pyenv/shims/python3
import sys
import boto3
from botocore.exceptions import ClientError

def generate_api_key_for_user(username: str, usage_plan_id: str) -> str:
    """
    Creates an API Gateway API key named after `username`, enables it,
    and attaches it to the specified Usage Plan.
    Returns the key's value string.
    """
    client = boto3.client('apigateway')

    try:
        # 1. Create the API key
        response = client.create_api_key(
            name=username,
            enabled=True
        )
        api_key_id = response['id']
        api_key_value = response['value']
        print(f"Created API Key with ID: {api_key_id}")

        # 2. Attach the key to your Usage Plan
        client.create_usage_plan_key(
            usagePlanId=usage_plan_id,
            keyId=api_key_id,
            keyType='API_KEY'
        )
        print(f"Attached API Key to Usage Plan {usage_plan_id}")

        return api_key_value

    except ClientError as e:
        print(f"Error: {e.response['Error']['Message']}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python create_api_key.py <username> <usage_plan_id>")
        sys.exit(1)

    username = sys.argv[1]
    usage_plan_id = sys.argv[2]

    key_value = generate_api_key_for_user(username, usage_plan_id)
    print("\n=== API Key Value ===")
    print(key_value)

