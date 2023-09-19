import {defineConfig} from 'cypress'
import tasks from './cypress/support/tasks'
import {getEnvironmentConfig} from '../infrastructure/lib/get-env-config'
import {domain_name} from '../config.json'
import {configAWSForLocal} from './cypress/support/config-aws'

require('dotenv').config()

const {backend_subdomain, deployment} = getEnvironmentConfig(
  process.env.NODE_ENV || 'dev',
)
const apiUrl = `https://${backend_subdomain}.${domain_name}`
console.log({deployment, apiUrl})

export default defineConfig({
  projectId: '98jgjt',
  viewportWidth: 1380,
  viewportHeight: 1080,
  retries: {
    runMode: 2,
    openMode: 0,
  },

  e2e: {
    async setupNodeEvents(on, config) {
      if (!process.env.CI) {
        await configAWSForLocal(config, deployment)
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
