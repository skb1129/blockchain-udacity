/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
  constructor(data){
    this.hash = "",
    this.height = 0,
    this.body = data,
    this.time = 0,
    this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    db.get(0, (error) => {
      if (error && error.type === 'NotFoundError') {
        this.addBlock(new Block("First block in the chain - Genesis block"));
      } else if (error) {
        console.log('Error getting data from DB', error);
      }
    });
  }

  // Add new block
  addBlock(newBlock){
    this.getBlockHeight((chainHeight) => {
      if (chainHeight > 0) {
        this.getBlock(chainHeight - 1, (prevBlock) => {
          newBlock.previousBlockHash = prevBlock.hash;
          newBlock.height = chainHeight;
          newBlock.time = new Date().getTime().toString().slice(0,-3);
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
          const block = JSON.stringify(newBlock);
          db.put(newBlock.height, block, (error, value) => {
            if (error) {
              console.log(`Block ${newBlock.height} submission failed.`, error);
            } else {
              console.log(`Block ${newBlock.height} added successfully.`);
            }
          });
        });
      } else {
        newBlock.height = chainHeight;
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        const block = JSON.stringify(newBlock);
        db.put(newBlock.height, block, (error, value) => {
          if (error) {
            console.log(`Block ${newBlock.height} submission failed.`, error);
          } else {
            console.log(`Block ${newBlock.height} added successfully.`);
          }
        });
      }
    });
  }

  // Get block height
  getBlockHeight(callback){
    let chainHeight = 0;
    db.createReadStream().on('data', (data) => {
      chainHeight++;
    }).on('error', (error) => {
      console.log('Unable to read data stream!', error)
    }).on('close', () => {
      callback(chainHeight);
    });
  }

  // get block
  getBlock(blockHeight, callback){
    db.get(blockHeight, (error, value) => {
      if (error) {
        console.log('Error getting data from DB', error);
      } else {
        callback(JSON.parse(value));
      }
    });
  }

  // validate block
  validateBlock(block, callback){
    const testBlock = { ...block, hash: '' };
    let blockHash = block.hash;
    let validBlockHash = SHA256(JSON.stringify(testBlock)).toString();
    if (blockHash===validBlockHash) {
      callback(true);
    } else {
      console.log(`Block #${block.height} invalid hash:\n${blockHash}<>${validBlockHash}`);
      callback(false);
    }
  }

  // Validate blockchain
  validateChain(){
    let errorLog = [];
    let prevBlock = new Block('Temporary');
    this.getBlockHeight((chainHeight) => {
      for(let i = 0; i < chainHeight; i++){
        this.getBlock(i, (block) => {
          console.log('Validating Block: ', block.height);
          this.validateBlock(block, (isValid) => {
            if (!isValid) {
              errorLog.push(block.height);
            }
          });
          if (block.height > 0) {
            const { previousBlockHash } = block;
            const { hash } = prevBlock;
            if ( previousBlockHash !== hash) {
              errorLog.push(prevBlock.height);
            }
          }
          prevBlock = block;
          if (i === chainHeight - 1 && errorLog.length>0) {
            console.log(`Block errors = ${errorLog.length}`);
            console.log(`Blocks: ${errorLog}`);
          } else if (i === chainHeight - 1) {
            console.log('No errors detected');
          }
        });
      }
    });
  }
}

exports.Blockchain = Blockchain;
exports.Block = Block;
