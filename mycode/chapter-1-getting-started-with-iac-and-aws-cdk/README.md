## ## Ch1 Getting started with IaC and AWS CDK

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

## Ch2: A starter project and core concepts

