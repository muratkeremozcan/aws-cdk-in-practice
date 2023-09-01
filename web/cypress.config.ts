import {defineConfig} from 'cypress'
import tasks from './cypress/support/tasks'
import {configAWSForLocal} from './cypress/support/config-aws'

require('dotenv').config()

export default defineConfig({
  viewportWidth: 1380,
  viewportHeight: 1080,
  retries: {
    runMode: 2,
    openMode: 0,
  },

  e2e: {
    async setupNodeEvents(on, config) {
      if (!process.env.CI) {
        await configAWSForLocal(config, process.env.ENVIRONMENT)
      }

      tasks(on)

      return config
    },
  },
  env: {
    ...process.env,
    ENVIRONMENT: process.env.ENVIRONMENT,
  },
})
