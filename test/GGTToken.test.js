const BN = web3.utils.BN;

const GGTErc20Token = artifacts.require('GGTToken');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

const { singletons, expectRevert, ether } = require('@openzeppelin/test-helpers');

contract('GGTToken', function([ funder, owner, minter, user ]) {

	const NAME = "Godji Game Token";
	const SYMBOL = "GGT";
    const DECIMALS = new BN("18");

    const TOKENS_TO_MINT = ether("1");

	beforeEach(async function() {
		this.token = await GGTErc20Token.new(NAME, SYMBOL, owner);
	});

	it('should create token with parameters provided', async function() {
		this.token.should.exist;

		NAME.should.be.equal(await this.token.name());
		SYMBOL.should.be.equal(await this.token.symbol());
        DECIMALS.should.be.bignumber.equal(await this.token.decimals());
        owner.should.be.equal(await this.token.getOwner());
	});

    describe('should mint tokens', function() {
        it('should issue tokens if `mint` is called by MINTER', async function() {
            await this.token.addMinter(minter, {from: owner});
            await this.token.mint(user, TOKENS_TO_MINT, {from: minter});
    
            (await this.token.balanceOf(user)).should.be.bignumber.equal(TOKENS_TO_MINT);
        });

        it('should issue tokens if `mint` is called by owner', async function() {
            await this.token.mint(user, TOKENS_TO_MINT, {from: owner});
    
            (await this.token.balanceOf(user)).should.be.bignumber.equal(TOKENS_TO_MINT);
        });
    
        it('should revert if `mint` is called not by MINTER or owner', async function() {
            await expectRevert(this.token.mint(user, TOKENS_TO_MINT, {from: user}), "GGTToken: only MINTER or owner can call this method");
        });
    });

    describe('should provide the access control to owner of contract', function() {

        it('should grant MINTER role to the address if called by owner', async function() {
            await this.token.addMinter(user, {from: owner});

            (await this.token.isMinter(user)).should.be.true;
        });

        it('should revoke MINTER role to the address if called by owner', async function() {
            await this.token.addMinter(user, {from: owner});
            await this.token.removeMinter(user, {from: owner});

            (await this.token.isMinter(user)).should.be.false;
        });

        it('should not grant MINTER role to the address if called not by owner', async function() {
            await expectRevert(this.token.addMinter(user, {from: user}), "GGTToken: caller is not the owner");
        });

        it('should not revoke MINTER role to the address if called not by owner', async function() {
            await this.token.addMinter(user, {from: owner});

            await expectRevert(this.token.removeMinter(user, {from: user}), "GGTToken: caller is not the owner");
        });

        it('should revert when trying to call addMinter with minter address', async function() {
            await this.token.addMinter(user, {from: owner});

            await expectRevert(this.token.addMinter(user, {from: owner}), "GGTToken: Specified address is already a minter");
        });

        it('should revert when trying to call removeMinter with non-minter address', async function() {
            await expectRevert(this.token.removeMinter(user, {from: owner}), "GGTToken: Specified address is not a minter");
        });
    });
});
