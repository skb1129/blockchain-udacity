const express = require('express');
const bodyParser = require('body-parser');
const { Blockchain, Block } = require('./simpleChain');
const {
  addressValidationRequest,
  validateSignature,
  checkRegisterStar,
} = require('./addressValidator');
const { hexEncode, hexDecode, jsonError } = require('./utils');

const app = express();
const port = 8000;

const blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/block/:blockHeight', async (req, res) => {
  const block = await blockchain.getBlock(req.params.blockHeight);
  if (block.height) {
    block.body.star.storyDecoded = hexDecode(block.body.star.story);
  }
  res.json(block);
});

app.get('/stars/:identifier', async (req, res) => {
  const { identifier } = req.params;
  const [key, value] = identifier.split(':');
  switch (key) {
    case 'address':
      await blockchain.getBlocksByAddress(value)
        .then((blocks) => {
          blocks.forEach((block) => {
            block.body.star.storyDecoded = hexDecode(block.body.star.story);
          });
          res.json(blocks);
        })
        .catch(error => res.json(error));
      break;

    case 'hash':
      await blockchain.getBlockByHash(value)
        .then((block) => {
          if (block.height) {
            block.body.star.storyDecoded = hexDecode(block.body.star.story);
          }
          res.json(block);
        })
        .catch(error => res.json(error));
      break;

    default:
      res.json(jsonError(400, `Unknown identifier: ${identifier}`));
      break;
  }
});

app.post('/block', async (req, res) => {
  const { address, star } = req.body;
  if (!checkRegisterStar(address)) {
    res.json(jsonError(400, `This address is not validated: ${address}`));
  } else {
    star.story = hexEncode(star.story);
    const block = await blockchain.addBlock(new Block({ address, star }));
    res.json(block);
  }
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
