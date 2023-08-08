## ## [Ch1 Getting started with IaC and AWS CDK](https://www.youtube.com/watch?v=0iemvZUdX-Y&list=PLeLcvrwLe187CchI_3zTtZCAh3TSkXx1I&index=2)



### Install / update AWS CLI

https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

### Configure CDK profile

`aws configure --profile cdk`

Need access key id, secret access key, region (us-east-1), and output as (json).

You essentially create a new named profile called `cdk`. This profile will have its own set of credentials (Access Key ID and Secret Access Key) and configuration settings (like the default region and output format).

Appending `--profile cdk` will specify to use this profile in the upcoming commands.

### Create CDK app

`cdk init app --language typescript`

### Creating a containerized web app

```ts
// ./lib/chapter-1-getting-started-with-iac-and-aws-cdk-stack.ts
import {Stack, StackProps} from 'aws-cdk-lib'
import {ContainerImage} from 'aws-cdk-lib/aws-ecs'
import {ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns'
import {Construct} from 'constructs'

export class Chapter1GettingStartedWithIacAndAwsCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    new ApplicationLoadBalancedFargateService(this, 'MyWebServer', {
      taskImageOptions: {
        image: ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
      },
      publicLoadBalancer: true,
    })
  }
}
```

```ts
// ./bin/chapter-1-getting-started-with-iac-and-aws-cdk.ts
#!/usr/bin/env node
import 'source-map-support/register'
import {App} from 'aws-cdk-lib'
import {Chapter1GettingStartedWithIacAndAwsCdkStack} from '../lib/chapter-1-getting-started-with-iac-and-aws-cdk-stack'

const app = new App()
new Chapter1GettingStartedWithIacAndAwsCdkStack(
  app,
  'Chapter1GettingStartedWithIacAndAwsCdkStack',
  {},
)
```

Bootstrap the AWS environment, meaning create all the necessary AWS resources on the cloud to make CDK work properly. This has to be done once, for the region.

`cdk bootstrap --profile cdk`

Deploy the stack.

`cdk deploy --profile cdk`

To remove the stack:

`cdk destroy --profile cdk`

You can use `synth` to compile/translate the TS code into a CloudFormation stack, useful to check if the TS code produces valid IaC.

`cdk synth`

## [Ch2: A starter project and core concepts](https://www.youtube.com/watch?v=ChUPD-MAjoA&list=PLeLcvrwLe187CchI_3zTtZCAh3TSkXx1I&index=2)

Goal: Learn about the relationship between stack, construct, and how to instantiate the cdk app.



Create some folders; web, infrastructure. Init cdk on infrastructure directory.

Stack > Construct. Stack is your everything (CloudFormation stack). Construct is any AWS resource, or a combination of them.

> ```bash
> tree -I node_modules  # full tree
> ```

The convention is that there is a bin folder for the instantiation of the stack.
And there is a lib folder for the constructs and the stack

```bash
bin # instantiation of the stack
└── infrastructure.ts
lib # stack & constructs
├── constructs # all the constructs
│   └── S3Bucket
│       └── index.ts
└── index.ts # the stack
```

The S3 construct:

```ts
// ./infrastructure/lib/constructs/S3Bucket/index.ts
import {RemovalPolicy} from 'aws-cdk-lib'
import {Bucket} from 'aws-cdk-lib/aws-s3'
import {Construct} from 'constructs'

// This is an interface we use to pass the environment as a variable to the construct
interface Props {
  environment: string
}

export class S3Bucket extends Construct {
  // the bucket property is defined outside the constructor
  // because it is meant to be part of every instance of the class,
  // holding a value that persists for the lifetime of the object.
  // Its purpose is to hold state that other methods in the class
  //  might need to access or modify.
  public readonly bucket: Bucket

  // on the other hand, scope, id, and props are only needed temporarily
  // to set up the new instance
  // Every construct needs to implement a constructor
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    const removalPolicy =
      props.environment === 'prod'
        ? RemovalPolicy.RETAIN
        : RemovalPolicy.DESTROY

    this.bucket = new Bucket(scope, 'Bucket-S3', {
      // in non-prod when the stack is deleted, the bucket should be destroyed
      removalPolicy,
    })
  }
}
```

The stack:

```ts
// ./infrastructure/lib/index.ts

import {Stack} from 'aws-cdk-lib'
import type {StackProps} from 'aws-cdk-lib'
import type {Construct} from 'constructs'
import {S3Bucket} from './constructs/S3Bucket'

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // the constructs that defines your stack goes here

    // does not matter whether there is an assignment to a variable or not
    // the instantiation causes the construct to be created
    new S3Bucket(this, 'MyRemovableBucket', {
      environment: 'development',
    })
  }
}
```

