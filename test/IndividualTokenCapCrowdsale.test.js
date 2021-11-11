const IndividualTokenCapCrowdsaleImpl = artifacts.require("IndividualTokenCapCrowdsaleImpl");
const ERC20 = artifacts.require("GGTToken");

import { ether, expectRevert } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();

contract("IndividualTokenCapCrowdsaleImpl", function ([owner, user, wallet]) {

    const RATE = new BN("25000");
    const TOKEN_NAME = "Godji Game Token";
    const TOKEN_SYMBOL = "GGT";
    const TOKEN_CAP = ether("50000000");
    const PRESALE_MAX_TOKENS_CAP = ether("50000");

    const SINGLE_ETHER = ether('1');

    beforeEach(async function () {
        this.token = await ERC20.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP, { from: owner });
        this.crowdsale = await IndividualTokenCapCrowdsaleImpl.new(RATE, wallet, this.token.address, PRESALE_MAX_TOKENS_CAP);

        this.token = await ERC20.at(await this.crowdsale.token());

        await this.token.addMinter(this.crowdsale.address, { from: owner });
    });

    it("should create crowdsale with tokenCap", async function () {
        this.token.should.exist;
        this.crowdsale.should.exist;

        RATE.should.be.bignumber.equal(await this.crowdsale.rate());
        wallet.should.be.equal(await this.crowdsale.wallet());
        PRESALE_MAX_TOKENS_CAP.should.be.bignumber.equal(await this.crowdsale.presaleTokenCap());
    });

    it('should accept payment if within token cap', async function () {
        await this.crowdsale.send(SINGLE_ETHER).should.be.fulfilled;
    });

    it('should reject payment if exceed the token cap', async function () {
        await expectRevert(this.crowdsale.send(SINGLE_ETHER.muln(3)), "IndividualTokenCapCrowdsale: step token cap exceeded");
    });

    it('should reject payment if outside the token cap', async function () {
        await this.crowdsale.send(SINGLE_ETHER).should.be.fulfilled;
        await expectRevert(this.crowdsale.send(SINGLE_ETHER.addn(1)), "IndividualTokenCapCrowdsale: step token cap exceeded");
    });
});
