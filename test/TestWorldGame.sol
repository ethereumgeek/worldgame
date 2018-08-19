pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/WorldGame.sol";

contract TestWorldGame {

    function testNewGame() public {
        WorldGame gameFactory = WorldGame(DeployedAddresses.WorldGame());

        uint256 gameId = gameFactory.newGame(
            uint32(5), 
            uint32(256), 
            [
                0x91D7EAba4ddE9799c12bF054b6023f45c72a4A56, 
                0x91D7EAba4ddE9799c12bF054b6023f45c72a4A56, 
                0x91D7EAba4ddE9799c12bF054b6023f45c72a4A56, 
                0x91D7EAba4ddE9799c12bF054b6023f45c72a4A56, 
                0x91D7EAba4ddE9799c12bF054b6023f45c72a4A56,
                0x0000000000000000000000000000000000000000, 
                0x0000000000000000000000000000000000000000, 
                0x0000000000000000000000000000000000000000
            ], 
            ""
        );

        Assert.equal(gameId, gameFactory.numberOfGames()-1, "Values should match.");
    }

}
