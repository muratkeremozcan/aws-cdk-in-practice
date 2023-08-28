const {promisify} = require('util')
const awscred = require('awscred')
require('dotenv').config()

let initialized = false

/**
 * Loads the environment variables from the .env file,
 * resolves the AWS credentials using the `awscred` module
 * and puts the access key and secret into the environment variables.
 */
export const initCredentials = async (): Promise<
  {credentials: AWS.Credentials; region: string} | undefined
> => {
  if (initialized) {
    return
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
