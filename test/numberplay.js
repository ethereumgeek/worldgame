var NumberPlay = artifacts.require("./NumberPlay.sol");

contract('NumberPlay', function(accounts) {

    it("Test number play", async function() {

        let numberPlayInstance = await NumberPlay.deployed();

        await numberPlayInstance.maximum(
          300,
          {from: accounts[0]}
        );

        await numberPlayInstance.minimum(
          150,
          {from: accounts[0]}
        );

        let val = await numberPlayInstance.currentVal();        
        assert.equal(val.toString(), "150", "Incorrect value with number play.");
    });    

});
