var WorldGame = artifacts.require("WorldGame");
var LibraryDemo = artifacts.require("LibraryDemo");

module.exports = function(deployer) {
  deployer.deploy(WorldGame);
  deployer.deploy(LibraryDemo);
};
