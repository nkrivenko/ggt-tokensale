const GodjiGamePreSaleStep = artifacts.require("GodjiGamePreSaleStep");
const ERC20 = artifacts.require("StubERC20Token");
const Oracle = artifacts.require("BinanceOracleImpl");

import { expectRevert, time } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("GodjiGamePreSaleStep", function ([funder, owner, user, fundingWallet]) {

  const rate = new BN("1");
  const wallet = fundingWallet;

  before(async function () {
    await time.advanceBlock();
  })

  beforeEach(async function () {
    this.token = await ERC20.new();
    this.oracle = await Oracle.new();
    this.crowdsale = await GodjiGamePreSaleStep.new(rate, wallet, this.token.address, owner, this.oracle.address);
  });

  it('should create a crowdsale contract', async function () {
    this.token.should.exist;
    this.crowdsale.should.exist;

    rate.should.be.bignumber.equal(await this.crowdsale.rate());

    wallet.should.be.equal(await this.crowdsale.wallet());
    this.token.address.should.be.equal(await this.crowdsale.token());
    owner.should.be.equal(await this.crowdsale.owner());
  });

  describe('should be ownable and allow to transfer ownership', function () {
    it('should get the owner', async function () {
      owner.should.be.equal(await this.crowdsale.owner());
    });

    it('should allow to transfer ownership if called by owner', async function () {
      await this.crowdsale.transferOwnership(user, { from: owner });

      user.should.be.equal(await this.crowdsale.owner());
    });

    it('should revert if trying to transfer ownership not by owner', async function () {
      await expectRevert(this.crowdsale.transferOwnership(user, { from: user }), "Ownable: caller is not the owner");
    });
  });

  describe('should be pausable by owner', function () {
    it('should pause if not paused and called by owner', async function () {
      (await this.crowdsale.paused()).should.equal(false);

      await this.crowdsale.pause({ from: owner });

      (await this.crowdsale.paused()).should.equal(true);
    });

    it('should revert if trying to pause when already paused', async function () {
      await this.crowdsale.pause({ from: owner });

      await expectRevert(this.crowdsale.pause({ from: owner }), "Pausable: paused");
    });

    it('should revert if trying to pause not by owner', async function () {
      await expectRevert(this.crowdsale.pause({ from: user }), "PauserRole: caller does not have the Pauser role");
    });

    it('should unpause if paused and called by owner', async function () {
      await this.crowdsale.pause({ from: owner });
      (await this.crowdsale.paused()).should.equal(true);

      await this.crowdsale.unpause({ from: owner });

      (await this.crowdsale.paused()).should.equal(false);
    });

    it('should revert if trying to unpause when not paused', async function () {
      (await this.crowdsale.paused()).should.equal(false);

      await expectRevert(this.crowdsale.unpause({ from: owner }), "Pausable: not paused");
    });

    it('should revert if trying to unpause not by owner', async function () {
      await expectRevert(this.crowdsale.unpause({ from: user }), "PauserRole: caller does not have the Pauser role");
    });
  });

});
