import {defineConfig} from 'cypress'
import tasks from './cypress/support/tasks'

require('dotenv').config()

export default defineConfig({
  projectId: '98jgjt',
  viewportWidth: 1380,
  viewportHeight: 1080,
  retries: {
    runMode: 2,
    openMode: 0,
  },

  e2e: {
    setupNodeEvents(on, config) {
      tasks(on)

      return config
    },
    baseUrl: process.env.ApiGatewayUrl,
  },
  env: {
    ...process.env,
  },
})
