import {defineConfig} from 'cypress'
import tasks from './cypress/support/tasks'
import {getEnvironmentConfig} from '../infrastructure/lib/get-env-config'
import {domain_name} from '../config.json'
require('dotenv').config()

const {backend_subdomain, frontend_subdomain} = getEnvironmentConfig(
  process.env.NODE_ENV!,
)
const apiUrl = `https://${backend_subdomain}.${domain_name}`
const baseUrl = `https://${frontend_subdomain}.${domain_name}`

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
    apiUrl,
    ...process.env,
  },
})
