const hexEncode = string => Buffer.from(string).toString('hex');

const hexDecode = hex => Buffer.from(hex, 'hex').toString();

const jsonError = (code, message) => ({ error: { code, message } });

exports.hexEncode = hexEncode;
exports.hexDecode = hexDecode;
exports.jsonError = jsonError;
