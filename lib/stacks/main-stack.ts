import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Bucket } from 'aws-cdk-lib/aws-s3'


export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    Bucket.fromBucketName(this, 'MyBucket', 'karo-bucket-guguru')

    // Define your actual resources here (e.g., S3, Lambda, etc.)
  }
}
