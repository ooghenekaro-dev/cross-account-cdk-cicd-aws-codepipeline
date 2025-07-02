#!/usr/bin/env node
import { App } from 'aws-cdk-lib'
import { CICDPipelineStack } from '../lib/cdk-cross-account-pipeline'
import { ajalaEnvironments } from '../lib/config/benji-config'

const app = new App()

new CICDPipelineStack(app, 'AjalaCICDPipelineStack', {
  projectName: 'Ajala',
  repoOwner: 'ooghenekaro-dev',
  repoName: 'ajala-repo',
  connectionArn: 'arn:aws:codeconnections:eu-west-2:233535120968:connection/a87a8ab2-a00d-43ba-bdd9-b7978f3db375',
  environments: ajalaEnvironments,
  env: {
    account: '233535120968', 
    region: 'eu-west-2'
  }
})
app.synth()