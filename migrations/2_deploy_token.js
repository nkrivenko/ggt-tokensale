const Token = artifacts.require("GGTToken");

const { toWei } = require('web3-utils');
const { BN } = require('bn.js');

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(Token, "Godji Game Token", "GGT", new BN(toWei(new BN(50_000_000), 'ether')), { from: accounts[0], overwrite: true });
    const token = await Token.deployed();

    console.log(`Token deployed at ${token.address}`);
}
