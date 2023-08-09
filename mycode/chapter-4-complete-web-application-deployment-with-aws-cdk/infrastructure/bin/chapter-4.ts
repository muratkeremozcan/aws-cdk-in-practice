#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'

import {Chapter4Stack} from '../lib/chapter-4-stack'

const app = new cdk.App()

new Chapter4Stack(app, 'Chapter4Stack', {})
