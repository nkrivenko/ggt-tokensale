const GodjiGamePreSaleStep = artifacts.require("GodjiGamePreSaleStep");
const ERC20 = artifacts.require("StubERC20Token");
const Oracle = artifacts.require("BinanceOracleImpl");

import { expectRevert, time, ether } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("GodjiGamePreSaleStep", function ([funder, owner, user, fundingWallet]) {

  const RATE = new BN("100");
  const wallet = fundingWallet;
  const BNBBUSD = ether('522');
  const SINGLE_ETHER = ether('1');
  const BONUS_COEFF_PERCENT = new BN("120");

  before(async function () {
    await time.advanceBlock();
  })

  beforeEach(async function () {
    this.token = await ERC20.new();
    this.oracle = await Oracle.new(BNBBUSD);
    this.crowdsale = await GodjiGamePreSaleStep.new(RATE, wallet, this.token.address, owner, this.oracle.address, BONUS_COEFF_PERCENT);

    this.token = await ERC20.at(await this.crowdsale.token());

    await this.token.addMinter(this.crowdsale.address);
  });


  describe('Contract creation', function() {
    it('should create a crowdsale contract', async function () {
      this.token.should.exist;
      this.crowdsale.should.exist;
  
      RATE.should.be.bignumber.equal(await this.crowdsale.rate());
  
      wallet.should.be.equal(await this.crowdsale.wallet());
      this.token.address.should.be.equal(await this.crowdsale.token());
      owner.should.be.equal(await this.crowdsale.owner());
    });
  
    it('should revert if trying to create the token with zero bonus coefficient', async function() {
      await expectRevert(GodjiGamePreSaleStep.new(RATE, wallet, this.token.address, owner, this.oracle.address, new BN("0")),
        "GodjiGamePreSaleStep: bonusCoeffPercent must be positive number");
    });
  });

  describe('Receive BNBs and transfer tokens', function() {
    it('should transfer the token amount from requirements', async function () {
      await this.crowdsale.send(SINGLE_ETHER, {from: user});

      const balanceOfUser = await this.token.balanceOf(user);

      balanceOfUser.should.be.bignumber.equal(SINGLE_ETHER.mul(BNBBUSD).mul(BONUS_COEFF_PERCENT).div(RATE).div(SINGLE_ETHER).div(new BN(100)));
    });

    it('should change the bonus coefficient', async function () {
      const newBonusCoeff = BONUS_COEFF_PERCENT.add(new BN("10"));
      await this.crowdsale.setBonusCoeff(newBonusCoeff, {from: owner});

      await this.crowdsale.send(SINGLE_ETHER, {from: user});

      const balanceOfUser = await this.token.balanceOf(user);

      balanceOfUser.should.be.bignumber.equal(SINGLE_ETHER.mul(BNBBUSD).mul(newBonusCoeff).div(RATE).div(SINGLE_ETHER).div(new BN(100)));
    });

    it('should revert if trying to change the bonus coefficient not by owner', async function () {
      await expectRevert(this.crowdsale.setBonusCoeff(BONUS_COEFF_PERCENT.add(new BN("10"))), "Ownable: caller is not the owner");
    });
  });

  describe('Be ownable and allow to transfer ownership', function () {
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

  describe('Be pausable by owner', function () {
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
