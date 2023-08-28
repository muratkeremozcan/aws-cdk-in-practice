import AWS from 'aws-sdk'

/**
 * Gets the Base URL from the CloudFormation stack outputs.
 *
 * @param {string} deployment - The deployment environment (e.g. 'dev', 'prod').
 * @returns {Promise<string | null>} A promise that will resolve to the Base URL if found, or `null` otherwise.
 */
export const getBaseUrl = async (
  deployment: string,
): Promise<string | null> => {
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
