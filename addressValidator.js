const level = require('level');
const bitcoinMessage = require('bitcoinjs-message');
const { jsonError } = require('./utils');

const chainDB = './addressData';
const db = level(chainDB);

const VALIDATION_WINDOW = 300;

const addressValidationRequest = async (address) => {
  const requestTimeStamp = Date.now().toString().slice(0, -3);
  const response = {
    address,
    requestTimeStamp,
    message: `${address}:${requestTimeStamp}:starRegistry`,
    validationWindow: VALIDATION_WINDOW,
  };
  try {
    await db.put(address, JSON.stringify(response));
  } catch (error) {
    console.log(`Error creating entry for address ${address}`, error);
    return jsonError(502, `Unable to connect to database, please try again: ${error}`);
  }
  return response;
};

const validateSignature = async (address, signature) => {
  let status = {};
  try {
    status = JSON.parse(await db.get(address));
  } catch (error) {
    if (error.notFound) {
      return jsonError(404, `Validation request not found for address: ${address}`);
    }
    console.log(`Error fetching data for address ${address}`, error);
    return jsonError(502, `Unable to connect to database, please try again: ${error}`);
  }
  const { message } = status;
  const validationWindow = VALIDATION_WINDOW - Math.floor(Date.now() / 1000)
    + JSON.parse(status.requestTimeStamp);
  if (validationWindow <= 0) {
    try {
      await db.del(address);
    } catch (error) {
      console.log(`Error deleting entry for address ${address}`, error);
      return jsonError(502, `Unable to connect to database, please try again: ${error}`);
    }
    return jsonError(400, 'Validation window is closed, please request validation again.');
  }
  const isValid = bitcoinMessage.verify(message, address, signature);
  const response = {
    registerStar: isValid,
    status: {
      ...status,
      validationWindow,
      messageSignature: isValid ? 'valid' : 'invalid',
    },
  };
  if (isValid) {
    try {
      await db.put(address, JSON.stringify(response));
    } catch (error) {
      console.log(`Error updating entry for address ${address}`, error);
      return jsonError(502, `Unable to connect to database, please try again: ${error}`);
    }
  }
  return response;
};

const checkRegisterStar = async (address) => {
  let data = {};
  try {
    data = JSON.parse(await db.get(address));
  } catch (error) {
    if (error.notFound) {
      return false;
    }
    console.log(`Error fetching data for address ${address}`, error);
  }
  if (data.registerStar) {
    return true;
  }
  return false;
};

const checkValidStar = (star) => {
  if (!star.ra) {
    return jsonError(400, 'Star right ascension parameter not provided.');
  }
  if (!star.dec) {
    return jsonError(400, 'Star declination parameter not provided.');
  }
  if (!star.story) {
    return jsonError(400, 'Star story parameter not provided.');
  }
  if (star.story.length > 250) {
    return jsonError(400, 'Star story length exceeds 250 character limit.');
  }
  return false;
};

exports.addressValidationRequest = addressValidationRequest;
exports.validateSignature = validateSignature;
exports.checkRegisterStar = checkRegisterStar;
exports.checkValidStar = checkValidStar;
