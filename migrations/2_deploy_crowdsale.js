const Token = artifacts.require("GGTToken");
const Oracle = artifacts.require("BinanceOracle");
const GGTPreSale = artifacts.require("GodjiGamePreSaleStep");

const { toWei } = require('web3-utils');
const { BN } = require('bn.js');

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Token, "Godji Game Token", "GGT", new BN(toWei(new BN(50_000_000), 'ether')), accounts[0], {from: accounts[0], overwrite: false});
  await deployer.deploy(Oracle, '0xDA7a001b254CD22e46d3eAB04d937489c93174C3', {from: accounts[0], overwrite: false});

  console.log('Deployed token and oracle');

  const oracle = await Oracle.deployed();
  const token = await Token.deployed();
  await deployer.deploy(GGTPreSale, new BN("1"), accounts[0], token.address, accounts[0], oracle.address);

  const presale = await GGTPreSale.deployed();
  await token.addMinter(presale.address, {from: accounts[0]});

  console.log(`PreSale contract deployed at ${presale.address}, oracle deployed at ${oracle.address}, token deployed at ${token.address}`);
};
