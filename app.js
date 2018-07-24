const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;

const { Blockchain, Block } = require('./simpleChain');
const blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/block/:blockHeight', (req, res) => {
  blockchain.getBlock(req.params.blockHeight, block => res.json(block))
})

app.post('/block', (req, res) => {
  blockchain.addBlock(new Block(req.body.blockData));
  blockchain.getBlockHeight(value => blockchain.getBlock(value - 1, block => res.json(block)));
})

app.listen(port, () => console.log(`Blockchain service running on port: ${port}`));
