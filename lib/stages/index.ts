import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MainStack } from '../stacks/main-stack';
import { EnvironmentConfig } from '../config/project-config';

interface DeploymentProps extends StageProps {
  envs: EnvironmentConfig[];
  projectName: string;
}

export class Deployment extends Stage {
  constructor(scope: Construct, id: string, props: DeploymentProps) {
    super(scope, id, props);

    props.envs.forEach((env) => {
      // Use account ID to make Construct ID unique
      new MainStack(this, `${env.name}-${props.projectName}-${env.accountId}`, {
        env: { account: env.accountId, region: env.region },
        stackName: `${env.name}-${props.projectName}-mainstack`,  // AWS console stack name
      });
    });
  }
}
