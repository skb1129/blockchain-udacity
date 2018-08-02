const level = require('level');
const bitcoinMessage = require('bitcoinjs-message');

const chainDB = './addressData';
const db = level(chainDB);

const addressValidationRequest = async (address) => {
  const requestTimeStamp = Date.now().toString().slice(0, -3);
  const response = {
    address,
    requestTimeStamp,
    message: `${address}:${requestTimeStamp}:starRegistry`,
    validationWindow: 300,
  };
  try {
    await db.put(address, JSON.stringify(response));
  } catch (error) {
    console.log(`Error creating entry for address ${address}`, error);
  }
  return response;
};

const validateSignature = async (address, signature) => {
  let status = {};
  try {
    status = JSON.parse(await db.get(address));
  } catch (error) {
    console.log(`Error fetching data for address ${address}`, error);
  }
  const { message } = status;
  const validationWindow = Math.floor(Date.now() / 1000) - JSON.parse(status.requestTimeStamp);
  if (validationWindow <= 0) {
    try {
      await db.del(address);
    } catch (error) {
      console.log(`Error deleting entry for address ${address}`, error);
    }
    return {
      error: 'Validation window is closed, please request validation again.',
    };
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
      await db.put(address, response);
    } catch (error) {
      console.log(`Error updating entry for address ${address}`, error);
    }
  }
  return response;
};

const checkRegisterStar = async (address) => {
  let data = {};
  try {
    data = JSON.stringify(await db.get(address));
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

exports.addressValidationRequest = addressValidationRequest;
exports.validateSignature = validateSignature;
exports.checkRegisterStar = checkRegisterStar;
