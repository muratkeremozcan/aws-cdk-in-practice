// reads the manifest.json and the stack template file from the cdk.out directory,
// gets the outputs from the template, and writes them to the .env file.
// Run this script after you deploy your CDK app.
const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')

// Set the AWS region
AWS.config.update({region: 'us-east-1'})
AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'cdk'})

// Create the CloudFormation service object
const cfn = new AWS.CloudFormation()

// pass the stack name in or read it from stac-name.txt
const stackNameFilePath = path.resolve(__dirname, './bin/stack-name.txt')
const stackName = process.argv[2] || fs.readFileSync(stackNameFilePath, 'utf-8')

if (!stackName) {
  console.error('Error: Please provide the stack name as an argument.')
  process.exit(1)
}

// Get the stack details
cfn.describeStacks({StackName: stackName}, (err, data) => {
  if (err) {
    console.error(`Error: ${err.message}`)
    return
  }

  // Extract the outputs from the stack details
  const outputs = data.Stacks[0].Outputs

  // Path to the .env file
  const envFilePath = path.resolve(__dirname, '.env')

  // Convert the outputs to a .env file format
  const envFileContent = outputs
    .map(output => `${output.OutputKey}=${output.OutputValue}`)
    .join('\n')

  fs.writeFileSync(envFilePath, envFileContent)

  console.log(`Wrote environment variables to ${envFilePath}`)
  console.log(envFileContent)
})
