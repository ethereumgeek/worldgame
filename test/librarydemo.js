var LibraryDemo = artifacts.require("./LibraryDemo.sol");

contract('LibraryDemo', function(accounts) {

    it("Test library demo using openzeppelin", async function() {

        let libraryDemoInstance = await LibraryDemo.deployed();

        /* Value should initially be 0 */
        let val = await libraryDemoInstance.currentVal();        
        assert.equal(val.toString(), "0", "Incorrect value with number play.");

        await libraryDemoInstance.maximum(
          300,
          {from: accounts[0]}
        );

        /* Value should now be 300 */
        val = await libraryDemoInstance.currentVal();        
        assert.equal(val.toString(), "300", "Incorrect value with number play.");

        await libraryDemoInstance.minimum(
          150,
          {from: accounts[0]}
        );

        /* Value should now be 150 */
        val = await libraryDemoInstance.currentVal();        
        assert.equal(val.toString(), "150", "Incorrect value with number play.");

        await libraryDemoInstance.minimum(
          200,
          {from: accounts[0]}
        );

        /* Value should still be 150 */
        val = await libraryDemoInstance.currentVal();        
        assert.equal(val.toString(), "150", "Incorrect value with number play.");
    });    

});
