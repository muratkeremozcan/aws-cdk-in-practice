#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import {FinalStack} from '../lib/final-stack'

const app = new cdk.App()

if (['ONLY_DEV'].includes(process.env.CDK_MODE || '')) {
  new FinalStack(app, `FinalStack-${process.env.NODE_ENV || ''}`, {
    env: {region: 'us-west-1', account: process.env.CDK_DEFAULT_ACCOUNT},
  })
}

if (['ONLY_PROD'].includes(process.env.CDK_MODE || '')) {
  new FinalStack(app, `FinalStack-${process.env.NODE_ENV || ''}`, {
    env: {region: 'us-west-1', account: process.env.CDK_DEFAULT_ACCOUNT},
  })
}

// const envName = process.env.NODE_ENV || 'Development'

// new FinalStack(app, `FinalStack-${envName}`, {
//   env: {
//     region: 'us-west-1',
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//   },
// })
