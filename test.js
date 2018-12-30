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
  const input = {
    "data_name": "ga_fmls",
    "vendor_id": "76257",
    "address_components": {
      "address": "176 Milton Ave, Atlanta, GA 30317",
      "street_name": "Milton",
      "street_number": "176",
      "street_suffix": "Ave",
      "city": "Atlanta",
      "state": "GA",
      "zipcode": "30317"
    },
    "list": "$275,000",
    "date": "2018-05-02T04:19:27-04:00",
    "property": {
      "bed_count": "3",
      "bath_count": "2",
      "half_bath_count": "1",
      "square_feet": "2300"
    }
  };
  const expected = { mls_name: 'ga_fmls',
    mls_id: 76257,
    street_address: '176 Milton Ave',
    city: 'Atlanta',
    state: 'GA',
    zip_code: 30317,
    list_price: 275000,
    list_date: 1525249167,
    bedrooms: 3,
    full_baths: 2,
    half_baths: 1,
    size: 2300 };

  return mls.validateAndUpload(input).then(res => {
    return tap.test("Check results for ga_fmls data", (tap) => {
      tap.strictSame(res, expected);
      tap.end() 
    })
  })
}).then( () => {
  const input = {
    "name": "ncsc_cmls",
    "id": "53728",
    "geo": {
      "address": "256 Old Mill",
      "city": "Charlotte",
      "state": "NC",
      "zip": "28269"
    },
    "listing": {
      "price": "299,999.00",
      "bedrooms": "4",
      "bathrooms": "3",
      "square_feet": "1975"
    },
    "created": "2018-05-14 03:00:00 EST"
  };

  const expected = { mls_name: 'ncsc_cmls',
    mls_id: 53728,
    street_address: '256 Old Mill',
    city: 'Charlotte',
    state: 'NC',
    zip_code: 28269,
    list_price: 299999,
    list_date: 1526284800,
    bedrooms: 4,
    full_baths: 3,
    size: 1975 };

  return mls.validateAndUpload(input).then(res => {
    return tap.test("Check results for ncsc_cmls data", (tap) => {
      tap.strictSame(res, expected);
      tap.end() 
    })
  })
})
