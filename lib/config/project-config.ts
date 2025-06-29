import { Stack } from 'aws-cdk-lib'

export interface EnvironmentConfig {
  readonly name: string
  readonly accountId: string
  readonly region: string
}

export interface ProjectEnvironment {
  readonly stageName: string
  readonly environments: EnvironmentConfig[]
}

/**
 * Returns the project name from CDK context (or default).
 * This will be one project per pipeline run.
 */
export const getProjectName = (stack: Stack): string => {
  return stack.node.tryGetContext('projectName') ?? 'default-project'
}

/**
 * Returns environments for a given project name.
 * You can expand this to pull from JSON file or external source later.
 */
export const getProjectEnvironments = (projectName: string): ProjectEnvironment[] => [
  {
    stageName: `dev-${projectName}`,
    environments: [
      { name: 'dev', accountId: '351562206758', region: 'eu-west-2' }
    //  { name: 'dev', accountId: '222222222222', region: 'eu-west-2' }
    //  { name: 'dev', accountId: '333333333333', region: 'eu-west-2' }
    ]
  },
  {
    stageName: `stage-${projectName}`,
    environments: [
      { name: 'stage', accountId: '351562206758', region: 'eu-west-2' }
    //  { name: 'stage', accountId: '354590765338', region: 'eu-west-2' }
      //{ name: 'stage', accountId: '351573384936', region: 'eu-west-2' }
    ]
  },
  {
    stageName: `cte-${projectName}`,
    environments: [
      { name: 'cte', accountId: '351562206758', region: 'eu-west-2' },
   //   { name: 'cte', accountId: '888888888888', region: 'eu-west-2' }
    //  { name: 'cte', accountId: '999999999999', region: 'eu-west-2' }
    ]
  },
  {
    stageName: `preprod-${projectName}`,
    environments: [
      { name: 'preprod', accountId: '351562206758', region: 'eu-west-2' }
    //  { name: 'preprod', accountId: '111111111112', region: 'eu-west-2' }
      //{ name: 'preprod', accountId: '121212121212', region: 'eu-west-2' }
    ]
  },
  {
    stageName: `prod-${projectName}`,
    environments: [
      { name: 'prod', accountId: '351562206758', region: 'eu-west-2' }
 //     { name: 'prod', accountId: '141414141414', region: 'eu-west-2' },
   //   { name: 'prod', accountId: '151515151515', region: 'eu-west-2' }
    ]
  }
]
