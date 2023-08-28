import {defineConfig} from 'cypress'
import tasks from './cypress/support/tasks'
import {getEnvironmentConfig} from './lib/get-env-config'
import {domain_name} from '../config.json'

require('dotenv').config()

const {backend_subdomain} = getEnvironmentConfig('dev')
const baseUrl = `https://${backend_subdomain}.${domain_name}`
console.log({baseUrl})

export default defineConfig({
  viewportWidth: 1380,
  viewportHeight: 1080,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  projectId: '4q6j7j',

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
