# .env
ApiGatewayUrl=https://gns364i761.execute-api.us-east-1.amazonaws.com/setup-optic/
deployment=setup-optic # this could be a temp branch, or stage
# create-openapi.sh

# Load .env variables
set -a
source .env
set +a

# Extract the REST API id from the ApiGatewayUrl
rest_api_id=$(echo $ApiGatewayUrl | cut -d '/' -f3 | cut -d '.' -f1)

echo "Rest API ID: $rest_api_id"

# Run the aws apigateway get-export command
aws apigateway get-export --rest-api-id $rest_api_id --stage-name $deployment --export-type oas30 --accepts application/yaml ./openapi.yml --profile cdk