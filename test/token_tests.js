const RomansTokenContract = artifacts.require("RomansToken");

contract('RomansToken', function(accounts){

    it('initializes contract with correct values', function(){
        return RomansTokenContract.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.equal(name, 'RomanCoin', 'Name is incorrect!');
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol, 'RSP', 'Symbol is not correct!'); 
         });
    })

    it('allocates total supply during deployement', function(){
        return RomansTokenContract.deployed().then(function(instance){
            tokenInstance=instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000, 'total supply must me 1000000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(), 1000000, 'inital supply must be transfered to the owner of the coin!')
        });
    });

    it('initializes contract with correct values', function(){
        return RomansTokenContract.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 999999999999);
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >=0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
        }).then(function(success){
            assert.equal(success, true, 'must return success=true!');
            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'must trigger only 1 event!');
            assert.equal(receipt.logs[0].event, 'Transfer', 'must trigger Transfer event!');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'must log trasfer from!');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'must log trasfer to!');
            assert.equal(receipt.logs[0].args._value, 250000, 'must log correct transfer value!');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 250000, 'amount must be added to the receiving account');
            return(tokenInstance.balanceOf(accounts[0]));
        }).then(function(balance){
            assert.equal(balance.toNumber(), 750000, 'amount should be deducted from sender account!')
        });
    });

    it('approves tokens for transfer', function(){
        return RomansTokenContract.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 1000);
        }).then(function(success) {
            assert.equal(success, true, 'must return true');
            return tokenInstance.approve(accounts[1], 1000);
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'must trigger only 1 event!');
            assert.equal(receipt.logs[0].event, 'Approval', 'must trigger Approval event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'must log owner');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'must log spender');
            assert.equal(receipt.logs[0].args._value, 1000, 'must log correct approval value');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance, 1000, 'allowance must be correct')});
    });

    it('executes delegated transfer', function(){
        return RomansTokenContract.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spender = accounts[4];
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 1000, {from: spender});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >=0, 'must throw an error if transering value larger than balance');
            return tokenInstance.transfer(fromAccount, 1000, {from: accounts[0]});  
        }).then(function(receipt){
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 1000, {from: spender});  
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >=0, 'must throw an error if allowance is less than value!');
            return tokenInstance.approve(spender, 1000, {from: fromAccount});
        }).then(function(receipt){
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 1000, {from: spender}); 
        }).then(function(success){
            assert.equal(success, true, 'must return true');
            return tokenInstance.transferFrom(fromAccount, toAccount, 900, {from: spender}); 
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'must trigger only 1 event!');
            assert.equal(receipt.logs[0].event, 'Transfer', 'must trigger Transfer event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'must log fromAccount');
            assert.equal(receipt.logs[0].args._to, toAccount, 'must log toAccount');
            assert.equal(receipt.logs[0].args._value, 900, 'must log correct transfer value');
            return tokenInstance.balanceOf(fromAccount); 
        }).then(function(balance){
            assert.equal(balance.toNumber(), 100, 'amount must be deducted from fromAccount');
            return tokenInstance.balanceOf(toAccount); 
        }).then(function(balance){
            assert.equal(balance.toNumber(), 900, 'amount must be added to toAccount');
            return tokenInstance.allowance(fromAccount, spender); 
        }).then(function(allowance){
            assert.equal(allowance, 100, 'allowance must be correct')});
    }); 
});