module.exports = {

  networks: {

    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 4698712,
      gasPrice: 25000000000
    }
  },

  mocha: {
    timeout: 100000
  },

  plugins: ["solidity-coverage"],

  compilers: {
    solc: {
      version: "0.5.5",
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
