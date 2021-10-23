const GodjiGamePreSaleStep = artifacts.require("GodjiGamePreSaleStep");
const BN = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BN))
  .should();

contract("GodjiGamePreSaleStep", function ([owner, user]) {
  
});
