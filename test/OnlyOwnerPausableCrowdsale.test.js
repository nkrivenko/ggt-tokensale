const OnlyOwnerPausableCrowdsale = artifacts.require("OnlyOwnerPausableCrowdsaleImpl");
const ERC20 = artifacts.require("StubERC20Token");

import { expectRevert, time } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("GodjiGamePreSaleStep", function ([funder, owner, user, fundingWallet]) {

    const RATE = new BN("1");

    beforeEach(async function() {
        this.token = await ERC20.new();
        this.crowdsale = await OnlyOwnerPausableCrowdsale.new(RATE, fundingWallet, this.token.address, owner);
    });

    it('should revert if trying to add a pauser', async function() {
        await expectRevert(this.crowdsale.addPauser(user, {from: owner}), "OnlyOwnerPausableCrowdsale: addPauser is not available");
    });

    it('should revert if trying to renounce a pauser', async function() {
        await expectRevert(this.crowdsale.renouncePauser({from: owner}), "OnlyOwnerPausableCrowdsale: renouncePauser is not available");
    });
});
