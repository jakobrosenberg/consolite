const { createLogger, Consolite } = require("../cjs");
const assert = require("assert");
const { test, stdNout } = require("./utils");

const logger = new Consolite('main');
const childLogger = logger.createChild("child");
const grandchildLogger = childLogger.createChild("grandchild");
const parentLogger = logger.createParent("parent");

test("can create logger", () => {
  const lines = stdNout(() => {
    logger.log("foo bar");
  });
  assert.deepEqual(lines, ["main foo bar"]);
});

test("can create child logger", () => {
  const lines = stdNout(() => {
    childLogger.log("foo bar");
  });
  assert.deepEqual(lines, ["main child foo bar"]);
});

test("can create parent logger", () => {
  const lines = stdNout(() => {
    parentLogger.log("foo bar");
  });
  assert.deepEqual(lines, ["parent main foo bar"]);
});

test("can set level", () => {
  const lines = stdNout(() => {
    logger.debug("no show");
    logger.level = 4;
    logger.debug("do show");
  });
  assert.deepEqual(lines, ["main do show"]);
});

test("inherits level", () => {
  const lines = stdNout(() => {
    childLogger.debug("do show");
  });
  assert.deepEqual(lines, ["main child do show"]);
});

test("can override inherited level", () => {
  const lines = stdNout(() => {
    childLogger.level = 3;
    childLogger.debug("no longer shows");
    logger.debug("still shows");
  });
  assert.deepEqual(lines, ["main still shows"]);
});

test("can change default of logger", () => {
  const lines = stdNout(() => {
    logger.debug("still shows");
    logger.levels.debug = 10;
    logger.debug("no longer shows");
  });
  assert.deepEqual(lines, ["main still shows"]);
});

test("inherits defaults", () => {
  const lines = stdNout(() => {
    childLogger.debug("no longer shows");
  });
  assert.deepEqual(lines, []);
});

test('new logger is its own root', ()=>{
  assert.equal(logger.root, logger)
})

test("children can find root", () => {
  assert.equal(childLogger.root, logger);
  assert.equal(grandchildLogger.root, logger);
});

test('new parent is its own root', ()=>{
  assert.equal(parentLogger.root, parentLogger)
})

test("can filter by string", () => {
  const lines = stdNout(() => {
    childLogger.log("show me");
    childLogger.root.filter = 'grandchild'
    childLogger.log("im filtered out");
    grandchildLogger.log('i can still post')
  });
  childLogger.root.filter = null
  assert.deepEqual(lines, ['main child show me', 'main child grandchild i can still post'])
});

test("can filter by function", () => {
  const lines = stdNout(() => {
    childLogger.log("show me");
    childLogger.root.filter = prefixes => prefixes.includes('grandchild')
    childLogger.log("im filtered out");
    grandchildLogger.log('i can still post')
  });
  assert.deepEqual(lines, ['main child show me', 'main child grandchild i can still post'])
});
