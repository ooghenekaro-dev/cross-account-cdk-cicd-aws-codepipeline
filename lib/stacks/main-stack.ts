import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    // Define your actual resources here (e.g., S3, Lambda, etc.)
  }
}
