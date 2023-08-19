#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import {Chapter8Stack} from '../lib'

const app = new cdk.App()

if (['ONLY_DEV'].includes(process.env.CDK_MODE || '')) {
  new Chapter8Stack(app, `Chapter8Stack-${process.env.NODE_ENV || ''}`, {
    env: {region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT},
  })
}

if (['ONLY_PROD'].includes(process.env.CDK_MODE || '')) {
  new Chapter8Stack(app, `Chapter8Stack-${process.env.NODE_ENV || ''}`, {
    env: {region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT},
  })
}
