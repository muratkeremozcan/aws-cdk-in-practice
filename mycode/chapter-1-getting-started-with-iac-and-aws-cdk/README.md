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

    // not that whether there is an assignment to a variable or not
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

https://constructs.dev/  package manager for cdl
