const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Block } = require('./simpleChain');

const app = express();
const port = 8000;

const blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/block/:blockHeight', async (req, res) => {
  const block = await blockchain.getBlock(req.params.blockHeight);
  res.json(block);
});

app.post('/block', async (req, res) => {
  const block = await blockchain.addBlock(new Block(req.body.blockData));
  res.json(block);
});

app.post('/requestValidation', async (req, res) => {
  const { address } = req.body;
  const response = await blockchain.addressValidationRequest(address);
  res.json(response);
});

app.post('/message-signature/validate', async (req, res) => {
  const { address, signature } = req.body;
  const response = await blockchain.validateSignature(address, signature);
  res.json(response);
});

app.listen(port, () => console.log(`Blockchain service running on port: ${port}`));
