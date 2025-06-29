import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  CodeBuildStep
} from 'aws-cdk-lib/pipelines'
import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Deployment } from './stages'
import { getProjectEnvironments, getProjectName } from './config/project-config'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import * as codebuild from 'aws-cdk-lib/aws-codebuild'

export class CICDPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // We Get project name from CDK context (cdk.json or CLI context)
    const projectName = getProjectName(this)

    // Here we  Create Our pipeline
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: `${projectName}-pipeline`,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('ooghenekaro-dev/cross-account-cdk-cicd-aws-codepipeline', 'main', {
          connectionArn: 'arn:aws:codeconnections:eu-west-2:233535120968:connection/a87a8ab2-a00d-43ba-bdd9-b7978f3db375'
        }),
        installCommands: ['npm ci'],
        commands: ['npm run build', 'npx cdk synth']

      }),
        crossAccountKeys: true  // Since this pipeline is cross-account, we need to use cross-account keys ro ensure smooth deployment to our target accounts.
    })

    //We create a Policy allowing the validation step to describe CF stacks and tagging
    const validatePolicy = new PolicyStatement({
      actions: [
        'cloudformation:DescribeStacks',
        'cloudformation:ListStackResources',
        'tag:GetResources'
      ],
      resources: ['*']
    })

    // Here we Add stages for each environment group returned from your config
    for (const stageConfig of getProjectEnvironments(projectName)) {
      const deploymentStage = new Deployment(this, stageConfig.stageName, {
        envs: stageConfig.environments,
        projectName
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
            commands: ['npm run build', 'npm run security']
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
