const tap = require('tap')
const altStr = require("./altStrings");
const mls = require("./mls");

tap.test('Test alternate strings #1', tap => {
  var inputs = ['abc', 'stuvwx'];
  var expected = 'asbtcuvwx';
  var res = altStr.altStrings(inputs[0], inputs[1]);
  tap.strictSame(res, expected);
  tap.end();
});

tap.test('Test alternate strings #2', tap => {
  var inputs = ['abcdef', '123'];
  var expected = 'a1b2c3def';
  var res = altStr.altStrings(inputs[0], inputs[1]);
  tap.strictSame(res, expected);
  tap.end();
});

tap.test('Test MLS data', (tap) => {
  const input = require("./test-data/mls_a.json");
  const expected = require("./test-data/mls_a_expected.json");

  return mls.validateAndUpload(input).then(res => {
    return tap.test("Check results for ga_fmls data", (tap) => {
      tap.strictSame(res, expected);
      tap.end() 
    })
  })
}).then( () => {
  const input = require("./test-data/mls_b.json");
  const expected = require("./test-data/mls_b_expected.json");

  return mls.validateAndUpload(input).then(res => {
    return tap.test("Check results for ncsc_cmls data", (tap) => {
      tap.strictSame(res, expected);
      tap.end() 
    })
  })
})
