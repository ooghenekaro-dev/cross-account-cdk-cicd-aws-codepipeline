// lib/pipeline.ts
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  CodeBuildStep
} from 'aws-cdk-lib/pipelines'
import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Deployment } from './stages'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'
import { ProjectEnvironment } from './config/types'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as kms from 'aws-cdk-lib/aws-kms'
import { RemovalPolicy, Duration } from 'aws-cdk-lib';


interface CICDPipelineStackProps extends StackProps {
  projectName: string
  repoOwner: string
  repoName: string
  connectionArn: string
  environments: ProjectEnvironment[]
}

export class CICDPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: CICDPipelineStackProps & { appFile?: string }) {
    super(scope, id, props)

  // Create an S3 bucket for access logs
   const accessLogsBucket = new s3.Bucket(this, 'PipelineAccessLogsBucket', {
     removalPolicy: RemovalPolicy.DESTROY,
     autoDeleteObjects: true,
     lifecycleRules: [{ expiration: Duration.days(30) }],
    });

//  Create a custome KMS key with rotation enabled, we only had to do due to cfn-nag failing our pipeline for rotation not enabled for our default key created for us by CDK
   const artifactKey = new kms.Key(this, 'PipelineKey', {
     enableKeyRotation: true,
    });

// Create an artifact bucket with access logging and we use our custom KMS key
    const artifactBucket = new s3.Bucket(this, 'PipelineArtifactsBucket', {
      encryptionKey: artifactKey,
      serverAccessLogsBucket: accessLogsBucket,
      serverAccessLogsPrefix: 'logs/',
     });



    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: `${props.projectName}-pipeline`,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(`${props.repoOwner}/${props.repoName}`, 'main', {
          connectionArn: props.connectionArn
        }),
        installCommands: ['npm ci'],
        commands: ['npm run build', 
                   'npx cdk synth']
      }),
      crossAccountKeys: true,
      artifactBucket: artifactBucket
    })

    const validatePolicy = new PolicyStatement({
      actions: [
        'cloudformation:DescribeStacks',
        'cloudformation:ListStackResources',
        'tag:GetResources'
      ],
      resources: [`arn:aws:cloudformation:${this.region}:${this.account}:stack/*`]
    })

    for (const stageConfig of props.environments) {
      const deploymentStage = new Deployment(this, stageConfig.stageName, {
        envs: stageConfig.environments,
        projectName: props.projectName
      })

      pipeline.addStage(deploymentStage, {
        pre: [
          new CodeBuildStep(`Lint-${stageConfig.stageName}`, {
            commands: ['npm ci', 'npm run lint']
          }),
          new CodeBuildStep(`Test-${stageConfig.stageName}`, {
            commands: ['npm ci', 'npm run test']
          }),
          new CodeBuildStep(`Security-${stageConfig.stageName}`, {
            installCommands: ['npm ci', 'gem install cfn-nag'],
            commands: ['npm run build', 'npx cdk synth', 'npm run security']
          })
        ],
        post: [
          new CodeBuildStep(`Validate-${stageConfig.stageName}`, {
            env: { STAGE: stageConfig.stageName },
            commands: ['npm ci', 'npm run validate'],
            rolePolicyStatements: [validatePolicy]
          })
        ]
      })
    }
  }
}
