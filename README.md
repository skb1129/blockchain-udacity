# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

Install all the required packages:

  ```sh
  npm install
  ```

## Testing

To test code:
1. Open a command prompt or shell terminal after install node.js.
2. Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).

```sh
node
```

3. Copy and paste your code into your node session
4. Instantiate blockchain with blockchain variable

```javascript
const blockchain = new Blockchain();
```

5. Generate 10 blocks using a for loop

```javascript
(function theLoop (i) {
  setTimeout(function () {
    blockchain.addBlock(new Block("test data "+i));
    if (--i) theLoop(i);
  }, 100);
})(10);
```

6. Validate blockchain

```javascript
blockchain.validateChain();
```

## Web Service

To run the service:
1. Open a command prompt or shell terminal and run the following command:

```sh
npm run start
```

2. This will run the server on port 8000.
3. GET: The requests can be made on **http://localhost:8000/block/<BLOCK_NUMBER>**.
4. GET request will return the requested block.
5. POST: The requests can be made on **http://localhost:8000/block**.
6. This will create a block in the chain and return that new block.
7. The body of the POST request should contain the block data in **blockData** key. Example:

```javascript
REQUEST_BODY = {
  "blockData": "new block"
}
```
