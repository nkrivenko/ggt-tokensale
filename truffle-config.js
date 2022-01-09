require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs')

const privateKey = fs.existsSync('.bsc-testnet-secret') ? fs.readFileSync('.bsc-testnet-secret').toString().trim() : null;
const privateKeyMainnet = fs.existsSync('.bsc-mainnet-secret') ? fs.readFileSync('.bsc-mainnet-secret').toString().trim() : null;

module.exports = {

  networks: {

    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 4698712,
      gasPrice: 25000000000,
      defaultBalanceEther: 1000000
    },

    testnet: {
      provider: () => new HDWalletProvider({
        providerOrUrl: `https://data-seed-prebsc-2-s2.binance.org:8545/`,
        privateKeys: [privateKey]
      }),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 99999999
    },

    mainnet: {
      provider: () => new HDWalletProvider({
        providerOrUrl: `https://bsc-dataseed1.binance.org`,
        privateKeys: [privateKeyMainnet]
      }),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },

  mocha: {
    timeout: 100000
  },

  plugins: ["solidity-coverage"],

  compilers: {
    solc: {
      version: "0.5.17",
      docker: false,
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
