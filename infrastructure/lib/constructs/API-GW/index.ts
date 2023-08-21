import {Construct} from 'constructs'
import {
  EndpointType,
  LambdaIntegration,
  RestApi,
  SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import {ARecord, RecordTarget} from 'aws-cdk-lib/aws-route53'
import {Table} from 'aws-cdk-lib/aws-dynamodb'
import {execSync} from 'child_process'
import {ACM} from '../ACM'
import {Route53} from '../Route53'

import config from '../../../../config.json'
import {HealthCheckLambda} from '../Lambda/healthcheck'
import {DynamoPost} from '../Lambda/post'
import {DynamoGet} from '../Lambda/get'

/**
 * Retrieve the current branch name from the local git configuration, of github actions in CI.
 * @returns {string} The current git branch name, sanitized to be DNS safe, or 'local' if the command fails.
 */
const getCurrentBranchName = (): string => {
  try {
    // Check for GitHub Actions environment variable
    if (process.env.GITHUB_REF) {
      const refArray = process.env.GITHUB_REF.split('/')
      // Assuming it's a branch, take the last part of the split string
      return refArray[refArray.length - 1].replace(/[^a-zA-Z0-9-]/g, '') // Ensure DNS safe
    }

    const branchName = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trim()

    if (branchName === 'HEAD') {
      // Handle the detached HEAD state by returning 'local'
      return 'local'
    }

    return branchName.replace(/[^a-zA-Z0-9-]/g, '') // Ensure DNS safe
  } catch (error) {
    console.error('Error getting branch name:', error)
    return 'local' // Default to 'local' or any fallback you'd prefer if git command fails
  }
}
const branchName = getCurrentBranchName()

type EnvConfig = {
  subdomain: string
  stageName: string
}

/**
 * Fetches the environment configuration based on the provided branch name and environment.
 * @param {string} bName - The branch name.
 * @param {string} [env='dev'] - The environment name. Defaults to 'dev'.
 * @returns {EnvConfig} - The corresponding environment configuration.
 */
const getConfigForEnv = (bName: string, env = 'dev'): EnvConfig => {
  const defaultConfig = {
    subdomain: config.backend_dev_subdomain,
    stageName: 'dev',
  }

  const envConfigs: Record<string, EnvConfig> = {
    Production: {
      subdomain: config.backend_subdomain,
      stageName: 'prod',
    },
    temp: {
      subdomain: `temp-${bName}`,
      stageName: 'temp',
    },
  }

  return envConfigs[env] || defaultConfig
}

// Integrating a lambda with API gateways takes a few steps.
// 1. Create the handler function
// 2. Configuring the lambda
// 3. At the API gateway, instantiating and integrating the lambda
// In SLS, you don't need step3, and your config in step2 would be in serverless.yml, instead of a separate file

interface Props {
  acm: ACM
  route53: Route53
  dynamoTable: Table
}

/**
 * Represents an API Gateway construct.
 * This construct integrates Lambdas with API Gateway for deployment.
 */
export class ApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    const {acm, route53, dynamoTable} = props

    // const backEndSubDomain =
    //   process.env.NODE_ENV === 'Production'
    //     ? config.backend_subdomain
    //     : config.backend_dev_subdomain

    // support for temp branches
    const {subdomain: backEndSubDomain, stageName} = getConfigForEnv(
      branchName,
      process.env.NODE_ENV,
    )

    const restApi = new RestApi(this, 'finalstack-rest-api', {
      restApiName: `finalstack-rest-api-${process.env.NODE_ENV || ''}`,
      description: 'serverless api using lambda functions',
      domainName: {
        certificate: acm.certificate,
        domainName: `${backEndSubDomain}.${config.domain_name}`,
        endpointType: EndpointType.REGIONAL,
        securityPolicy: SecurityPolicy.TLS_1_2,
      },
      deployOptions: {
        stageName,
      },
    })

    // Lambdas:
    const healthCheckLambda = new HealthCheckLambda(
      this,
      'health-check-lambda-api-endpoint',
      {},
    )

    const dynamoPost = new DynamoPost(this, 'dynamo-post-lambda', {
      dynamoTable,
    })

    const dynamoGet = new DynamoGet(this, 'dynamo-get-lambda', {
      dynamoTable,
    })

    // Integrations:
    const healthCheckLambdaIntegration = new LambdaIntegration(
      healthCheckLambda.func,
    )

    const dynamoPostIntegration = new LambdaIntegration(dynamoPost.func)

    const dynamoGetIntegration = new LambdaIntegration(dynamoGet.func)

    // Resources (Path)
    const healthcheck = restApi.root.addResource('healthcheck')
    const rootResource = restApi.root

    // Methods
    healthcheck.addMethod('GET', healthCheckLambdaIntegration)
    healthcheck.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['*'],
      statusCode: 204,
    })

    rootResource.addMethod('POST', dynamoPostIntegration)
    rootResource.addMethod('GET', dynamoGetIntegration)
    rootResource.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['*'],
      statusCode: 204,
    })

    // ARecord:
    new ARecord(this, 'BackendAliasRecord', {
      zone: route53.hosted_zone,
      target: RecordTarget.fromAlias(new targets.ApiGateway(restApi)),
      recordName: `${backEndSubDomain}.${config.domain_name}`,
    })
  }
}
