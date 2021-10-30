const TokenCappedCrowdsale = artifacts.require("TokenCappedCrowdsaleImpl");
const ERC20 = artifacts.require("GGTToken");

import { expectRevert, ether } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("TokenCappedCrowdsale", function ([funder, owner, user, fundingWallet]) {

    const RATE = new BN("1");

    const TOKEN_NAME = "Godji Game Token";
	const TOKEN_SYMBOL = "GGT";
    const TOKEN_CAP = ether("50000000");

    const CROWDSALE_TOKEN_HARDCAP = ether("10");

    const SINGLE_ETHER = ether('1');

    beforeEach(async function() {
        this.token = await ERC20.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP, owner);
        this.crowdsale = await TokenCappedCrowdsale.new(RATE, fundingWallet, this.token.address, CROWDSALE_TOKEN_HARDCAP);

        await this.token.addMinter(this.crowdsale.address, { from: owner });
    });

    it('should create the contract with correct fields', async function() {
        this.crowdsale.should.exist;

        CROWDSALE_TOKEN_HARDCAP.should.be.bignumber.equal(await this.crowdsale.tokenCap());
    });

    it('should not create the contract with zero token hardcap', async function() {
        await expectRevert(TokenCappedCrowdsale.new(RATE, fundingWallet, this.token.address, new BN("0")),
            "TokenCappedCrowdsale: Token cap is 0");
    });

    it('should accept a deposit if token hardcap is not violated', async function() {
        await this.crowdsale.send(SINGLE_ETHER, {from: user}).should.be.fulfilled;
        await this.crowdsale.send(SINGLE_ETHER.mul(new BN("9")), {from: user}).should.be.fulfilled;
    });

    it('should not accept a deposit if token hardcap is violated', async function() {
        await this.crowdsale.send(SINGLE_ETHER, {from: user}).should.be.fulfilled;
        await this.crowdsale.send(SINGLE_ETHER.mul(new BN("9")), {from: user}).should.be.fulfilled;

        await expectRevert(this.crowdsale.send(new BN("1"), {from: user}), "TokenCappedCrowdsale: token cap exceeded");
    });

    it('should change the tokens minted after every successful transaction', async function() {
        await this.crowdsale.send(SINGLE_ETHER, {from: user}).should.be.fulfilled;

        const userTokenBalance = await this.token.balanceOf(user);

        userTokenBalance.should.be.bignumber.equal(await this.crowdsale.tokensMinted());
    });
});
