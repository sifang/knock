module.exports = {
  validateAndUpload,
} 

/**
 * validate, transform, and upload a mls data. returns a Promise with transformed data.
 * @param {*} mls_data 
 */
function validateAndUpload(mls_data) {
  return validate(mls_data).then(transformed_data => {
    return upload(transformed_data);
  })
}

/**
 * upload data to endpoint, returns a Promise with uploaded data 
 */
function upload(msl_data) {
  const mls_id = msl_data['mls_id'];
  
  // @dev override url once 
  const nock = require('nock');
  nock("https://knock-crm.io/customer")
    .post(`/${mls_id}/properties`, {data: msl_data} )
    .reply(200, msl_data);

  // @dev make the http call
  const rp = require('request-promise');
  var options = {
    method: 'POST',
    uri: `https://knock-crm.io/customer/${mls_id}/properties`,
    body: {
      data: msl_data
    },
    json: true // Automatically stringifies the body to JSON
  };
  return rp(options);
}

/**
 * validate and transform data from ga_fmls or ncsc_cmls. other format not supported 
 * returns the transformed data as a Promise. if validation fails then return Reject
 * @param {object} mls_data data from mls source 
 */
function validate(mls_data) {
  return validateGa_fmls(mls_data).then(res => {
    return Promise.resolve(res);
  }).catch(err => {
    // console.log("ga_fmls failed, try ncsc_cmls")
    return validateNcsc_cmls(mls_data);
  })
}

/**
 * validate and transform data from ga_fmls. 
 * returns the transformed data as a Promise. if validation fails then return Reject
 * @param {object} mls_data data from mls source 
 */
function validateGa_fmls(mls_data) {
  const Joi = require('joi');
  const schema = Joi.object().keys({
    data_name: Joi.string().valid('ga_fmls').required().strip(),
    vendor_id: Joi.number().required().strip(),
    address_components: Joi.object().keys({
      street_number: Joi.number().required(),
      street_name: Joi.string().required(),
      street_suffix: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipcode: Joi.number().required().min(00501).max(99950),
    }).required().unknown(true),
    list: Joi.string().required(),
    date: Joi.string().isoDate().required(),
    property: Joi.object().keys({
      bed_count: Joi.number(),
      bath_count: Joi.number(),
      half_bath_count: Joi.number(),
      square_feet: Joi.number(),
    }).unknown(true),
  })
  .rename('data_name', 'mls_name', {alias: true})
  .rename('vendor_id', 'mls_id', {alias: true})
  .unknown(true)
  
  return Joi.validate(mls_data, schema, {convert: true}).then(res => {
    res['mls_id'] = Number(res['mls_id']);
    res['street_address'] = res['address_components']['street_number'] + ' ' 
      + res['address_components']['street_name'] + ' ' + res['address_components']['street_suffix'];
    res['city'] = res['address_components']['city'];
    res['state'] = res['address_components']['state'];
    res['zip_code'] = parseInt(res['address_components']['zipcode']);
    // @dev delete can be slow, future optimization may be needed 
    delete res.address_components; 

    res['list_price'] = parseMoney(res['list']);
    delete res.list;

    res['list_date'] = Number((Date.parse(res['date']) / 1000).toFixed(0));
    delete res.date;

    if (res['property']) {
      res['bedrooms'] = parseInt(res['property']['bed_count']);
      res['full_baths'] = parseInt(res['property']['bath_count']);
      res['half_baths'] = parseInt(res['property']['half_bath_count']);
      res['size'] = parseInt(res['property']['square_feet']);
      delete res.property; 
    }
    return Promise.resolve(res);
  })
}

/**
 * validate and transform data from ncsc_cmls. 
 * returns the transformed data as a Promise. if validation fails then return Reject
 * @param {object} mls_data data from mls source 
 */
function validateNcsc_cmls(mls_data) {
  const Joi = require('joi');
  const schema = Joi.object().keys({
    name: Joi.string().valid('ncsc_cmls').required().strip(),
    id: Joi.number().required().strip(),
    geo: Joi.object().keys({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zip: Joi.number().required().min(00501).max(99950),
    }).required().unknown(true),
    listing: Joi.object().keys({
      price: Joi.string().required(),
      bedrooms: Joi.number(),
      bathrooms: Joi.number(),
      square_feet: Joi.number(),
    }).required().unknown(true),
    created: Joi.string().required(),
  })
  .rename('name', 'mls_name', {alias: true})
  .rename('id', 'mls_id', {alias: true})
  .unknown(true)
  
  return Joi.validate(mls_data, schema).then(res => {
    res['mls_id'] = Number(res['mls_id']);
    res['street_address'] = res['geo']['address'];
    res['city'] = res['geo']['city'];
    res['state'] = res['geo']['state'];
    res['zip_code'] = parseInt(res['geo']['zip']);
    // @dev delete can be slow, future optimization may be needed 
    delete res.geo; 

    res['list_price'] = parseMoney(res['listing']['price']);
    
    res['list_date'] = Number((Date.parse(res['created']) / 1000).toFixed(0));
    delete res.created;

    res['bedrooms'] = parseInt(res['listing']['bedrooms']);
    res['full_baths'] = parseInt(res['listing']['bathrooms']);
    res['size'] = parseInt(res['listing']['square_feet']);
    delete res.listing; 
    
    return Promise.resolve(res);
  })
}


function parseMoney(str) {
  return parseInt(str.replace(/[^0-9-.]/g, ''));
}