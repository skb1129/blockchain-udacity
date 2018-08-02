const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Block } = require('./simpleChain');

const app = express();
const port = 8000;

const blockchain = new Blockchain();

app.use(bodyParser.json());

app.post('/requestValidation', (req, res) => {
  const { address } = req.params;
  const requestTimeStamp = Date.now().toString().slice(0, -3);
  const response = {
    address,
    requestTimeStamp,
    message: `${address}:${requestTimeStamp}:starRegistry`,
    validationWindow: 300,
  };
  res.json(response);
});

app.get('/block/:blockHeight', async (req, res) => {
  const block = await blockchain.getBlock(req.params.blockHeight);
  res.json(block);
});

app.post('/block', async (req, res) => {
  const block = await blockchain.addBlock(new Block(req.body.blockData));
  res.json(block);
});

app.listen(port, () => console.log(`Blockchain service running on port: ${port}`));
