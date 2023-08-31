#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import fs from 'fs'
import path from 'path'
import {FinalStack} from '../lib/final-stack'

const app = new cdk.App()

const branchName = process.env.NODE_ENV || 'dev'
const stackName = `FinalStack-${branchName}`

new FinalStack(app, stackName, {
  env: {region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT},
})

// Write the stack name to a file
const stackNameFilePath = path.resolve(__dirname, 'stack-name.txt')
fs.writeFileSync(stackNameFilePath, stackName)
