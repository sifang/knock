module.exports = {
  altStrings,
}

/**
 * Alternate 2 strings, For example you have two strings 
 * abc and stuvwx. 
 * Alternating between the two you should return asbtcuvwx
 * @param {String} a 
 * @param {String} b 
 * @returns {String}
 */
function altStrings(a, b) {
  var res = '';
  for(var i=0; i<a.length; i++) {
    res = res + a.charAt(i);
    if (i < b.length) {
      res = res + b.charAt(i);
    }
  }
  if (i < b.length) {
    res = res + b.substr(i);
  }
  return res;
}