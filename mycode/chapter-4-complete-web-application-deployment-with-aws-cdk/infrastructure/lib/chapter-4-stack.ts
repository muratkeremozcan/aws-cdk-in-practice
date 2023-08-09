import {Stack, StackProps} from 'aws-cdk-lib'
import {Construct} from 'constructs'

import {Dynamodb} from './constructs/Dynamodb'
import {ECS} from './constructs/ECS'
import {S3} from './constructs/S3'

export class Chapter4Stack extends Stack {
  public readonly dynamodb: Dynamodb
  public readonly s3: S3
  public readonly ecs: ECS

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // the 3 constructs
    this.dynamodb = new Dynamodb(this, 'Dynamodb')
    this.s3 = new S3(this, 'S3') // for frontend files
    this.ecs = new ECS(this, 'ECS', {
      // to host the backend
      dynamodb: this.dynamodb,
    })
  }
}
