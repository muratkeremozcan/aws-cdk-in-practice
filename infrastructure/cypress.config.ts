import {defineConfig} from 'cypress'
import tasks from './cypress/support/tasks'
import {getEnvironmentConfig} from './lib/get-env-config'
import {domain_name} from '../config.json'

require('dotenv').config()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const {backend_subdomain} = getEnvironmentConfig(process.env.NODE_ENV!)
const baseUrl = `https://${backend_subdomain}.${domain_name}`
console.log({baseUrl})

export default defineConfig({
  viewportWidth: 1380,
  viewportHeight: 1080,
  retries: {
    runMode: 2,
    openMode: 0,
  },

  e2e: {
    baseUrl,
    setupNodeEvents(on, config) {
      tasks(on)

      return config
    },
  },
  env: {
    ...process.env,
  },
})
