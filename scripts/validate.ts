#!/usr/bin/env ts-node

import {
  CloudFormationClient,
  DescribeStacksCommand,
  ListStackResourcesCommand
} from '@aws-sdk/client-cloudformation'
import {
  ResourceGroupsTaggingAPIClient,
  GetResourcesCommand
} from '@aws-sdk/client-resource-groups-tagging-api'

const stage = process.env.STAGE ?? 'Dev'
const stackName = `${stage}-MainStack`
const requiredTags = ['Environment', 'Project']

const cf = new CloudFormationClient({})
const tagging = new ResourceGroupsTaggingAPIClient({})

async function main() {
  const stackResp = await cf.send(new DescribeStacksCommand({ StackName: stackName }))
  const stack = stackResp.Stacks?.[0]

  if (!stack) throw new Error(`Stack ${stackName} not found`)
  if (stack.StackStatus !== 'CREATE_COMPLETE' && stack.StackStatus !== 'UPDATE_COMPLETE') {
    throw new Error(`Stack ${stackName} is in bad status: ${stack.StackStatus}`)
  }

  console.log(`✅ Stack ${stackName} is healthy with status: ${stack.StackStatus}`)

  const resourcesResp = await cf.send(new ListStackResourcesCommand({ StackName: stackName }))
  const logicalResources = resourcesResp.StackResourceSummaries ?? []

  console.log(`🔍 Checking ${logicalResources.length} resources for required tags...`)

  const tagResp = await tagging.send(new GetResourcesCommand({ TagFilters: [] }))
  const taggedResources = tagResp.ResourceTagMappingList ?? []

  const tagFailures: string[] = []

  for (const resource of taggedResources) {
    const arn = resource.ResourceARN
    const tags = (resource.Tags ?? []).map(tag => tag.Key)

    const missing = requiredTags.filter(required => !tags.includes(required))
    if (missing.length > 0) {
      tagFailures.push(`❌ ${arn} missing tags: ${missing.join(', ')}`)
    }
  }

  if (tagFailures.length > 0) {
    console.error('Tag validation failed:\n' + tagFailures.join('\n'))
    process.exit(1)
  }

  console.log(`✅ All resources contain required tags: ${requiredTags.join(', ')}`)
}

main().catch(e => {
  console.error(`❌ Validation script failed:`, e)
  process.exit(1)
})
