import { createLogger, Consolite } from '../esm/index.mjs'
import assert from 'assert'
import { stdNout } from './utils.mjs'

const logger = createLogger('main')
const childLogger = logger.createChild('child')
const grandchildLogger = childLogger.createChild('grandchild')

test('has prefix', () => {
  assert.deepEqual(logger._prefix, ['main'])
})

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

test('can set level', () => {
  const lines = stdNout(() => {
    logger.debug('no show')
    logger.level = 4
    logger.debug('do show')
  })
  assert.equal(logger._level, 4)
  assert.deepEqual(lines, ['main do show'])
})

test('level can be a callback', () => {
  const levelCb = () => 4
  logger.level = 1
  const lines = stdNout(() => {
    logger.debug('no show')
    logger.level = levelCb
    logger.debug('do show')
  })
  // @ts-ignore
  assert.equal(logger._level(), 4)
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

test('new logger is its own root', ctx => {
  assert.equal(logger.root, logger.__self)
})

test('children can find root', () => {
  assert.equal(childLogger.root, logger.__self)
  assert.equal(grandchildLogger.root, logger.__self)
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
    childLogger.info('show me too')
    childLogger.root.filter = (prefixes, method) =>
      prefixes.includes('grandchild') && method === 'log'
    childLogger.log('im filtered out')
    grandchildLogger.log('i can still post')
    grandchildLogger.info('i cannot post. ') // filtered method
  })

  childLogger.root.filter = () => true
  assert.deepEqual(lines, [
    'main child show me',
    'main child show me too',
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
  logger.register('silly', console.log)
  logger.levels.silly = 1

  const lines = stdNout(() => {
    logger.silly("I'm visible")
    logger.levels.silly = 10
    logger.silly("I'm hidden")
    logger.levels.silly = 1
    logger.silly("I'm visible")
  })
  assert.deepEqual(lines, ["main I'm visible", "main I'm visible"])
})

test('can inherit custom methods', () => {
  const lines = stdNout(() => {
    logger.silly("I'm visible")
    childLogger.silly("I'm visible")
  })
  assert.deepEqual(lines, ["main I'm visible", "main child I'm visible"])
})

test('can create custom methods with setter', () => {
  logger.logFromSetter = console.log

  const lines = stdNout(() => logger.logFromSetter("I'm visible"))
  assert.deepEqual(lines, ["main I'm visible"])
})

test('can inherit custom methods from getter', () => {
  const lines = stdNout(() => {
    logger.logFromSetter("I'm visible")
    childLogger.logFromSetter("I'm visible")
  })
  assert.deepEqual(lines, ["main I'm visible", "main child I'm visible"])
})

test('parents dont inherit log methods from children', () => {
  childLogger.logFromChild = console.log
  assert(childLogger.logFromChild)
  assert(!logger.logFromChild)
})

test('loggers can destructure own and parent log methods', () => {
  assert(Object.keys(grandchildLogger).includes('logFromChild'))
})

test('can use delimiters', () => {
  logger.delimiter = '>'
  const lines = stdNout(() => {
    grandchildLogger.log('hello')
  })
  assert.deepEqual(lines, ['main > child > grandchild > hello'])
})

test('can create custom functions', () => {
  const loggerWithCustomFn = createLogger({ methods: { traceShort: console.log } })
  const lines = stdNout(() => {
    loggerWithCustomFn.traceShort('hello')
  })
  assert.deepEqual(lines, ['hello'])

  test('can inherit custom functions', () => {
    const child = loggerWithCustomFn.createChild()
    const lines = stdNout(() => {
      child.traceShort('hello from child')
    })
    assert.deepEqual(lines, ['hello from child'])
  })

  test('child can have own custom function', () => {
    const child = loggerWithCustomFn.createChild({ methods: { traceDebug: console.log } })
    const lines = stdNout(() => {
      child.traceShort('hello from child fn')
    })
    assert.deepEqual(lines, ['hello from child fn'])

    test('parent cant inherit from child', () => {
      let err
      try {
        loggerWithCustomFn.traceDebug('I should fail')
      } catch (_err) {
        err = _err.toString()
      }
      assert.equal(err, 'TypeError: loggerWithCustomFn.traceDebug is not a function')
    })
  })
})

test('can overwrite native functions', () => {
  const logger = createLogger({
    methods: {
      info: str => {
        console.log('custom info: ' + str)
      },
    },
  })

  const lines = stdNout(() => {
    logger.info('hello world')
  })

  assert.equal(lines.join(), 'custom info: hello world')
})
