const hexEncode = string => Buffer.from(string).toString('hex');

const hexDecode = hex => Buffer.from(hex, 'hex').toString();

exports.hexEncode = hexEncode;
exports.hexDecode = hexDecode;
