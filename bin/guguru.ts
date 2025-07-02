#!/usr/bin/env node
import { App } from 'aws-cdk-lib'
import { CICDPipelineStack } from '../lib/cdk-cross-account-pipeline'
import { ajalaEnvironments } from '../lib/config/guguru-config'

const app = new App()

new CICDPipelineStack(app, 'AjalaCICDPipelineStack', {
  projectName: 'Ajala',
  repoOwner: 'ooghenekaro-dev',
  repoName: 'ajala-repo',
  connectionArn: 'arn:aws:codestar-connections:eu-west-2:233535120968:connection/ajala-conn-id',
  environments: ajalaEnvironments,
  env: {
    account: '233535120968', 
    region: 'eu-west-2'
  }
})
app.synth()