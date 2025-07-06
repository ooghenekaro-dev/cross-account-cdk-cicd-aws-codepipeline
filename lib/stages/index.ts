import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MainStack } from '../stacks/main-stack';
import { EnvironmentConfig } from '../config/types';

interface DeploymentProps extends StageProps {
  envs: EnvironmentConfig[];
  projectName: string;
}

export class Deployment extends Stage {
  constructor(scope: Construct, id: string, props: DeploymentProps) {
    super(scope, id, props);

    props.envs.forEach((env) => {
      const stackId = `${env.name}`;
      const stackName = `${env.name}-${props.projectName}`;

      new MainStack(this, stackId, {
        env: {
          account: env.accountId,
          region: env.region
        },
        stackName
      });
    });
  }
}
