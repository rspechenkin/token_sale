const RomansTokenContract = artifacts.require("RomansToken");
const TokenSaleContract = artifacts.require("TokenSale");

module.exports = function(deployer) {
  var numberOfTokens = 1000000;
  var tokenPrice = 1000000;
  deployer.deploy(RomansTokenContract, numberOfTokens).then(function(){
    return deployer.deploy(TokenSaleContract, RomansTokenContract.address, tokenPrice);
  });
};
