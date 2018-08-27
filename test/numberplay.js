var NumberPlay = artifacts.require("./NumberPlay.sol");

contract('NumberPlay', function(accounts) {

    it("Test number play (example using openzeppelin)", async function() {

        let numberPlayInstance = await NumberPlay.deployed();

        /* Value should initially be 0 */
        let val = await numberPlayInstance.currentVal();        
        assert.equal(val.toString(), "0", "Incorrect value with number play.");

        await numberPlayInstance.maximum(
          300,
          {from: accounts[0]}
        );

        /* Value should now be 300 */
        val = await numberPlayInstance.currentVal();        
        assert.equal(val.toString(), "300", "Incorrect value with number play.");

        await numberPlayInstance.minimum(
          150,
          {from: accounts[0]}
        );

        /* Value should now be 150 */
        val = await numberPlayInstance.currentVal();        
        assert.equal(val.toString(), "150", "Incorrect value with number play.");

        await numberPlayInstance.minimum(
          200,
          {from: accounts[0]}
        );

        /* Value should still be 150 */
        val = await numberPlayInstance.currentVal();        
        assert.equal(val.toString(), "150", "Incorrect value with number play.");
    });    

});
