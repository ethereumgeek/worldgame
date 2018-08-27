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

## How To Set It Up To Run Locally
In order to run the UX locally type 
```
cd ~/Documents/project
npm run start
```

In order to run tests type
```
cd ~/Documents/project
truffle test
```

## Testing Considerations
Testing was focused on around security and restrict access issues.  In addition, one test does a full simulation of game play until a player wins.

 Contract: LibraryDemo
    ✓ Test library demo using openzeppelin (174ms)

  Contract: WorldGame
    ✓ Test circuit breaker (218ms)
    ✓ Player A can't move player B's soldiers (579ms)
    ✓ Player can attack neighbor but not across map (464ms)
    ✓ Testing player loses attack after 257 block delay (7945ms)
    ✓ Player can only move on their turn (491ms)
    ✓ Cannot move more soldiers than you have (470ms)
    ✓ Full game simulation until winner (24508ms)

## Design Patterns
See design_pattern_decisions.md for information on design pattern decisions.

## Avoiding Common Attacks
See avoiding_common_attacks.md for information on how common attacks are avoided.

## Using A Library
See contracts/LibraryDemo.sol for a demonstration of using a library. A unit test for this library is found under test/librarydemo.js.
