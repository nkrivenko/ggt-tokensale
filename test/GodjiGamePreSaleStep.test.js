const GodjiGamePreSaleStep = artifacts.require("GodjiGamePreSaleStep");
const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

const { expectRevert, time } = require("@openzeppelin/test-helpers");

contract("GodjiGamePreSaleStep", function ([funder, owner, user]) {
  
  before(async function() {
    await time.advanceBlock();
  })

  beforeEach(async function() {
    this.crowdsale = await GodjiGamePreSaleStep.new(owner);
  });

  describe('should be ownable and allow to transfer ownership', function() {
    it('should get the owner', async function() {
      owner.should.be.equal(await this.crowdsale.owner());
    });

    it('should allow to transfer ownership if called by owner', async function() {
      await this.crowdsale.transferOwnership(user, {from: owner});

      user.should.be.equal(await this.crowdsale.owner());
    });

    it('should revert if trying to transfer ownership not by owner', async function() {
      await expectRevert(this.crowdsale.transferOwnership(user, {from: user}), "Ownable: caller is not the owner");
    });
  });

});
