# Design Pattern Decisions
Several tradeoffs have been made in designing the WorldGame contract.  Two important considerations have been security and minimizing gas cost.  Another major factor has been UX game play dynamics.

## Circuit Breaker / Emergency Stop
WorldGame contract uses a circuit breaker design pattern that prevents new games from being created.  This uses a stopNewGames(bool) function in conjunction with a stopInEmergency() modifier.

```
function stopNewGames(bool stop) public isOwner() {
    stopped = stop;
}

modifier stopInEmergency() {
    require(stopped == false, "Stopped due to emergency.");
    _;
}
```

## Fail Early And Fail Loud
WorldGame contract uses require statements (often in modifiers) at the top of almost all functions to ensure a loud failure whenever an invalid function call is attempted.

Some example modifiers and require statements include:
* onlyIfPlayersTurn(...) which only allows function call if it's your turn.
* onlyNeighbors(...) which only allows moving soldiers between neighboring regions.
* onlyPlayers(...) which allows function call by any player in game.
* require(game.actionCount < MAX_ACTIONS_PER_TURN, ...) prevents player from queuing more than 8 actions.
* require(game.regionSoldiers[regionFrom] > moveSoldierCount, ...) prevents player from moving more soldiers than they have.

## Restricting Access
WorldGame contract uses modifiers such as onlyIfPlayersTurn(...) and onlyPlayers(...) to restrict access to function calls to only allowed addresses.

Most state variables have been kept public since it's useful to the UX and there's no significant security reason to make the contract state private.

## Player Turn State Machine
Instead of all players executing actions in parallel, WorldGame contract using a player turn state machine where players must take their turns in order.

During a player's turn they can queue up to 8 moves taking soldiers between regions.  They then must end their turn and all queued actions are executed.  The turn state then moves to the next player who's still alive.

This brings order to the game play and reduces transaction ordering security risks. 

## Lookup Table for Region Neighbors and Rewards
When WorldGame constructor() is called it initializes lookup tables for region neighbors and region rewards.  These lookup tables are shared across all game instances and don't change after initialization.

Regions are stored as uint32 within the WorldGame contract.  However, a Regions enum exists that is then cast into uint32.  This is done to improve readability.

## Randomness and Deciding Attack Outcomes
A random source is needed in order to bring some fun into the game and keep attack outcomes from being completely deterministic.  However, miners are able to manipulate variables such as block.timestamp or may choose to maliciously exclude our transaction in order to affect the outcome.

WorldGame contract therefore a pattern where attacks are pre-committed along with the current block #.  A future block hash (2 blocks after commit) is then used as a source of randomness to determine the attack outcome.  This greatly reduces the ability of miners to affect the outcome.

However, Ethereum only keeps the 256 most recent block hashes.  Beyond that all block hashes are 0.  Therefore if the block hash is 0 when determining the attack outcome then the attacker loses by default with maximum injury.

## Decisions to Reduce Gas Cost
At the code of the WorldGame contract is an array of GameData structs.  The GameData struct has been kept flat instead of nesting other structs inside it.  Arrays inside the GameData struct are all fixed length.

This design has been chosen in order to minimize gas cost both when creating a new game and during game play:
* Creating a new contract for each game instance was found to be quite expensive.  This is partially because all functions for interacting with the game are deployed as part of the game contract.  Using delegatecall could provide some savings, but it was cheapest to use a monolithic contract with an array of structs for each game. 
* Nesting structs inside structs (such as having an QueuedAction struct) was found to increase gas cost compared with keeping a flat structure. Fixed length arrays were found to be cheaper than having dynamic arrays.

All variables have been kept length 256 bits, 32 bits or boolean.  In particular, converting all uint8 variables to uint32 resulted in a significant reduction in gas cost.  

Another technique to significantly reduce gas cost has been using bitmasks to store data in a uint256.  In particular, storing an array of 8 uint32's in a uint256 or storing an array of 32 uint8's in a uint256. I wrote helper functions that allow a uint256 to be easilly used just like an array:

```
function getData32(uint256 combinedData, uint32 index) internal pure returns(uint32) {
    uint32 offset = index * 32;
    return uint32((combinedData >> offset) & MASK_32_BITS);
}

function setData32(uint256 combinedData, uint32 index, uint32 value) internal pure returns(uint256) {
    uint32 offset = index * 32;
    uint256 zeromask = ~(MASK_32_BITS << offset);
    return (combinedData & zeromask) | (uint256(value) << offset);
}

function getData8(uint256 combinedData, uint32 index) internal pure returns(uint32) {
    uint32 offset = index * 8;
    return uint32((combinedData >> offset) & MASK_8_BITS);
}

function setData8(uint256 combinedData, uint32 index, uint32 value) internal pure returns(uint256) {
    require(value < 256, "Only 8 bits allowed for value.");
    uint32 offset = index * 8;
    uint256 zeromask = ~(MASK_8_BITS << offset);
    return (combinedData & zeromask) | (uint256(value) << offset);
}
```

Lastly, setting debugLog=true with the "Full game simulation until winner" test provides a summary of all gas used when creating a new game and during game play.
