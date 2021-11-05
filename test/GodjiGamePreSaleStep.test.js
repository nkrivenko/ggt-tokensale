const GodjiGamePreSaleStep = artifacts.require("GodjiGamePreSaleStep");
const ERC20 = artifacts.require("GGTToken");
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
    const BNBBUSD = ether('500');
    const SINGLE_ETHER = ether('1');
    const BONUS_COEFF_PERCENT = new BN("120");

    const TOKEN_NAME = "Godji Game Token";
    const TOKEN_SYMBOL = "GGT";
    const TOKEN_CAP = ether("50000000");

    const CROWDSALE_CAP = ether('1000');
    const CROWDSALE_TOKEN_CAP = ether('2610');

    const BNBBUSD_THRESHOLD = ether('100');

    before(async function () {
        await time.advanceBlock();
    })

    beforeEach(async function () {
        this.openTime = (await time.latest()).add(time.duration.hours(1));

        this.token = await ERC20.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP, owner);
        this.oracle = await Oracle.new(BNBBUSD);
        this.crowdsale = await GodjiGamePreSaleStep.new(RATE, wallet, this.token.address, owner,
            this.oracle.address, BONUS_COEFF_PERCENT, this.openTime, CROWDSALE_CAP, CROWDSALE_TOKEN_CAP, BNBBUSD_THRESHOLD);

        this.token = await ERC20.at(await this.crowdsale.token());

        await this.token.addMinter(this.crowdsale.address, { from: owner });
        await this.crowdsale.addWhitelisted(user, { from: owner });
    });

    describe('Contract creation', function () {
        it('should create a crowdsale contract', async function () {
            this.token.should.exist;
            this.crowdsale.should.exist;

            RATE.should.be.bignumber.equal(await this.crowdsale.rate());

            wallet.should.be.equal(await this.crowdsale.wallet());
            this.token.address.should.be.equal(await this.crowdsale.token());
            owner.should.be.equal(await this.crowdsale.owner());
            CROWDSALE_CAP.should.be.bignumber.equal(await this.crowdsale.cap());
            CROWDSALE_TOKEN_CAP.should.be.bignumber.equal(await this.crowdsale.tokenCap());
        });

        it('should revert if trying to create the token with zero bonus coefficient', async function () {
            await expectRevert(GodjiGamePreSaleStep.new(RATE, wallet, this.token.address, owner, this.oracle.address,
                new BN("0"), this.openTime, CROWDSALE_CAP, CROWDSALE_TOKEN_CAP, BNBBUSD_THRESHOLD),
                "GodjiGamePreSaleStep: bonusCoeffPercent must be positive number");
        });
    });

    describe('Receive BNBs and transfer tokens', function () {
        it('should transfer the token amount from requirements', async function () {
            await time.increaseTo(this.openTime);

            const oldBalance = new BN(await web3.eth.getBalance(fundingWallet));
            await this.crowdsale.send(SINGLE_ETHER, { from: user });
            const newBalance = new BN(await web3.eth.getBalance(fundingWallet));

            const balanceOfUser = await this.token.balanceOf(user);

            balanceOfUser.should.be.bignumber.equal(SINGLE_ETHER.mul(BNBBUSD).mul(BONUS_COEFF_PERCENT).div(RATE).div(SINGLE_ETHER).div(new BN(100)));

            SINGLE_ETHER.should.be.bignumber.equal(newBalance.sub(oldBalance));
        });

        it('should change the bonus coefficient', async function () {
            await time.increaseTo(this.openTime);

            const newBonusCoeff = BONUS_COEFF_PERCENT.add(new BN("10"));
            await this.crowdsale.setBonusCoeff(newBonusCoeff, { from: owner });

            const oldBalance = new BN(await web3.eth.getBalance(fundingWallet));
            await this.crowdsale.send(SINGLE_ETHER, { from: user });
            const newBalance = new BN(await web3.eth.getBalance(fundingWallet));

            const balanceOfUser = await this.token.balanceOf(user);

            balanceOfUser.should.be.bignumber.equal(SINGLE_ETHER.mul(BNBBUSD).mul(newBonusCoeff).div(RATE).div(SINGLE_ETHER).div(new BN(100)));
            SINGLE_ETHER.should.be.bignumber.equal(newBalance.sub(oldBalance));
        });

        it('should revert if trying to set zero bonus coefficient', async function() {
            await expectRevert(this.crowdsale.setBonusCoeff(new BN("0"), {from: owner}), "GodjiGamePreSaleStep: Bonus coeff is 0");
        });

        it('should revert if trying to change the bonus coefficient not by owner', async function () {
            await expectRevert(this.crowdsale.setBonusCoeff(BONUS_COEFF_PERCENT.add(new BN("10"))), "Ownable: caller is not the owner");
        });

        it('should change the GGT.USD rate by owner', async function() {
            await time.increaseTo(this.openTime);

            const newRate = RATE.add(new BN("10"));
            await this.crowdsale.setRate(newRate, { from: owner });

            const oldBalance = new BN(await web3.eth.getBalance(fundingWallet));
            await this.crowdsale.send(SINGLE_ETHER, { from: user });
            const newBalance = new BN(await web3.eth.getBalance(fundingWallet));

            const balanceOfUser = await this.token.balanceOf(user);

            balanceOfUser.should.be.bignumber.equal(SINGLE_ETHER.mul(BNBBUSD).mul(BONUS_COEFF_PERCENT).div(newRate).div(SINGLE_ETHER).div(new BN(100)));
            SINGLE_ETHER.should.be.bignumber.equal(newBalance.sub(oldBalance));

            newRate.should.be.bignumber.equal(await this.crowdsale.rate());
        });

        it('should revert if trying to set zero GGT.USD rate', async function() {
            await expectRevert(this.crowdsale.setRate(new BN("0"), {from: owner}), "GodjiGamePreSaleStep: GGT.BUSD is 0");
        });

        it('should revert if trying to change the GGT.USD rate not by owner', async function() {
            await expectRevert(this.crowdsale.setRate(RATE.add(new BN("10"))), "Ownable: caller is not the owner");
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

    describe('Payments should be accepted only if above threshold and sender is whitelisted', function () {
        it("should reject any payment below threshold", async function() {
            await time.increaseTo(this.openTime);
            const paymentBelowThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD).sub(new BN("1"));
    
            await expectRevert(this.crowdsale.send(paymentBelowThreshold, { from: user }), "BusdThresholdAllowlistCrowdsale: payment is below threshold");
        });
    
        it("should accept the payment above the threshold if payer is in allowlist", async function() {
            await time.increaseTo(this.openTime);

            const paymentAboveThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD).add(new BN("1"));
    
            const oldBalance = new BN(await web3.eth.getBalance(wallet));
            await this.crowdsale.send(paymentAboveThreshold, { from: user });
            const newBalance = new BN(await web3.eth.getBalance(wallet));
    
            paymentAboveThreshold.should.be.bignumber.equal(newBalance.sub(oldBalance));
        });
    
        it("should revert the payment above the threshold if payer is not in allowlist", async function() {
            await time.increaseTo(this.openTime);
            const paymentAboveThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD).add(new BN("1"));

            await expectRevert(this.crowdsale.send(paymentAboveThreshold, { from: funder }), "BusdThresholdAllowlistCrowdsale: address is not allowlisted");
        });

        it("should revert if trying to add whitelisted role for user without whitelistadmin role", async function() {
            await expectRevert(this.crowdsale.addWhitelisted(funder, {from: user}), "WhitelistAdminRole: caller does not have the WhitelistAdmin role");
        });
    });

    describe('Boundaries should be respected', function () {
        describe('Time boundary should be respected', function () {
            it('should accept a deposit if after or at the crowdsale open time', async function () {
                await time.increaseTo(this.openTime);

                await this.crowdsale.send(SINGLE_ETHER, { from: user }).should.be.fulfilled;
            });

            it('should not accept a deposit if before the crowdsale open time', async function () {
                await expectRevert(this.crowdsale.send(SINGLE_ETHER, { from: user }), "OpeningTimeCrowdsale: opening time hasn't come");
            });
        });

        describe('BNB hardcap boundary should be respected', function () {
            it('should accept a deposit if it does not overflow the BNB hardcap', async function () {
                await time.increaseTo(this.openTime);

                this.crowdsale = await GodjiGamePreSaleStep.new(RATE, wallet, this.token.address, owner,
                    this.oracle.address, BONUS_COEFF_PERCENT, this.openTime, CROWDSALE_CAP, CROWDSALE_TOKEN_CAP.mul(new BN("100")), BNBBUSD_THRESHOLD);

                await this.token.addMinter(this.crowdsale.address, { from: owner });
                await this.crowdsale.addWhitelisted(user, { from: owner });

                await this.crowdsale.send(SINGLE_ETHER, { from: user }).should.be.fulfilled;
            });

            it('should not accept a deposit if it overflows the BNB hardcap', async function () {
                await time.increaseTo(this.openTime);
                await expectRevert(this.crowdsale.send(CROWDSALE_CAP.add(new BN(1), { from: user })), "CappedCrowdsale: cap exceeded");
            });
        });

        describe('GGT distribution hardcap boundary should be respected', function () {
            it('should not accept a deposit if it overflows the GGT distribution hardcap', async function () {
                await time.increaseTo(this.openTime);

                const bnbsForCrowdsaleTokenCap = CROWDSALE_TOKEN_CAP.add(new BN(1)).mul(RATE).mul(SINGLE_ETHER).div(BNBBUSD);
                await expectRevert(this.crowdsale.send(bnbsForCrowdsaleTokenCap, { from: user }), "TokenCappedCrowdsale: token cap exceeded");
            });
        });
    });
});
