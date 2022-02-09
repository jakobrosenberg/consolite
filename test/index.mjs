import { createLogger, Consolite } from '../esm/index.mjs'
import assert from 'assert'
import { test, stdNout } from './utils.mjs'

const logger = createLogger('main')
const childLogger = logger.createChild('child')
const grandchildLogger = childLogger.createChild('grandchild')
const parentLogger = logger.createParent('parent')

test('can create logger', () => {
  const lines = stdNout(() => {
    logger.log('foo bar')
  })
  assert.deepEqual(lines, ['main foo bar'])
})

test('can create child logger', () => {
  const lines = stdNout(() => {
    childLogger.log('foo bar')
  })
  assert.deepEqual(lines, ['main child foo bar'])
})

test('can create parent logger', () => {
  const lines = stdNout(() => {
    parentLogger.log('foo bar')
  })
  assert.deepEqual(lines, ['parent main foo bar'])
})

test('can set level', () => {
  const lines = stdNout(() => {
    logger.debug('no show')
    logger.level = 4
    logger.debug('do show')
  })
  assert.deepEqual(lines, ['main do show'])
})

test('inherits level', () => {
  const lines = stdNout(() => {
    childLogger.debug('do show')
  })
  assert.deepEqual(lines, ['main child do show'])
})

test('can override inherited level', () => {
  const lines = stdNout(() => {
    childLogger.level = 3
    childLogger.debug('no longer shows')
    logger.debug('still shows')
  })
  assert.deepEqual(lines, ['main still shows'])
})

test('can change default of logger', () => {
  const lines = stdNout(() => {
    logger.debug('still shows')
    logger.levels.debug = 10
    logger.debug('no longer shows')
    logger.levels.debug = 4
  })
  assert.deepEqual(lines, ['main still shows'])
})

test('inherits defaults', () => {
  const lines = stdNout(() => {
    childLogger.debug('no longer shows')
  })
  assert.deepEqual(lines, [])
})

test('new logger is its own root', () => {
  assert.equal(logger.root, logger)
})

test('children can find root', () => {
  assert.equal(childLogger.root, logger)
  assert.equal(grandchildLogger.root, logger)
})

test('new parent is its own root', () => {
  assert.equal(parentLogger.root, parentLogger)
})

test('can filter by string', () => {
  const lines = stdNout(() => {
    childLogger.log('show me')
    childLogger.root.filter = 'grandchild'
    childLogger.log('im filtered out')
    grandchildLogger.log('i can still post')
  })
  childLogger.root.filter = null
  assert.deepEqual(lines, [
    'main child show me',
    'main child grandchild i can still post',
  ])
})

test('can filter by function', () => {
  const lines = stdNout(() => {
    childLogger.log('show me')
    childLogger.root.filter = prefixes => prefixes.includes('grandchild')
    childLogger.log('im filtered out')
    grandchildLogger.log('i can still post')
  })

  childLogger.root.filter = () => true
  assert.deepEqual(lines, [
    'main child show me',
    'main child grandchild i can still post',
  ])
})

test('can use functions for prefixes', () => {
  const log = createLogger(method => `[${method.toUpperCase()}]`, '[im scope]')
  const lines = stdNout(() => {
    log.log('show me')
  })
  assert.deepEqual(lines, ['[LOG] [im scope] show me'])
})

test('levels can be returns with spread operator', () => {
  childLogger.levels.fake = 1
  assert.deepEqual(
    { ...childLogger.levels },
    {
      debug: 4,
      default: 3,
      error: 1,
      fake: 1,
      trace: 4,
      warn: 2,
    },
  )
})

test('can create custom methods', () => {
  childLogger.register('silly', console.log)
  childLogger.levels.silly = 1

  const lines = stdNout(() => {
    childLogger.silly("I'm visible")
    childLogger.levels.silly = 10
    childLogger.silly("I'm hidden")
    childLogger.levels.silly = 1
    childLogger.silly("I'm visible")
  })
  assert.deepEqual(lines, ["main child I'm visible", "main child I'm visible"])
})
