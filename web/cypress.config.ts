import {defineConfig} from 'cypress'
import tasks from './cypress/support/tasks'
import {getEnvironmentConfig} from '../infrastructure/lib/get-env-config'
import {domain_name} from '../config.json'
import {initCredentials} from './cypress/support/init-credentials'
import {getBaseUrl} from './cypress/support/get-base-url'
import AWS from 'aws-sdk'

require('dotenv').config()

const {backend_subdomain, deployment} = getEnvironmentConfig(
  process.env.NODE_ENV,
)
const apiUrl = `https://${backend_subdomain}.${domain_name}`
console.log({deployment, apiUrl})

export default defineConfig({
  viewportWidth: 1380,
  viewportHeight: 1080,
  retries: {
    runMode: 2,
    openMode: 0,
  },

  e2e: {
    async setupNodeEvents(on, config) {
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

      tasks(on)

      return config
    },
  },
  env: {
    ...process.env,
    apiUrl,
    ENVIRONMENT: deployment,
  },
})
