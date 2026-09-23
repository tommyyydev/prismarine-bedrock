'use strict'

const assert = require('assert')
const path = require('path')
const BotState = require('../../src/state')
const {
  DEFAULT_BEDROCK_VERSION,
  bedrockRegistryName,
  bedrockVersionFromEnv,
  minecraftDataBedrockDir,
  normalizeBedrockVersion
} = require('../../src/version')

describe('Bedrock version helpers', function () {
  it('normalizes minecraft-data shorthand versions for protocol consumers', function () {
    assert.strictEqual(DEFAULT_BEDROCK_VERSION, '1.26.51')
    assert.strictEqual(normalizeBedrockVersion('26.51'), '1.26.51')
    assert.strictEqual(normalizeBedrockVersion('1.26.51'), '1.26.51')
  })

  it('builds registry and schema paths from the same version source', function () {
    assert.strictEqual(bedrockRegistryName('26.51'), 'bedrock_1.26.51')
    assert.strictEqual(bedrockVersionFromEnv({ MC_VERSION: '26.51' }), '1.26.51')
    assert.strictEqual(
      minecraftDataBedrockDir('26.51', 'repo-root'),
      path.join('repo-root', 'node_modules', 'minecraft-data', 'minecraft-data', 'data', 'bedrock', '1.26.51')
    )
  })

  it('allows a bot to ignore remote entity tracking when configured', function () {
    const state = new BotState({ ignoreEntities: true, loggingEnabled: false })
    state.start()

    state.client.emit('add_entity', {
      unique_id: 42n,
      runtime_id: 77n,
      position: { x: 1, y: 2, z: 3 },
      velocity: { x: 0, y: 0, z: 0 },
      yaw: 0,
      pitch: 0,
      metadata: [],
      attributes: [],
      entity_type: 'minecraft:cow'
    })
    state.client.emit('move_entity', {
      runtime_entity_id: 77n,
      position: { x: 2, y: 3, z: 4 },
      rotation: { yaw: 45, pitch: 30 },
      flags: { on_ground: true }
    })
    state.client.emit('remove_entity', {
      entity_id_self: 42n,
      runtime_entity_id: 77n
    })

    assert.strictEqual(state.entities.size, 0)
    assert.strictEqual(state.options.ignoreEntities, true)
  })
})
