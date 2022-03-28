import { createLogger } from "../esm/index.mjs"

// todo find a way to test this

/** @ExpectType const cl2: ConsoliteLogger<ExtendConsole, Console & {
      foo: (t1: any) => string;
      bar: (b1: any) => string;
  }>
*/
const cl2 = createLogger(
    { methods: { foo: t1 => 'bar', bar: b1 => 'bar' } },
    'p1',
    'p2',
    'p3',
  )
  
  // $ExpectType (property) bar: (b1: any) => string
  cl2.bar
  // $ExpectType (property) bar: (t1: any) => string
  cl2.foo
 
  /**
    $ExpectType const child: ConsoliteLogger<ConsoliteLogger<ExtendConsole, Console & {
        foo: (t1: any) => string;
        bar: (b1: any) => string;
    }>, {
        bar: (b2: any) => string;
        childMethod: (c1: any) => string;
    }>
   */
  const child = cl2.createChild({
    methods: { bar: b2 => 'bar', childMethod: c1 => 'fooo' },
  })

  /**
    $ExpectType const child2: ConsoliteLogger<ConsoliteLogger<ExtendConsole, Console & {
        foo: (t1: any) => string;
        bar: (b1: any) => string;
    }>, {
        [x: string]: (...prefix: any[]) => string;
    }>
   */
  const child2 = cl2.createChild('a', 'b')
  
  // $ExpectType (property) foo: (t1: any) => string
  child.foo
  // $ExpectType (property) bar: ((b1: any) => string) & ((b2: any) => string)
  child.bar
  // $ExpectType (property) childMethod: (c1: any) => string
  child.childMethod
  
  // $ExpectType (property) foo: (t1: any) => string
  child2.foo
  // $ExpectType (property) foo: (b1: any) => string
  child2.bar
  