import { Construct } from 'constructs';
import {
  EndpointType,
  LambdaIntegration,
  RestApi,
  SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';
import { ACM } from '../ACM';
import { Route53 } from '../Route53';

import config from '../../../../config.json';
import { HealthCheckLambda } from '../Lambda/healthcheck';
import { DynamoPost } from '../Lambda/post';
import { DynamoGet } from '../Lambda/get';

interface Props {
  acm: ACM;
  route53: Route53;
  dynamoTable: Table;
  stateMachine: StateMachine;
}

export class ApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id);

    const { acm, route53, dynamoTable, stateMachine } = props;

    const backEndSubDomain =
      process.env.NODE_ENV === 'Production'
        ? config.backend_subdomain
        : config.backend_dev_subdomain;

    // generates a RESTful API using a construct from API Gateway.
    // we are configuring the API to utilize the certificate and domain name we created earlier
    // and establishing a stage name in alignment with the deployed environment.
    const restApi = new RestApi(this, 'chapter-7-rest-api', {
      restApiName: `chapter-7-rest-api-${process.env.NODE_ENV || ''}`,
      description: 'serverless api using lambda functions',
      domainName: {
        certificate: acm.certificate,
        domainName: `${backEndSubDomain}.${config.domain_name}`,
        endpointType: EndpointType.REGIONAL,
        securityPolicy: SecurityPolicy.TLS_1_2,
      },
      deployOptions: {
        stageName: process.env.NODE_ENV === 'Production' ? 'prod' : 'dev',
      },
    });

    // Lambdas:
    // we are creating an instance of the Lambda function within the API Gateway’s index.ts file
    // and using the LambdaIntegration() method to enable our Lambda to be integrated with API Gateway.
    const healthCheckLambda = new HealthCheckLambda(
      this,
      'health-check-lambda-api-endpoint',
      {},
    );

    const dynamoPost = new DynamoPost(this, 'dynamo-post-lambda', {
      dynamoTable,
      stateMachine,
    });

    const dynamoGet = new DynamoGet(this, 'dynamo-get-lambda', {
      dynamoTable,
      stateMachine,
    });

    // Integrations:
    const healthCheckLambdaIntegration = new LambdaIntegration(
      healthCheckLambda.func,
    );

    const dynamoPostIntegration = new LambdaIntegration(dynamoPost.func);

    const dynamoGetIntegration = new LambdaIntegration(dynamoGet.func);

    // creating a health check path in the REST API.
    // The addResource() function creates the path in the API
    // Resources (Path)
    const healthcheck = restApi.root.addResource('healthcheck');
    const rootResource = restApi.root;
    // Methods
    healthcheck.addMethod('GET', healthCheckLambdaIntegration);
    healthcheck.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['*'],
      statusCode: 204,
    });

    rootResource.addMethod('POST', dynamoPostIntegration);
    rootResource.addMethod('GET', dynamoGetIntegration);
    rootResource.addCorsPreflight({
      allowOrigins: ['*'],
      allowHeaders: ['*'],
      allowMethods: ['*'],
      statusCode: 204,
    });

    // this allows us to use a customized backend subdomain as a DNS alias for the API Gateway URL,
    //  as we did with ECS and its load balancer.
    new ARecord(this, 'BackendAliasRecord', {
      zone: route53.hosted_zone,
      target: RecordTarget.fromAlias(new targets.ApiGateway(restApi)),
      recordName: `${backEndSubDomain}.${config.domain_name}`,
    });
  }
}
