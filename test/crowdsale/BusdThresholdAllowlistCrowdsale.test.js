const BnbThresholdAllowlistCrowdsale = artifacts.require("BusdThresholdAllowlistCrowdsaleImpl");
const Oracle = artifacts.require("BinanceOracleImpl");
const ERC20 = artifacts.require("GGTToken");

import { expectRevert, ether } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("BusdThresholdAllowlistCrowdsale", function ([funder, owner, user, wallet]) {

    const RATE = new BN("2");
    const TOKEN_NAME = "Godji Game Token";
    const TOKEN_SYMBOL = "GGT";
    const TOKEN_CAP = ether("50000000");
    const BUSD_CAP = ether('1000000');

    const BNBBUSD = ether('500');
    const BNBBUSD_THRESHOLD = ether('10000');

    const SINGLE_ETHER = ether('1');

    beforeEach(async function () {
        this.token = await ERC20.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP, {from: owner});
        this.oracle = await Oracle.new(BNBBUSD);
        this.crowdsale = await BnbThresholdAllowlistCrowdsale.new(RATE, wallet, this.token.address, this.oracle.address, BNBBUSD_THRESHOLD, owner, BUSD_CAP);

        this.token = await ERC20.at(await this.crowdsale.token());

        await this.token.addMinter(this.crowdsale.address, { from: owner });
        await this.crowdsale.addWhitelisted(user, { from: owner });
    });

    it("should create the contract with provided parameters", async function() {
        this.token.should.exist;
        this.crowdsale.should.exist;

        RATE.should.be.bignumber.equal(await this.crowdsale.rate());
        wallet.should.be.equal(await this.crowdsale.wallet());
        this.token.address.should.be.equal(await this.crowdsale.token());
        BNBBUSD_THRESHOLD.should.be.bignumber.equal(await this.crowdsale.busdThreshold());
    });

    it("should reject any payment below threshold", async function() {
        const paymentBelowThreshold = BNBBUSD_THRESHOLD.div(BNBBUSD).mul(SINGLE_ETHER).subn(1);

        await expectRevert(this.crowdsale.send(paymentBelowThreshold, { from: user }), "BusdThresholdAllowlistCrowdsale: payment is below threshold");
    });

    it("should accept the payment above the threshold if payer is in allowlist", async function() {
        const paymentAboveThreshold = BNBBUSD_THRESHOLD.div(BNBBUSD).mul(SINGLE_ETHER).addn(1);

        const oldBalance = new BN(await web3.eth.getBalance(wallet));
        await this.crowdsale.send(paymentAboveThreshold, { from: user });
        const newBalance = new BN(await web3.eth.getBalance(wallet));

        paymentAboveThreshold.should.be.bignumber.equal(newBalance.sub(oldBalance));
    });

    it("should revert the payment above the threshold if payer is not in allowlist", async function() {
        const paymentAboveThreshold = BNBBUSD_THRESHOLD.div(BNBBUSD).mul(SINGLE_ETHER).addn(1);

        await expectRevert(this.crowdsale.send(paymentAboveThreshold, { from: wallet }), "BusdThresholdAllowlistCrowdsale: address is not allowlisted");
    });

    it("should revert if trying to add whitelisted role for user without whitelistadmin role", async function() {
        await expectRevert(this.crowdsale.addWhitelisted(funder, {from: user}), "WhitelistAdminRole: caller does not have the WhitelistAdmin role");
    });
});
