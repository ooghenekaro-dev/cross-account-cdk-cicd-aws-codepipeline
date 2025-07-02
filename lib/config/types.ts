export interface EnvironmentConfig {
  readonly name: string
  readonly accountId: string
  readonly region: string
}

export interface ProjectEnvironment {
  readonly stageName: string
  readonly environments: EnvironmentConfig[]
}
