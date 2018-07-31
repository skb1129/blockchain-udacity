/**
 * SHA256 with Crypto-js
 * Learn more: Crypto-js: https://github.com/brix/crypto-js
 */
const SHA256 = require('crypto-js/sha256');
const level = require('level');

const chainDB = './chaindata';
const db = level(chainDB);

/**
 * Block Class
 * Class with a constructor for block
 */
class Block {
  constructor(data) {
    this.hash = '';
    this.height = 0;
    this.body = data;
    this.time = 0;
    this.previousBlockHash = '';
  }
}

/**
 * Blockchain Class
 * Class with a constructor for new blockchain
 */
class Blockchain {
  constructor() {
    this.initBlockchain();
  }

  async initBlockchain() {
    try {
      await db.get(0);
    } catch (error) {
      if (error.notFound) {
        this.addBlock(new Block('First block in the chain - Genesis block'));
      } else {
        console.log('Error getting data from DB', error);
      }
    }
  }

  // Add new block
  async addBlock(newBlock) {
    let chainHeight = 0;
    await this.getBlockHeight().then((value) => {
      chainHeight = value;
    });
    if (chainHeight >= 0) {
      const prevBlock = await this.getBlock(chainHeight);
      newBlock.previousBlockHash = prevBlock.hash;
    }
    newBlock.height = chainHeight + 1;
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    const block = JSON.stringify(newBlock);
    try {
      await db.put(newBlock.height, block);
      console.log(`Block ${newBlock.height} added successfully.`);
    } catch (error) {
      console.log(`Block ${newBlock.height} submission failed.`, error);
    }
    return newBlock;
  }

  // Get block height
  async getBlockHeight() {
    return new Promise((resolve, reject) => {
      let chainHeight = 0;
      db.createReadStream().on('data', () => {
        chainHeight += 1;
      }).on('error', (error) => {
        console.log('Unable to read data stream!', error);
        reject();
      }).on('close', () => {
        resolve(chainHeight - 1);
      });
    });
  }

  // get block
  async getBlock(blockHeight) {
    try {
      const data = await db.get(blockHeight);
      return JSON.parse(data);
    } catch (error) {
      console.log('Error getting data from DB', error);
      return null;
    }
  }

  // validate block
  validateBlock(block) {
    const testBlock = { ...block, hash: '' };
    const blockHash = block.hash;
    const validBlockHash = SHA256(JSON.stringify(testBlock)).toString();
    if (blockHash === validBlockHash) {
      return true;
    }
    console.log(`Block #${block.height} invalid hash:\n${blockHash}<>${validBlockHash}`);
    return false;
  }

  // Validate blockchain
  async validateChain() {
    const errorLog = [];
    let chainHeight = 0;
    await this.getBlockHeight().then((value) => {
      chainHeight = value;
    });

    for (let i = 0; i <= chainHeight; i += 1) {
      const block = await this.getBlock(i);
      console.log('Validating Block: ', block.height);
      const isValid = this.validateBlock(block);

      if (!isValid) {
        errorLog.push(block.height);
      } else if (block.height > 0) {
        const prevBlock = await this.getBlock(i - 1);
        const { previousBlockHash } = block;
        const { hash } = prevBlock;
        if (previousBlockHash !== hash) {
          errorLog.push(prevBlock.height);
        }
      }

      if (i === chainHeight && errorLog.length > 0) {
        console.log(`Block errors = ${errorLog.length}`);
        console.log(`Blocks: ${errorLog}`);
      } else if (i === chainHeight) {
        console.log('No errors detected');
      }
    }
  }
}

exports.Blockchain = Blockchain;
exports.Block = Block;
