import { Stack, StackProps } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { S3 } from './constructs/S3';
import { Route53 } from './constructs/Route53';
import { ACM } from './constructs/ACM';
import { ApiGateway } from './constructs/API-GW';
import { DynamoDB } from './constructs/DynamoDB';
import { StepFunction } from './constructs/Step-Function';

export class Chapter7Stack extends Stack {
  public readonly acm: ACM;

  public readonly route53: Route53;

  public readonly s3: S3;

  public readonly vpc: Vpc;

  public readonly dynamo: DynamoDB;

  public readonly stepFunction: StepFunction;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.route53 = new Route53(this, `Route53-${process.env.NODE_ENV || ''}`);

    this.acm = new ACM(this, `ACM-${process.env.NODE_ENV || ''}`, {
      hosted_zone: this.route53.hosted_zone,
    });

    this.s3 = new S3(this, `S3-${process.env.NODE_ENV || ''}`, {
      acm: this.acm,
      route53: this.route53,
    });

    this.dynamo = new DynamoDB(this, `Dynamo-${process.env.NODE_ENV || ''}`);

    this.stepFunction = new StepFunction(
      this,
      `Step-Function-${process.env.NODE_ENV || ''}`,
      {},
    );

    new ApiGateway(this, `Api-Gateway-${process.env.NODE_ENV || ''}`, {
      route53: this.route53,
      acm: this.acm,
      dynamoTable: this.dynamo.table,
      stateMachine: this.stepFunction.stateMachine,
    });
  }
}
