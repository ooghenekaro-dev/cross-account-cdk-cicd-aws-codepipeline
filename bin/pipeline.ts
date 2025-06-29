#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CICDPipelineStack } from '../lib/cdk-cross-account-pipeline';

const app = new cdk.App();

new CICDPipelineStack(app, 'CICDPipelineStack', {
  env: {
    account: '233535120968',
    region: 'eu-west-2'
  }
});
app.synth();