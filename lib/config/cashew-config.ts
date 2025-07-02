import { ProjectEnvironment } from './types'

export const ajalaEnvironments: ProjectEnvironment[] = [
  {
    stageName: 'dev',
    environments: [
      { name: 'dev', accountId: '351562206758', region: 'eu-west-2' }
    ]
  },
  {
    stageName: 'stage',
    environments: [
      { name: 'stage', accountId: '351562206758', region: 'eu-west-2' }
    ]
  },
  {
    stageName: 'cte',
    environments: [
      { name: 'cte', accountId: '351562206758', region: 'eu-west-2' }
    ]
  },
  {
    stageName: 'preprod',
    environments: [
      { name: 'preprod', accountId: '351562206758', region: 'eu-west-2' }
    ]
  },
  {
    stageName: 'prod',
    environments: [
      { name: 'prod', accountId: '351562206758', region: 'eu-west-2' }
    ]
  }
]
