import AWS from 'aws-sdk'
const {promisify} = require('util')
const awscred = require('awscred')

require('dotenv').config()

let initialized = false

/**
 * Loads the environment variables from the .env file,
 * resolves the AWS credentials using the `awscred` module
 * and puts the access key and secret into the environment variables.
 */
const initCredentials = async (): Promise<
  {credentials: AWS.Credentials; region: string} | undefined
> => {
  if (initialized) {
    return
  }

  const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_SESSION_TOKEN,
    AWS_REGION,
  } = process.env

  if (
    AWS_ACCESS_KEY_ID &&
    AWS_SECRET_ACCESS_KEY &&
    AWS_SESSION_TOKEN &&
    AWS_REGION
  ) {
    console.log('Using AWS credentials from environment variables')
    initialized = true
    const credentials = new AWS.Credentials(
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      AWS_SESSION_TOKEN,
    )
    AWS.config.update({region: AWS_REGION, credentials})
    return {credentials, region: AWS_REGION}
  }

  const {credentials, region} = await promisify(awscred.load)()

  process.env.AWS_ACCESS_KEY_ID = credentials.accessKeyId
  process.env.AWS_SECRET_ACCESS_KEY = credentials.secretAccessKey
  process.env.AWS_REGION = region
  process.env.AWS_SESSION_TOKEN = credentials.sessionToken

  console.log('AWS credential loaded')

  initialized = true

  return {credentials, region}
}

/**
 * Gets the Base URL from the CloudFormation stack outputs.
 *
 * @param {string} deployment - The deployment environment (e.g. 'dev', 'prod').
 * @returns {Promise<string | null>} A promise that will resolve to the Base URL if found, or `null` otherwise.
 */
const getBaseUrl = async (deployment: string): Promise<string | null> => {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'cdk'})

  const cloudformation = new AWS.CloudFormation()

  return new Promise((resolve, reject) => {
    const stackName = `FinalStack-${deployment}`

    cloudformation.describeStacks({StackName: stackName}, (err, data) => {
      if (err) {
        console.error(err, err.stack)
        reject(err)
        return
      }

      if (!data.Stacks) {
        console.error('No stacks found')
        resolve(null)
        return
      }

      const outputs = data.Stacks[0].Outputs
      if (!outputs) {
        console.error('No outputs found')
        resolve(null)
        return
      }

      const output = outputs.find(o => o.OutputKey === 'FrontendUrl')
      if (!output) {
        console.error('No output found with key FrontendUrl')
        resolve(null)
        return
      }

      const baseUrl = output.OutputValue
      console.log({baseUrl})

      resolve(baseUrl!)
    })
  })
}

export const configAWSForLocal = async (config, deployment) => {
  const awsConfig = await initCredentials()

  if (awsConfig) {
    AWS.config.update({
      accessKeyId: awsConfig.credentials.accessKeyId,
      secretAccessKey: awsConfig.credentials.secretAccessKey,
      sessionToken: awsConfig.credentials.sessionToken,
      region: awsConfig.region,
    })
  } else {
    console.error('Could not initialize AWS credentials')
  }

  const baseUrl = await getBaseUrl(deployment)
  if (baseUrl) {
    config.baseUrl = baseUrl
  } else {
    console.error('Could not get base URL')
  }
}

// import dotenv from 'dotenv'
// import { fromIni } from '@aws-sdk/credential-providers'

// /**
//  * Retrieves AWS Credentials for a given AWS profile.
//  *
//  * @param {string} profile - AWS Profile name to fetch the credentials for.
//  * @returns {Promise<AwsCredentialIdentity>} Resolved AWS credentials for the provided profile. */
// const getAWSCredentials = async (profile: string) => {
//   const credentialsProvider = fromIni({ profile })

//   // Resolve the credentials using the provider
//   const credentials = await credentialsProvider()

//   return credentials
// }

// // Load the environment files
// dotenv.config()

// let initialized = false

// /**
//  * Initializes AWS credentials and sets them as environment variables.
//  * It uses the provided profile or defaults to 'root'.
//  *
//  * @param {string} [profile='root'] - AWS Profile name. */
// export const initCredentials = async (profile = 'root'): Promise<void> => {
//   if (initialized) {
//     return
//   }

//   const { accessKeyId, secretAccessKey, sessionToken } =
//     await getAWSCredentials(profile)

//   process.env.AWS_ACCESS_KEY_ID = accessKeyId
//   process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey
//   process.env.AWS_SESSION_TOKEN = sessionToken

//   initialized = true
// }
