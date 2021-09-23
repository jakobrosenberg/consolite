<img src="./consolite.svg" style="width:100%">

## Features
- **It's tiny** - 371 bytes gzip + minify.
- **It preserves line numbers** - so you can find exactly where your code was logged.
- **Prefixing** - provide context for your logs by adding a prefix.
- **Nesting** - sometimes you need to add extra context. This can be handled by creating a child logger
- **Log levels** - log levels can be customized and are inherited by child instances
- **Native console methods** - consolite wraps around `console` so any method available on console will be available on consolite.

## Install
```
npm install consolite
```

## Basic Usage
```javascript
import { createLogger } from 'consolite'

const log = createLog()

log.log('hello world') // prints "hello world"
```


## Examples

### Using prefix
```javascript
const log = createLog('[my-prefix]')

log.log('hello world') // prints "[my-prefix] hello world"
```

### Child logger
Child loggers inherit prefixes, levels and level from their parents.
```javascript
const log = createLog('[parent]')
const childLog = log.createChild('[child]')

log.log('hello world') // prints "[parent] [child] hello world"
```

### Changing log level
```javascript
const log = createLog()

log.debug('hello world') // does nothing
log.level = 4 // 3 by default
log.debug('hello world') // prints "hello world"

```

### Changing default levels
```javascript
const log = createLog()

log.debug('hello world') // does nothing
log.levels.debug = 3 // set debug to match current logging level
log.debug('hello world') // prints "hello world"
```
