const GodjiGamePreSaleStep = artifacts.require("GodjiGamePreSaleStep");
const ERC20 = artifacts.require("GGTToken");
const Oracle = artifacts.require("BinanceOracleImpl");

import { expectRevert, time, ether } from "@openzeppelin/test-helpers";

const BN = web3.utils.BN;

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();

contract("GodjiGamePreSaleStep", function ([funder, owner, user, anotherUser]) {

    const RATE = new BN("100");
    const BNBBUSD = ether('500');
    const SINGLE_ETHER = ether('1');

    const TOKEN_NAME = "Godji Game Token";
    const TOKEN_SYMBOL = "GGT";
    const TOKEN_CAP = ether("50000000");

    const CROWDSALE_BUSD_CAP = ether('250000');
    const CROWDSALE_BNB_CAP = ether('250000').mul(SINGLE_ETHER).div(BNBBUSD);

    const LESS_THAN_CAP_IN_BNB = CROWDSALE_BNB_CAP.muln(4).divn(5);

    const BNBBUSD_THRESHOLD = ether('10000');
    const BNBBUSD_BNB_THRESHOLD = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD);

    before(async function () {
        await time.advanceBlock();
    })

    beforeEach(async function () {
        this.openTime = (await time.latest()).add(time.duration.hours(1));

        this.token = await ERC20.new(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_CAP, owner);
        this.oracle = await Oracle.new(BNBBUSD);
        this.wallet = (await web3.eth.accounts.create()).address;
        this.crowdsale = await GodjiGamePreSaleStep.new(RATE, this.wallet, this.token.address, owner,
            this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);

        this.token = await ERC20.at(await this.crowdsale.token());

        await this.token.addMinter(this.crowdsale.address, { from: owner });
        await this.crowdsale.addWhitelisted(user, { from: owner });
        await this.crowdsale.addWhitelisted(anotherUser, { from: owner });
    });

    describe('Contract creation', function () {
        it('should create a crowdsale contract', async function () {
            this.token.should.exist;
            this.crowdsale.should.exist;

            RATE.should.be.bignumber.equal(await this.crowdsale.rate());

            this.wallet.should.be.equal(await this.crowdsale.wallet());
            this.token.address.should.be.equal(await this.crowdsale.token());
            owner.should.be.equal(await this.crowdsale.owner());
            CROWDSALE_BUSD_CAP.should.be.bignumber.equal(await this.crowdsale.cap());
        });
    });

    describe('Receive BNBs and transfer tokens', function () {
        it('should transfer the token amount from requirements', async function () {
            await time.increaseTo(this.openTime);

            const bnbThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD);

            const oldBalance = new BN(await web3.eth.getBalance(this.wallet));
            await this.crowdsale.send(bnbThreshold, { from: user });
            const newBalance = new BN(await web3.eth.getBalance(this.wallet));

            const balanceOfUser = await this.token.balanceOf(user);

            balanceOfUser.should.be.bignumber.equal(bnbThreshold.mul(BNBBUSD).div(RATE).div(SINGLE_ETHER));

            bnbThreshold.should.be.bignumber.equal(newBalance.sub(oldBalance));
        });

        it('should change the GGT.USD rate by owner', async function() {
            await time.increaseTo(this.openTime);

            const newRate = RATE.add(new BN("10"));
            await this.crowdsale.setRate(newRate, { from: owner });

            const bnbThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD);

            const oldBalance = new BN(await web3.eth.getBalance(this.wallet));
            await this.crowdsale.send(bnbThreshold, { from: user });
            const newBalance = new BN(await web3.eth.getBalance(this.wallet));

            const balanceOfUser = await this.token.balanceOf(user);

            balanceOfUser.should.be.bignumber.equal(bnbThreshold.mul(BNBBUSD).div(newRate).div(SINGLE_ETHER));
            bnbThreshold.should.be.bignumber.equal(newBalance.sub(oldBalance));

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
        it("should reject any payment below threshold if remaining amount is larger than threshold", async function() {
            await time.increaseTo(this.openTime);
            const paymentBelowThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD).subn(1);
    
            await expectRevert(this.crowdsale.send(paymentBelowThreshold, { from: user }), "GodjiGamePreSaleStep: payment is below threshold");
        });
        
        it("should accept any payment below threshold if remaining amount is smaller than threshold", async function() {
            await time.increaseTo(this.openTime);
            const paymentBelowThreshold = BNBBUSD_BNB_THRESHOLD.subn(4);

            const crowdsale = await GodjiGamePreSaleStep.new(RATE, this.wallet, this.token.address, owner,
                this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);

            const token = await ERC20.at(await this.crowdsale.token());

            await token.addMinter(crowdsale.address, { from: owner });
            await crowdsale.addWhitelisted(anotherUser, { from: owner });

            await crowdsale.send(CROWDSALE_BNB_CAP.sub(BNBBUSD_BNB_THRESHOLD).addn(1), { from: anotherUser }).should.be.fulfilled;
    
            await crowdsale.send(paymentBelowThreshold, { from: anotherUser }).should.be.fulfilled;
        });

        it("should accept the payment above the threshold if payer is in allowlist", async function() {
            await time.increaseTo(this.openTime);

            const paymentAboveThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD).add(new BN("1"));
    
            const crowdsale = await GodjiGamePreSaleStep.new(RATE, this.wallet, this.token.address, owner,
                this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);

            const token = await ERC20.at(await this.crowdsale.token());

            await token.addMinter(crowdsale.address, { from: owner });
            await crowdsale.addWhitelisted(anotherUser, { from: owner });

            const oldBalance = new BN(await web3.eth.getBalance(this.wallet));
            await crowdsale.send(paymentAboveThreshold, { from: anotherUser });
            const newBalance = new BN(await web3.eth.getBalance(this.wallet));
    
            paymentAboveThreshold.should.be.bignumber.equal(newBalance.sub(oldBalance));
        });
    
        it("should revert the payment above the threshold if payer is not in allowlist", async function() {
            await time.increaseTo(this.openTime);
            const paymentAboveThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD).addn(1);

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
                const paymentThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD);

                await this.crowdsale.send(paymentThreshold, { from: user }).should.be.fulfilled;
            });

            it('should not accept a deposit if before the crowdsale open time', async function () {
                await expectRevert(this.crowdsale.send(SINGLE_ETHER, { from: user }), "OpeningTimeCrowdsale: opening time hasn't come");
            });
        });

        describe('BUSD hardcap boundary should be respected', function () {
            it('should accept a deposit if it does not overflow the BNB hardcap', async function () {
                await time.increaseTo(this.openTime);
                const paymentThreshold = BNBBUSD_THRESHOLD.mul(SINGLE_ETHER).div(BNBBUSD);

                this.crowdsale = await GodjiGamePreSaleStep.new(RATE, this.wallet, this.token.address, owner,
                    this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);

                await this.token.addMinter(this.crowdsale.address, { from: owner });
                await this.crowdsale.addWhitelisted(user, { from: owner });

                await this.crowdsale.send(paymentThreshold, { from: user }).should.be.fulfilled;
            });

            it('should not accept a deposit if it overflows the BUSD hardcap', async function () {
                await time.increaseTo(this.openTime);
                await expectRevert(this.crowdsale.send(CROWDSALE_BUSD_CAP.addn(1), { from: user }), "CappedCrowdsale: cap exceeded");
            });

            [LESS_THAN_CAP_IN_BNB, CROWDSALE_BNB_CAP].forEach(bnbsToSend => it('should accept deposits if less or equal to BUSD cap', async function() {
                await time.increaseTo(this.openTime);

                const wallet = (await web3.eth.accounts.create()).address;
                const crowdsale = await GodjiGamePreSaleStep.new(RATE, wallet, this.token.address, owner,
                    this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);
                
                await this.token.addMinter(crowdsale.address, {from: owner});
                await crowdsale.addWhitelisted(user, {from: owner});

                await crowdsale.send(bnbsToSend, { from: user }).should.be.fulfilled;
            }));

            it('should accept deposits within cap', async function() {
                await time.increaseTo(this.openTime);

                const wallet = (await web3.eth.accounts.create()).address;
                const crowdsale = await GodjiGamePreSaleStep.new(RATE, wallet, this.token.address, owner,
                    this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);
                
                await this.token.addMinter(crowdsale.address, {from: owner});
                await crowdsale.addWhitelisted(user, {from: owner});

                await crowdsale.send(CROWDSALE_BNB_CAP.subn(1), {from: user}).should.be.fulfilled;
                await crowdsale.send(1, {from: user}).should.be.fulfilled;
            });

            it('should revert if outside the BUSD cap', async function() {
                await time.increaseTo(this.openTime);

                const wallet = (await web3.eth.accounts.create()).address;
                const crowdsale = await GodjiGamePreSaleStep.new(RATE, wallet, this.token.address, owner,
                    this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);
                
                await this.token.addMinter(crowdsale.address, {from: owner});
                await crowdsale.addWhitelisted(user, {from: owner});

                await crowdsale.send(CROWDSALE_BNB_CAP, {from: user}).should.be.fulfilled;
                await expectRevert(crowdsale.send(1, {from: user}), "BusdCappedCrowdsale: cap exceeded");
            });

            it('should revert if exceed the BUSD cap', async function() {
                await time.increaseTo(this.openTime);

                const wallet = (await web3.eth.accounts.create()).address;
                const crowdsale = await GodjiGamePreSaleStep.new(RATE, wallet, this.token.address, owner,
                    this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);
                
                await this.token.addMinter(crowdsale.address, {from: owner});
                await crowdsale.addWhitelisted(user, {from: owner});

                await expectRevert(crowdsale.send(CROWDSALE_BNB_CAP.addn(1), {from: user}), "BusdCappedCrowdsale: cap exceeded");
            });
        });
    });

    describe('Finalization actions should be taken after presale considered over', function() {
        it('should call finalize if called by owner and crowdsale BUSD hardcap reached', async function() {
            await time.increaseTo(this.openTime);

            this.crowdsale = await GodjiGamePreSaleStep.new(RATE, this.wallet, this.token.address, owner,
                this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);

            await this.token.addMinter(this.crowdsale.address, { from: owner });
            await this.crowdsale.addWhitelisted(user, { from: owner });

            await this.crowdsale.send(CROWDSALE_BNB_CAP, {from: user});
            
            await this.crowdsale.finalizeCrowdsale({from: owner});
            (await this.token.isMinter(this.crowdsale.address)).should.be.false;
        });

        it('should revert if finalize called by owner and crowdsale hardcaps not reached', async function() {
            await time.increaseTo(this.openTime);

            this.crowdsale = await GodjiGamePreSaleStep.new(RATE, this.wallet, this.token.address, owner,
                this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);

            await this.token.addMinter(this.crowdsale.address, { from: owner });
            await this.crowdsale.addWhitelisted(user, { from: owner });

            await expectRevert(this.crowdsale.finalizeCrowdsale({from: owner}), "GodjiGamePreSaleStep: hardcaps are not reached");
        });

        it('should revert if finalize called not by owner', async function() {
            await time.increaseTo(this.openTime);

            this.crowdsale = await GodjiGamePreSaleStep.new(RATE, this.wallet, this.token.address, owner,
                this.oracle.address, this.openTime, CROWDSALE_BUSD_CAP, BNBBUSD_THRESHOLD);

            await this.token.addMinter(this.crowdsale.address, { from: owner });
            await this.crowdsale.addWhitelisted(user, { from: owner });

            await this.crowdsale.send(CROWDSALE_BNB_CAP, {from: user});
            await expectRevert(this.crowdsale.finalizeCrowdsale(), "Ownable: caller is not the owner");
        });
    })
});
