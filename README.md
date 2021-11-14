# GGT Crowdsale

[![CircleCI](https://circleci.com/gh/nkrivenko/ggt-tokensale/tree/master.svg?style=svg)](https://circleci.com/gh/nkrivenko/ggt-tokensale/tree/master)
[![codecov](https://codecov.io/gh/nkrivenko/ggt-tokensale/branch/master/graph/badge.svg?token=NE1FEJV34A)](https://codecov.io/gh/nkrivenko/ggt-tokensale)

## Key dependencies

1. Binance Smart Chain as a base for infrastructure
2. Truffle for development purposes
3. OpenZeppelin framework

## Project summary

The project contains three smart contracts:
- The [BEP20](https://github.com/binance-chain/BEPs/blob/master/BEP20.md) GGT token
- The [Band Protocol Price Feed](https://docs.binance.org/smart-chain/developer/oracle/band.html) client
- The Presale smart contract

## Presale functionality summary

The main features are:

- Presale has an opening date (any deposit to the contract before an opening date will be reverted)
- BUSD hardcap supported (with a small acceptable delta above the hardcap)
- GGT distribution hardcap is supported (No more than X GGT per address at current step)
- Only whitelisted addresses can deposit BNBs
- Minimal deposit amount supported

## Token Pricing

The GGT token price during the presale step should be calculated by the following formula:

![GGT.BNB Formula](https://latex.codecogs.com/svg.image?GGT.BNB&space;=&space;\frac{BNB.BUSD}{GGT.BUSD})

## How to launch or deploy

First, install the dependencies:

```
$ npm install
```

The project provides some scripts:

```
$ npm test # truffle test
$ npm run lint # runs solhint
$ npm run deploy-testnet # runs migrations on testnet (see below on details)
$ npm run coverage # runs solidity-coverage 
```

### Deploying the contracts to testnet

To deploy the contract to testnet, the following should be done:

1. Create `.bsc-testnet-secret` file with a testnet private key in it. This file is in `.gitignore` so it won't be commited.
2. Launch the `npm run deploy-testnet` script
3. After the testnet migrations are fulfilled, the contracts are available on the addresses printed to stdout.
