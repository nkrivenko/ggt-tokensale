const Token = artifacts.require("GGTToken");
const Oracle = artifacts.require("BinanceOracle");
const GGTPreSale = artifacts.require("GodjiGamePreSaleStep");

const { toWei } = require('web3-utils');
const { BN } = require('bn.js');

module.exports = async function (deployer, network, accounts) {
    if (network !== "testnet") {
        await deployer.deploy(Token, "Godji Game Token", "GGT", new BN(toWei(new BN(50_000_000), 'ether')), { from: accounts[0], overwrite: false });
        await deployer.deploy(Oracle, '0xDA7a001b254CD22e46d3eAB04d937489c93174C3', { from: accounts[0], overwrite: false });
    }

    console.log('Deployed token and oracle');

    const oracle = await (network !== "testnet" ? Oracle.deployed() : Oracle.at('0x751121B82a1E9295472E7cEb3D8224744248A72E'));
    const token = await (network !== "testnet" ? Token.deployed() : Token.at('0xF0A2b01048F6A2DE1606C61bB2832B3a4d10d419'));

    const openDate = +(new Date('2021-11-07T19:34:00+0300')) / 1000;

    const cap = new BN(toWei(new BN("400"), 'ether'));
    const busdThreshold = new BN(toWei(new BN("100"), 'ether'));

    const tokenCap = new BN(toWei(new BN("50000"), 'ether'));

    await deployer.deploy(GGTPreSale, new BN("10000"), accounts[0], token.address, oracle.address, openDate, cap, busdThreshold, busdThreshold.divn(2), tokenCap);

    const presale = await GGTPreSale.deployed();
    await token.addMinter(presale.address, { from: accounts[0] });

    if (network === "testnet") {
        await presale.addWhitelisted(accounts[0]);
        await presale.addWhitelisted('0x1BCfA33EAb47eed85922750dBC3825619A92b4D4');
    }

    console.log(`PreSale contract deployed at ${presale.address}, oracle deployed at ${oracle.address}, token deployed at ${token.address}`);
};
