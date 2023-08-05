import { Stack, StackProps } from 'aws-cdk-lib';
import { Port, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { ECS } from './constructs/ECS';
import { RDS } from './constructs/RDS';
import { S3 } from './constructs/S3';
import { Route53 } from './constructs/Route53';
import { ACM } from './constructs/ACM';

export class Chapter3Stack extends Stack {
  public readonly acm: ACM;

  public readonly ecs: ECS;

  public readonly rds: RDS;

  public readonly route53: Route53;

  public readonly s3: S3;

  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.route53 = new Route53(this, 'Route53');

    this.acm = new ACM(this, 'ACM', {
      hosted_zone: this.route53.hosted_zone,
    });

    this.vpc = new Vpc(this, 'MyVPC', {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'compute',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 28,
          name: 'rds',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    this.s3 = new S3(this, 'S3', {
      acm: this.acm,
      route53: this.route53,
    });

    this.rds = new RDS(this, 'RDS', {
      vpc: this.vpc,
    });

    this.ecs = new ECS(this, 'ECS', {
      rds: this.rds,
      vpc: this.vpc,
      acm: this.acm,
      route53: this.route53,
    });

    this.rds.instance.connections.allowFrom(this.ecs.cluster, Port.tcp(3306));

    this.ecs.task_definition.taskRole.addToPrincipalPolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [this.rds.credentials.secretArn],
      }),
    );

    this.ecs.node.addDependency(this.rds);
  }
}