The instantiation of the stack:

```ts
// ./infrastructure/bin/infrastructure.ts

#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WebStack } from "../lib";

const app = new cdk.App();
new WebStack(app, "WebStack", {});
```

Test by deploying and destroying
```bash
cdk deploy --profile cdk
cdk destroy --profile cdk
```

https://constructs.dev/  package manager for cdk

## Ch3: Practical Cloud Development with AWS CDK

Goal:

* Set up DynamoDB tables.
* Serve static HTML files and SPAs via S3 buckets.
* Deploy Docker-based image on ECS.



In the server folder, set `AWS_PROFILE` and `PORT` as environment variables. 

Our backend will need to connect to DynamoDB, and we are going to be giving it access via the AWS AccessKeyID and SecretAccessKey that you provisioned for yourself. By exporting the AWS profile, you give CDK the directions to search for the credentials without having to create an .env file.

```bash
export AWS_PROFILE=cdk
export PORT=3001

yarn install
yarn dev
```

Create an infrastructure directory and initialize cdk app. 

> ```bash
> nvm alias default 18 # to set default node version for CLI
> ```

```bash
cdk init app --language typescript
```

Build the web, server, infrastructure as shown in the code. 

One of the key points is the stack file, which has 3 constructs; DDB, ECS (Elastic Container Service) to host the backend, S3 to hold frontend files.

```ts
// ./infrastructure/lib/chapter-3-stack.ts

import {Stack, StackProps} from 'aws-cdk-lib'
import {Construct} from 'constructs'

import {Dynamodb} from './constructs/Dynamodb'
import {ECS} from './constructs/ECS'
import {S3} from './constructs/S3'

export class Chapter3Stack extends Stack {
  public readonly dynamodb: Dynamodb
  public readonly s3: S3
  public readonly ecs: ECS

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // the 3 constructs
    this.dynamodb = new Dynamodb(this, 'Dynamodb') 
    this.s3 = new S3(this, 'S3') // for frontend files
    this.ecs = new ECS(this, 'ECS', { // to host the backend
      dynamodb: this.dynamodb,
    })
  }
}
```

To spin up a DDB table, we just instantiate the `Table` class from `aws-cdk-lib/aws-dynamodb`.

```ts
// ./infrastructure/lib/constructs/Dynamodb.ts
import {Construct} from 'constructs'
import {AttributeType, BillingMode, Table} from 'aws-cdk-lib/aws-dynamodb'
import {RemovalPolicy} from 'aws-cdk-lib'

export class Dynamodb extends Construct {
  public readonly main_table: Table

  constructor(scope: Construct, id: string) {
    super(scope, id)

    // instantiate the Table class from aws-cdk-lib/aws-dynamodb
    this.main_table = new Table(scope, 'MainTable', {
      partitionKey: {
        name: 'partition_key',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sort_key',
        type: AttributeType.STRING,
      },
      tableName: 'main_table',
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    })
  }
}
```

S3 has the capability to act as a content server for our files, and our front end app is a single page app.

```ts
// ./infrastructure/lib/constructs/S3.ts

import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
} from 'aws-cdk-lib/aws-s3'
import {BucketDeployment, Source} from 'aws-cdk-lib/aws-s3-deployment'
import {Construct} from 'constructs'
import {resolve} from 'path'
import {CfnOutput, RemovalPolicy} from 'aws-cdk-lib'
import {v4 as uuidv4} from 'uuid'

export class S3 extends Construct {
  public readonly web_bucket: Bucket
  public readonly web_bucket_deployment: BucketDeployment

  constructor(scope: Construct, id: string) {
    super(scope, id)

    this.web_bucket = new Bucket(scope, 'WebBucket', {
      bucketName: `chapter-3-web-bucket-${uuidv4()}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true, // so that the bucket is deleted when the stack is destroyed, even tho not empty
    })
    // we specify where to get the build folder from
    this.web_bucket_deployment = new BucketDeployment(
      scope,
      'WebBucketDeployment',
      {
        sources: [
          Source.asset(resolve(__dirname, '..', '..', '..', 'web', 'build')),
        ],
        destinationBucket: this.web_bucket,
      },
    )
    // so that we output the url after the deploy is finished
    new CfnOutput(scope, 'FrontendURL', {
      value: this.web_bucket.bucketWebsiteUrl,
    })
  }
}
```

Comments included below for what the code does:
```ts
// ./infrastructure/lib/constructs/ECS.ts

