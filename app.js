const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Block } = require('./simpleChain');
const {
  addressValidationRequest,
  validateSignature,
  checkRegisterStar,
} = require('./addressValidator');

const app = express();
const port = 8000;

const blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/block/:blockHeight', async (req, res) => {
  const block = await blockchain.getBlock(req.params.blockHeight);
  res.json(block);
});

app.post('/block', async (req, res) => {
  const { address, star } = req.body;
  if (!checkRegisterStar(address)) {
    res.json({
      error: 'This address is not validated',
      address,
    });
  }
  const data = { address, star };
  const block = await blockchain.addBlock(new Block(data));
  res.json(block);
});

app.post('/requestValidation', async (req, res) => {
  const { address } = req.body;
  const response = await addressValidationRequest(address);
  res.json(response);
});

app.post('/message-signature/validate', async (req, res) => {
  const { address, signature } = req.body;
  const response = await validateSignature(address, signature);
  res.json(response);
});

app.listen(port, () => console.log(`Blockchain service running on port: ${port}`));
