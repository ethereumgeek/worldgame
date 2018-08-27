var WorldGame = artifacts.require("WorldGame");
var NumberPlay = artifacts.require("NumberPlay");

module.exports = function(deployer) {
  deployer.deploy(WorldGame);
  deployer.deploy(NumberPlay);
};