import {CfnOutput, Duration} from 'aws-cdk-lib'
import {InstanceType, Vpc} from 'aws-cdk-lib/aws-ec2'
import {Construct} from 'constructs'
import {
  Cluster,
  ContainerDefinition,
  ContainerImage,
  Protocol,
  LogDriver,
  FargateService,
  FargateTaskDefinition,
} from 'aws-cdk-lib/aws-ecs'
import {
  ApplicationListener,
  ApplicationLoadBalancer,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {Dynamodb} from './Dynamodb'
import {resolve} from 'path'

interface Props {
  dynamodb: Dynamodb
}

export class ECS extends Construct {
  public readonly vpc: Vpc
  public readonly cluster: Cluster
  public readonly task_definition: FargateTaskDefinition
  public readonly container: ContainerDefinition
  public readonly service: FargateService
  public readonly load_balancer: ApplicationLoadBalancer
  public readonly listener: ApplicationListener

  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id)

    // Fargate will be spinning up EC2 machines that run our ECS containers
    // Therefore we need a virtually isolated private cloud; VPC
    // VPC is an environment with a network isolated from the rest of the customers of AWS
    // to safely set up virtual machines or do all kinds of networking magic.
    this.vpc = new Vpc(scope, 'Vpc', {maxAzs: 2})
    // next we setup an ECS cluster that holds a group of ECS services (one for now)
    this.cluster = new Cluster(scope, 'EcsCluster', {vpc: this.vpc})
    this.cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new InstanceType('t2.micro'),
    })

    // This section creates the ECS task definition.
    // A task definition contains information about what the ECS service needs to run.
    this.task_definition = new FargateTaskDefinition(scope, 'TaskDefinition')
    // In this example, we are pointing to the Dockerfile located at ./server/Dockerfile.
    // Define how much memory should be assigned to the task
    // and also ask AWS to kindly keep hold of the logs of the application.
    // As seen during the deployment, CDK builds the image on your behalf
    // and deals with all the necessary steps to upload the image to ECR
    // and make it available for the ECS task definition
    this.container = this.task_definition.addContainer('Express', {
      image: ContainerImage.fromAsset(
        resolve(__dirname, '..', '..', '..', 'server'),
      ),
      memoryLimitMiB: 256,
      logging: LogDriver.awsLogs({streamPrefix: 'chapter3'}),
    })

    // This part sets up all the port mapping and the load balancer for our backend.
    // It tells the load balancer that it should forward any traffic it receives on port 80
    // and hand it over to our ECS service.
    // It also indicates to the load balancer that it can check whether the service is up
    // by periodically calling the /healthcheck endpoint of our backend application.
    this.container.addPortMappings({
      containerPort: 80,
      protocol: Protocol.TCP,
    })
    this.service = new FargateService(scope, 'Service', {
      cluster: this.cluster,
      taskDefinition: this.task_definition,
    })
    this.load_balancer = new ApplicationLoadBalancer(scope, 'LB', {
      vpc: this.vpc,
      internetFacing: true,
    })
    this.listener = this.load_balancer.addListener('PublicListener', {
      port: 80,
      open: true,
    })
    this.listener.addTargets('ECS', {
      port: 80,
      targets: [
        this.service.loadBalancerTarget({
          containerName: 'Express',
          containerPort: 80,
        }),
      ],
      healthCheck: {
        interval: Duration.seconds(60),
        path: '/healthcheck',
        timeout: Duration.seconds(5),
      },
    })

    // granting all the necessary permissions so that the API can perform 
    // the desired actions on DynamoDB, in this case, read and write permissions:
    props.dynamodb.main_table.grantReadWriteData(this.task_definition.taskRole)

    // so that we output the url after the deploy is finished
    new CfnOutput(scope, 'BackendURL', {
      value: this.load_balancer.loadBalancerDnsName,
    })
  }
}
```



Check infrastructure with `cdk synth`. I will try to build the UI app, and the infrastructure, then check with cdk.

Start docker on your laptop, and deploy them all with 

```bash
cdk deploy --profile cdk
```

> I had to modify ./server/Dockerfile to use node 16 and the npm registry
>
> ```dockerfile
> FROM amd64/node:16
> 
> WORKDIR /server
> 
> COPY . .
> 
> RUN npm install --registry https://registry.npmjs.org && npm run build
> 
> EXPOSE 80
> 
> ENTRYPOINT ["npm", "run", "start"]
> ```

After 10 mins, we get backend and frontend url outputs. Copy the backend url to the web/src/components/Main/index.ts.

```bash
Chapter3Stack.BackendURL = Chapt-LB8A1-2V5FSD3MIQEJ-1453091419.us-east-1.elb.amazonaws.com
Chapter3Stack.FrontendURL = http://chapter-3-web-bucket-a9b56e63-4748-4151-ab72-7f014b5a4147.s3-website-us-east-1.amazonaws.com
```

`yarn build`, go to the infrastructure folder and deploy again.





