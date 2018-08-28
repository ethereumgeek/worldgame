# Ethereum World Game
Battle on the Ethereum blockchain to control territory and take over the world.  Deploy soldiers to regions and attack your neighbors to conquer more territory.  Gain points by holding regions.  Use points to deploy more soldiers to the map and build out your army.

View it by visiting https://ethworld.app in a Metamask enabled browser using Rinkeby test network.

## Description (What It Does)
World Game is a dapp built on Ethereum where players compete to control territory and take over the world.

Players start on the "Open Game" page which shows their most recent games.  They can open an existing game, or start a new game by selecting "Create New Game" in the menu:
* Specify Ethereum addresses for up to 8 players
* Specify an avatar for each player which is what players look like in the game

Each player starts with 20 undeployed soldiers.  They can accumulate additional undeployed soldiers by controlling territory.  Each region (AKA territory) is worth a certain # of points which is the # of new soldiers you get per turn for owning it.  Additionally, a 5% extra point bonus is given for each region owned beyond 1.

The game is turned based. The following happens in order on a player's turn:
1. They are given new undeployed soldiers based on what regions they control.  This is explained above. 
2. They can move soldiers from regions they control to neighboring regions.  Moves are queued and executed when their turn ends:
   * When neighboring region is friendly or unoccupied soldiers move uncontested.
   * When neighboring region is hostile then an attack occurs.  Outcome of attack is determined based on randomness.
3. Deploy soldiers to a region that is friendly or unoccupied.
4. Turn ends.

If a player no longer controls any regions at the start of their turn and there's no open territory then they lose.  Their turn is automatically skipped.

Once a player controls all regions of the world they are declared the winner.

## How To Set It Up To Run Locally (with Virtual Box)
Download virtual box here: https://drive.google.com/file/d/10-2O7PCceVBOT2nTq1PRl3pgfsPGZ5Vu/view?usp=sharing

Login to account **"justin"** using password **"password"**.  The password for metamask is also "password".

In order to run the UX locally type 
```
cd ~/worldgame
gnome-terminal -e "ganache-cli -d"
truffle migrate --reset
gnome-terminal -e "npm run start"
```

In order to run tests type (it may take several minutes)
```
cd ~/worldgame
gnome-terminal -e "ganache-cli -d"
sudo truffle test
```

Once again, the password is **"password"** for both sudo and metamask on this Virtual Box

## How To Set It Up To Run Locally (Clone From GitHub)
Clone from GitHub and Run UX locally on Ubuntu: 
```
git clone https://github.com/ethereumgeek/worldgame.git
cd worldgame
npm install
npm uninstall -g truffle
npm install -g truffle@beta
npm install -g ganache-cli
gnome-terminal -e "ganache-cli -d -b 3"
truffle migrate --reset
npm run start
```

Clone from GitHub and Run UX locally on MacOS: 
```
git clone https://github.com/ethereumgeek/worldgame.git
cd worldgame
npm install
npm uninstall -g truffle
npm install -g truffle@beta
npm install -g ganache-cli
chmod +x run_ganache.command
open run_ganache.command
truffle migrate --reset
npm run start
```

In order to run tests on Ubuntu (after cloning and npm above):
```
cd ~/worldgame
gnome-terminal -e "ganache-cli -d"
sudo truffle test
```

In order to run tests on MacOS (after cloning and npm above):
```
cd ~/worldgame
chmod +x run_ganache.command
open run_ganache.command
truffle test
```

## User Stories
Some user stories for the World Game Dapp
* A player opens the web app. The contract recognizes their address and show any recent games that the address has participated in.  The can click on a game to see the game details.
  * The player sees what regions they own, what regions other players own and how many undeployed soldiers they have.
  * If it's their turn and they own territory then they can move soldiers from a region they own to a neighboring region.  If the neighboring region is friendly or unowned then the soldiers move uncontested.
  * If the neighboring region is owned by another player then they attack that region.  The outcome of that attack if decided by randomness after waiting two blocks.
  * After attacking and moving soldiers the player ends their turn. When ending their turn they can deploy their undeployed soldiers to a friendly region on the map.
  * A player loses all their territory in a game with many players. There are no more free regions. That player loses and their turn is now skipped while the other players continue.
  * A player can create a new game by specifying opponent addresses and avatars for each player.
  * Non-participants can open a game in order to see the world map with which regions are owned by what players.
  
Once a player controls all regions of the world they are declared the winner.
<img src="https://github.com/ethereumgeek/worldgame/blob/master/preview.png?raw=true" width="800" alt="Screenshot" border="1px solid #999">

## Testing Considerations
Testing was focused on around security and restrict access issues.  In addition, one test does a full simulation of game play until a player wins.  Here's a summary of the tests written for the WorldGame contract:
* **Test circuit breaker.**  This tests the circuit breaker functionality that allows the contract owner to halt the ability of new games to be created.  
* **Player A can't move player B's soldiers.**  This tests that only the player who owns soldiers can move them and that player A can't move player B' soldiers.
* **Player can attack neighbor but not across map.**  This tests that a player can attack from a region they control to a neighboring region, but that they cannot attack a non-adjacent region.  For example Western USA can attach Eastern USA, but cannot attack India.   
* **Testing player loses attack after 257 block delay.**  Blockhash after an attack is committed is used for randomness. However, only the most recent 256 blockhashes are available.  Beyond that all block hashes are 0.  This tests that attacker loses with no damage to defender (and maximum damage to attacker) after waiting 257 blocks.
* **Player can only move on their turn.**  This tests that players can move soldiers on their turn, but cannot move their soldiers when it's someone else's turn.
* **Cannot move more soldiers than you have.**  This tests that a player can move soldiers that they have, but cannot move more soldiers than they have.  For example if a player has 20 soldiers in a region then they can move 19 soldiers, but cannot move 21 soldiers.
* **Full game simulation until winner.**  This goes through a full game play simulation (starting with 3 players) where players deploy soldiers, move to take adjacent territory and aggressively attack opponents.  It checks that soldier counts and region owners are as expected and there are no assertions during game play.  A player is declared the winner once they control all regions of the world.  It also has a debug mode that provides detailed output during the similation.

A single test is also included the the LibraryDemo contract to show its functionality.

## Design Patterns
See [design_pattern_decisions.md](design_pattern_decisions.md) for information on design pattern decisions.

## Avoiding Common Attacks
See [avoiding_common_attacks.md](avoiding_common_attacks.md) for information on how common attacks are avoided.

## Using A Library
See contracts/LibraryDemo.sol for a demonstration of using a library. A unit test for this library is found under test/librarydemo.js.
