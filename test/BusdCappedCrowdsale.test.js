const BusdCappedCrowdsale = artifacts.require("BusdCappedCrowdsaleImpl");
const Oracle = artifacts.require("BinanceOracleImpl");
const ERC20 = artifacts.require("GGTToken");

import { ether, expectRevert } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("BusdCappedCrowdsale", function ([_, owner, user]) {
    const RATE = new BN("2");
    const TOKEN_NAME = "Godji Game Token";
    const TOKEN_SYMBOL = "GGT";
    const TOKEN_CAP = ether("50000000");

    const BNBBUSD = ether('1000');
    const BUSD_CAP = ether('10000');

    const LESS_THAN_CAP_IN_BNB = ether('8');
    const CAP_IN_BNB = ether('10');

    beforeEach(async function () {
        this.wallet = (await web3.eth.accounts.create()).address;
        this.oracle = await Oracle.new(BNBBUSD);
        this.token = await ERC20.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP, owner);
    });

    it('should revert if cap is zero', async function() {
        await expectRevert(BusdCappedCrowdsale.new(RATE, this.wallet, this.token.address, 0, this.oracle.address), "BusdCappedCrowdsale: cap is 0");
    });

    context('with crowdsale', function() {
        beforeEach(async function() {
            this.crowdsale = await BusdCappedCrowdsale.new(RATE, this.wallet, this.token.address, BUSD_CAP, this.oracle.address);

            this.token = await ERC20.at(await this.crowdsale.token());

            await this.token.addMinter(this.crowdsale.address, { from: owner });
        });

        it('should create correct contract', async function() {
            this.token.should.exist;
            this.oracle.should.exist;
            this.crowdsale.should.exist;

            RATE.should.be.bignumber.equal(await this.crowdsale.rate());
            this.wallet.should.be.equal(await this.crowdsale.wallet());
            BUSD_CAP.should.be.bignumber.equal(await this.crowdsale.cap());
        });

        describe('accepting payments', function() {
            [LESS_THAN_CAP_IN_BNB, CAP_IN_BNB].forEach(bnbsToSend => it('should accept deposits if less or equal to BUSD cap', async function() {
                await this.crowdsale.send(bnbsToSend, { from: user });
            }));

            it('should accept deposits within cap', async function() {
                await this.crowdsale.send(CAP_IN_BNB.sub(LESS_THAN_CAP_IN_BNB), {from: user}).should.be.fulfilled;
                await this.crowdsale.send(LESS_THAN_CAP_IN_BNB, {from: user}).should.be.fulfilled;
            });

            it('should revert if outside the BUSD cap', async function() {
                await this.crowdsale.send(CAP_IN_BNB, {from: user}).should.be.fulfilled;
                await expectRevert(this.crowdsale.send(1, {from: user}), "BusdCappedCrowdsale: cap exceeded");
            });

            it('should revert if exceed the BUSD cap', async function() {
                await expectRevert(this.crowdsale.send(CAP_IN_BNB.addn(1), {from: user}), "BusdCappedCrowdsale: cap exceeded");
            });
        });

        describe('ending crowdsale', function() {

            const PARAMETERS = [
                {input: LESS_THAN_CAP_IN_BNB, outcome: false, description: 'deposited under BUSD cap'},
                {input: CAP_IN_BNB.subn(1), outcome: false, description: 'deposited just under the BUSD cap'},
                {input: CAP_IN_BNB, outcome: true, description: 'cap deposited'}
            ]

            PARAMETERS.forEach(param => it(`should ${param.outcome ? 'reach' : 'not reach'} BUSD cap if ${param.description}`, async function() {
                await this.crowdsale.send(param.input, {from: user}).should.be.fulfilled;

                (await this.crowdsale.capReached()).should.be.equal(param.outcome);
            }));
        });

    });
});
