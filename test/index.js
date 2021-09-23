const { createLogger } = require("../");
const assert = require("assert");
const { test, stdNout } = require("./utils");

const logger = createLogger("main");
const childLogger = logger.createChild("child");
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

test('can change default of logger', ()=>{
    const lines = stdNout(()=> {
        logger.debug('still shows')
        logger.levels.debug = 10
        logger.debug('no longer shows')
    })
    assert.deepEqual(lines, ['main still shows'])
})

test('inherits defaults', ()=>{
    const lines = stdNout(()=> {
        childLogger.debug('no longer shows')
    })
    assert.deepEqual(lines, [])
})