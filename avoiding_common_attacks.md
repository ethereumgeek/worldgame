# Avoiding Common Attacks
WorldGame contract has been designed in order to avoid common attacks on Ethereum smart contracts.

## Reentrancy
The WorldGame contract does not send any ether or call any external contracts. Therefore reetrancy attacks should not be possible. 

## Cross-function Race Conditions
The WorldGame contract does not send any ether or call any external contracts. Therefore cross-function race condition attacks should not be possible.

## Transaction-Ordering Dependence (TOD) / Front Running
Functions critical to game play (such as deploySoldiersAndEndTurn) in the WorldGame contract require a turn # parameter.  This protects against an attack where a transaction isn't initially included, but then is maliciously rebroadcast in the future once it is valid again.

For example, a user might accidentally click "end turn" twice due to delays in the UX refreshing state.  Without this protection their next turn could potentially be skipped.

## Timestamp Dependence
WorldGame contract does not using the timestamp of the block because it can be manipulated by the miner.  

More specifically, the timestamp is not used as a source of randomness in determining attack outcomes. Instead, each attack is pre-committed and a future block hash is used to determine the attack outcome.

## Integer Overflow and Underflow
WorldGame contract uses safe math functions "addSafe", "mulSafe" and "subSafe" in order to prevent integer overflows and underflows.  In some situations comparisons are used before subtracting to prevent integer underflows. 

## DoS with (Unexpected) revert
The WorldGame contract does not send any ether or call any external contracts.  This prevents an external contract from asserting an blocking code flow.

Additionally, WorldGame uses safe math functions "addSafe, "mulSafe" and "subSafe" that don't assert on overflow (or underflow), but instead return MAX_UINT32 (or 0).  This is to reduce the risk of gameplay being blocked by a malicious player.

## DoS with Block Gas Limit
Both # of players (MAX_PLAYERS) and # of queued actions per turn (MAX_ACTIONS_PER_TURN) are limited to a maximum of 8.  Queued actions are executed when a player ends their turn and the limit of 8 queued actions prevents the block gas limit from being exceeded.

Additionally the # of regions (REGION_COUNT) is fixed at 25 which prevents loops involving regions from exceeding the block gas limit.

Steps have also been taken to minimize overall gas usage.  This is to reduce costs, but also reduces the risk of an out of gas attack.

## Forcibly Sending Ether to a Contract
A payable fallback function is included to prevent forcibly sending ether to the WorldGame contract.
```
function() public payable {
    revert("Invalid call to game contract.");
}
```

## Halting Game Play by Malicious Players
In order to prevent a malicious player from halting the game (E.g. if they started losing) there is a parameter called maxBlocksPerTurn that allows a player's turn to be skipped if they take too long.  This must be at least 20 blocks (~5 minutes) to give users enough time to complete their turn.

## Vulnerability in Using Future Block Hashes for Randomness
Attacks are pre-committed and a future block hash (2 blocks after commit) is used as a source of randomness.  However, Ethereum only keeps the 256 most recent block hashes.  Beyond that all block hashes are 0.  Therefore if the block hash is 0 then the attacker loses and sustains maximum injury.  Otherwise delay ending their turn in order to change an attack outcome to their benefit. 

A miner could potentially completely abandon a block if the final block hash resulted in undesirable attack outcomes.  However, this is a very high cost to pay and only buys an extra roll of the dice on a turn.

## Sybil Attacks
A person can easilly assume multiple different identities online.  They can therefore start a game using multiple account addresses that they control in order to collude together during gameplay.

The only protection for this is to only play with people where you know their real identity and to not bet on game outcomes.
