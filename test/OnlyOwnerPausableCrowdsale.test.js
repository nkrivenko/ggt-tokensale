const OnlyOwnerPausableCrowdsale = artifacts.require("OnlyOwnerPausableCrowdsaleImpl");
const ERC20 = artifacts.require("GGTToken");

import { expectRevert, ether } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("OnlyOwnerPausableCrowdsale", function ([funder, owner, user, fundingWallet]) {

    const RATE = new BN("1");

    const TOKEN_NAME = "Godji Game Token";
	const TOKEN_SYMBOL = "GGT";

    beforeEach(async function() {
        this.token = await ERC20.new(TOKEN_NAME, TOKEN_SYMBOL, owner);
        this.crowdsale = await OnlyOwnerPausableCrowdsale.new(RATE, fundingWallet, this.token.address, owner);

        await this.token.addMinter(this.crowdsale.address, { from: owner });
    });

    it('should revert if trying to add a pauser', async function() {
        await expectRevert(this.crowdsale.addPauser(user, {from: owner}), "OnlyOwnerPausableCrowdsale: addPauser is not available");
    });

    it('should revert if trying to renounce a pauser', async function() {
        await expectRevert(this.crowdsale.renouncePauser({from: owner}), "OnlyOwnerPausableCrowdsale: renouncePauser is not available");
    });
});
