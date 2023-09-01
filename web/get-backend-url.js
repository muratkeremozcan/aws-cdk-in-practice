const fs = require('fs')
const path = require('path')

const envFilePath = path.resolve(__dirname, '../infrastructure/.env')

// Read the .env file and convert it to an object
const envFileContent = fs.readFileSync(envFilePath, 'utf-8')
const envVars = envFileContent.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=')
  acc[key] = value
  return acc
}, {})

// Get the ApiGatewayUrl and deployment from the .env file
const backendURL = envVars.ApiGatewayUrl
const deployment = envVars.deployment
console.log(`Using backend URL: ${backendURL}`)
console.log(`Using ENVIRONMENT: ${deployment}`)

// Write to .env file
fs.writeFileSync(
  '.env',
  `REACT_APP_BACKEND_URL=${backendURL}\nENVIRONMENT=${deployment}\n`,
)

console.log(`Configured for backend URL: ${backendURL}`)
console.log(`Configured for ENVIRONMENT: ${deployment}`)
