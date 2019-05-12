App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: null,
    tokensSold: 0,
    tokensAvailable: 750000,
    smartContractsDeployed: false,
  
    init: function() {
      console.log("App initialized...")
      return App.initWeb3();
    },


    initWeb3: function() {
        if (window.ethereum) {
            web3 = new Web3(ethereum);
            try {
                ethereum.enable();
            } catch (error) {
                // User denied account access...
            }
            App.web3Provider = web3.currentProvider;
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            $('#connection-alert').html("Unable to connect to your account, in order to use this DAPP please connect to the Rinkeby network using MetaMask").show();
            $('#loader').hide();
            App.loading = false;
            return true;
        }
      return App.initContracts();
    },
  
    initContracts: function() {
      $.getJSON("TokenSale.json", function(tokenSale) {
        App.contracts.TokenSale = TruffleContract(tokenSale);
        App.contracts.TokenSale.setProvider(App.web3Provider);
        App.contracts.TokenSale.deployed().then(function(tokenSale) {
          console.log("Dapp Token Sale Address:", tokenSale.address);
        });
      }).done(function() {
        $.getJSON("RomansToken.json", function(token) {
          App.contracts.DappToken = TruffleContract(token);
          App.contracts.DappToken.setProvider(App.web3Provider);
          App.contracts.DappToken.deployed().then(function(token) {
            console.log("Dapp Token Address:", token.address);
          });
  
          App.listenForEvents();
          return App.connectToContracts();
        });
      })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.TokenSale.deployed().then(function(instance) {
        instance.Sell({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
          App.connectToContracts();
        })
      })
    },
  
    connectToContracts: function() {
      if (App.loading) {
        return;
      }
      App.loading = true;
  
      var loader  = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
  
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if(err === null) {
          App.account = account;
          console.log('Account ' + account)
          $('#accountAddress').html(account);
        } else {
            console.log('Account is not connected')
            $('#accountAddress').html("Error getting account information");
        }
      });

      // Load token sale contract
      App.contracts.TokenSale.deployed().then(function(instance) {
        tokenSaleInstance = instance;
        return tokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        console.log("token price is " + tokenPrice)
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return tokenSaleInstance.tokensSold();
      }).then(function(tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');
  
        // Load token contract
        App.contracts.DappToken.deployed().then(function(instance) {
          tokenInstance = instance;
          return tokenInstance.balanceOf(App.account);
        }).then(function(balance) {
          $('.dapp-balance').html(balance.toNumber());
          App.loading = false;
          loader.hide();
          content.show();
        })
      }).catch(function(error) {
        $('#connection-alert').html("Unable to connect to the TokenSale contract. Does your MetaMask use Rinkeby network?").show();
        App.loading = false;
        $('#loader').hide();
      });
    },
  
    buyTokens: function() {
      $('#content').hide();
      $('#loader').show();
      console.log("Buy tokens request");
      var numberOfTokens = $('#numberOfTokens').val();
      App.contracts.TokenSale.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought: " + numberOfTokens)
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      }).catch(function(error) {
        console.log("transaction failed");
        alert("Transaction failed!");
        console.log(error);
        $('form').trigger('reset') // reset number of tokens in form
      });
      $('#content').show();
      $('#loader').hide();
    }
  }
  
  $(function() {
    $(window).on('load', function() {
      App.init();
    })
  });
