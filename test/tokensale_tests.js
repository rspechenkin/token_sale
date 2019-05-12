const TokenSaleContract = artifacts.require("TokenSale");
const RomansTokenContract = artifacts.require("RomansToken");

contract('TokenSale', function(accounts){
    var tokenSaleInstance;
    var tokenPrice = 1000000; //wei
    var admin = accounts[0];
    var tokensAvailable = 200000;
    var totalNumberOfTokens = 1000000;

    it('initializes the contract with correct values', function(){
        return TokenSaleContract.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address){
           assert.notEqual(address, 0x0, 'should not be zero!');
           return tokenSaleInstance.tokenContract(); 
        }).then(function(address){
            assert.notEqual(address, 0x0, 'should have a token contract address!');
            return tokenSaleInstance.tokenPrice(); 
        }).then(function(price){
            assert.equal(price, tokenPrice, 'should have a token contract address!');
        }); 
    });


    it('allows to buy tokens', function(){
        return RomansTokenContract.deployed().then(function(instance){
            tokenInstance = instance;
            return TokenSaleContract.deployed();
        }).then(function(instance) {
            tokenSaleInstance = instance;
            buyer = accounts[1];
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin})
        }).then(function(receipt) {
            numberOfTokensToBuy = 10;
            return tokenSaleInstance.buyTokens(numberOfTokensToBuy, {from: buyer, value: numberOfTokensToBuy * tokenPrice});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'must trigger only 1 event!');
            assert.equal(receipt.logs[0].event, 'Sell', 'must trigger Sell event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'must log buyer');
            assert.equal(receipt.logs[0].args._amount, numberOfTokensToBuy, 'must log numberOfTokensToBuy');
           return tokenSaleInstance.tokensSold(); 
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokensToBuy, 'the number of tokens sold should correspond to the number of tokens bought');
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokensToBuy, 'the number of tokens available should be reduced after buying');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance){
            assert.equal(balance.toNumber(), numberOfTokensToBuy, 'the number of tokens should be transferred to buyers account');
            return tokenSaleInstance.buyTokens(numberOfTokensToBuy, {from: buyer, value: 1});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >=0, 'must not allow buying for lower price');
            return tokenSaleInstance.buyTokens(9999999999, {from: buyer, value: 9999999999 * tokenPrice});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >=0, 'must not allow to buy more tokens that available');
        }); 
    });

    it('ends the sale', function(){
        return RomansTokenContract.deployed().then(function(instance){
            tokenInstance = instance;
            return TokenSaleContract.deployed();
        }).then(function(instance) {
            tokenSaleInstance = instance;
            buyer = accounts[1];
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin})
        }).then(function(receipt) {
            numberOfTokensToBuy = 10;
            return tokenSaleInstance.endSale({from: buyer})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >=0, 'must not allow non-admin user to end the sale');
            return tokenSaleInstance.endSale({from: admin})
        }).then(function(receipt) {
            return tokenInstance.balanceOf(admin)
        }).then(function(balance) {
            assert.equal(balance.toNumber(), totalNumberOfTokens - numberOfTokensToBuy, 'the number of tokens available should be reduced after buying');
            return tokenSaleInstance.tokenPrice()
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("Returned values aren't valid") >=0, 'must destroy the contract!');
        }); 
    });
    

});