const OpeningTimeCrowdsaleImpl = artifacts.require("OpeningTimeCrowdsaleImpl");
const ERC20 = artifacts.require("GGTToken");

import { ether, time, expectRevert } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("OpeningTimeCrowdsaleImpl", function ([funder, owner, user, fundingWallet]) {

    const RATE = new BN("1");

    const NAME = "Godji Game Token";
	const SYMBOL = "GGT";

    const SINGLE_ETHER = ether('1');

    before(async function() {
        await time.advanceBlock();
    });

    beforeEach(async function() {
        this.openTime = (await time.latest()).add(time.duration.hours(1));

        this.token = await ERC20.new(NAME, SYMBOL, owner);
        this.crowdsale = await OpeningTimeCrowdsaleImpl.new(RATE, fundingWallet, this.token.address, this.openTime);
        this.token = await ERC20.at(await this.crowdsale.token());

        await this.token.addMinter(this.crowdsale.address, { from: owner });
    });

    it('should accept a deposit if after or at the crowdsale open time', async function() {
        await time.increaseTo(this.openTime);

        await this.crowdsale.send(SINGLE_ETHER, {from: user}).should.be.fulfilled;
    });

    it('should not accept a deposit if before the crowdsale open time', async function() {
        await expectRevert(this.crowdsale.send(SINGLE_ETHER, {from: user}), "OpeningTimeCrowdsale: opening time hasn't come");
    });
});
