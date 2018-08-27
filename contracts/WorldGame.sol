pragma solidity ^0.4.0;

/** @title World game. Battle to control territory and take over the world. */
contract WorldGame {

    /* Constant to indicate that a region has no owner */
    uint32 constant NOT_OWNED = 255;

    /* Constant to indicate no region */
    uint32 constant NO_REGION = 255;

    /* Number of regions */
    uint32 constant REGION_COUNT = 25;

    /* Maxmimum number of neighbors per region */
    uint32 constant MAX_NEIGHBORS = 5;

    /* Maximum number of players per game */
    uint32 constant MAX_PLAYERS = 8;

    /* Maximum number for actions per turn in a game */
    uint32 constant MAX_ACTIONS_PER_TURN = 8;

    /* Defender advantage in battle numerator */
    uint32 constant DEFENDER_ADVANTAGE_NUM = 5;

    /* Defender advantage in battle denominator  */
    uint32 constant DEFENDER_ADVANTAGE_DENOM = 4;

    /* Reward bonus multiplier denominator  */
    uint32 constant REWARD_BONUS_MULTIPLIER_DENOM = 20;

    /* Minimum value for maxBlocksPerTurn */
    uint32 constant MAX_BLOCKS_THRESHOLD = 20;

    /* 32 bit mask used for helper functions */
    uint256 constant MASK_32_BITS = 0xffffffff;

    /* 8 bit mask used for helper functions */
    uint256 constant MASK_8_BITS = 0xff;

    /* Max uint32 value */
    uint32 constant MAX_UINT32 = 0xffffffff;

    /* Constant to indicate that all regions have no owner */
    uint256 constant ALL_REGIONS_NOT_OWNED = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    /* Initial number of soldier each player starts with. Each play begins with 20 soldiers. */
    uint256 constant BEGIN_SOLDIERS_COUNTS = 0x0000001400000014000000140000001400000014000000140000001400000014;
    
    /* Contract owner used for circuit breaker. */
    address private owner;

    /* Whether circuit breaker is active. */
    bool private stopped;

    /* Historical cache of block hashes. */
    mapping (uint32 => uint32) public blockHash32Map;

    /* Describes which adjacent neighbors each region has. E.g. EASTERN_EUROPE is next to WESTERN_EUROPE. */
    uint32[MAX_NEIGHBORS][REGION_COUNT] public regionNeighbors;

    /* Describes the reward amount given each round for controlling a region. */
    uint32[REGION_COUNT] public regionRewards;

    /* Array of game data.  Each entry in the area represents a different game. */
    GameData[] public gameDataArray;

    /* Enum with all the regions of the game */
    enum Regions {
        HAWAII,
        WESTERN_CANADA,
        EASTERN_CANADA,
        WESTERN_USA,
        EASTERN_USA,
        GREENLAND,
        NORTHERN_SOUTH_AMERICA,
        SOUTHERN_SOUTH_AMERICA,
        WEST_ANTARCTICA,
        EAST_ANTARCTICA,
        WESTERN_EUROPE,
        EASTERN_EUROPE,
        CENTRAL_RUSSIA,
        EASTERN_RUSSIA,
        WEST_AFRICA,
        MIDDLE_EAST,
        EAST_AFRICA,
        SOUTH_AFRICA,
        INDIA,
        EASTERN_CHINA,
        SOUTHEAST_ASIA,
        WESTERN_AUSTRALIA,
        EASTERN_AUSTRALIA,
        NEW_ZEALAND,
        FIJI
    }

    /* Data for an individual game. */
    struct GameData {

        /* Team ID for who's turn it is. */
        uint32 turnTeamId;

        /* A unique ID to identify this turn. */
        uint32 turnNum;

        /* Maxmimum number of blocks per turn. */
        uint32 maxBlocksPerTurn;

        /* Number of players in this game. */
        uint32 playerCount;

        /* Address of each player. */
        address[MAX_PLAYERS] playerAddresses;

        /* Soldiers held by a player in reserve, but not deployed to a region. */
        uint256 undeployedSoldiers;

        /* Which player controls each region. */
        uint256 regionOwners;

        /* Number of soldiers deployed to each region. */
        uint32[REGION_COUNT] regionSoldiers;

        /* Number of actions taken this turn. */
        uint32 actionCount;

        /* Region user is moving soldiers from. Listed by action ID. */
        uint256 fromRegionList;

        /* Region user is moving soldiers to. Listed by action ID.  */
        uint256 toRegionList;

        /* Number of soldiers to move. Listed by action ID. */
        uint256 moveSoldierCountList;

        /* Block number when action was submitted. Listed by action ID. */
        uint256 submitBlockList;

        /* Avatars to use for each team. */
        bytes8 teamAvatars;
    }
    
    /* Event indicating that a new game has started. */
    event NewGame(uint256 gameId, uint32 turnNum, bytes8 teamAvatars);

    /* Event when it's the next player's turn. */
    event NextTurn(uint256 gameId, uint32 turnNum, uint32 nextTeamId);

    /* Event when a player wins the game! */
    event Winner(uint256 gameId, uint32 winningTeamId);

    /* Modifier that only allows player to take action if it's their turn. */
    modifier onlyIfPlayersTurn(uint256 gameId, uint32 turnNum) {
        GameData storage game = gameDataArray[gameId];

        /* Ensure it's message sender's turn. */
        require(
            msg.sender == game.playerAddresses[game.turnTeamId], 
            "Sender not authorized."
        );

        /* Don't allow action to occur on wrong turn. */
        require(game.turnNum == turnNum, "Wrong turn number.");

        _;
    }

    /* Modifier that checks if sender is a player in this game. */
    modifier onlyPlayers(uint256 gameId) {
        GameData storage game = gameDataArray[gameId];

        /* Ensure sender in a player in the game. */
        require(
            msg.sender == game.playerAddresses[0] || 
            msg.sender == game.playerAddresses[1] || 
            msg.sender == game.playerAddresses[2] || 
            msg.sender == game.playerAddresses[3] || 
            msg.sender == game.playerAddresses[4] || 
            msg.sender == game.playerAddresses[5] || 
            msg.sender == game.playerAddresses[6] || 
            msg.sender == game.playerAddresses[7], 
            "Sender not authorized."
        );

        _;
    }

    /* Modifier to only allow moving soldiers between adjacent regions that exist. */
    modifier onlyNeighbors(uint32 regionFrom, uint32 regionTo) {

        /* Ensure regions exist. */
        require(regionFrom < REGION_COUNT && regionTo < REGION_COUNT, "Must be valid regions");

        /* Only allow moving soldiers between adjacent regions. */
        require(
            regionNeighbors[regionFrom][0] == regionTo || 
            regionNeighbors[regionFrom][1] == regionTo || 
            regionNeighbors[regionFrom][2] == regionTo || 
            regionNeighbors[regionFrom][3] == regionTo || 
            regionNeighbors[regionFrom][4] == regionTo,
            "Regions must be neighbors in order to move between them"
        );

        _;
    }

    /* Modifier that only allows owner to call function. */
    modifier isOwner() {
        require(msg.sender == owner, "Only owner can call this function.");

        _;
    }

    /* Modifier that stops function in case of emergency. */
    modifier stopInEmergency() {
        require(stopped == false, "Stopped due to emergency.");

        _;
    }

    /* Constructor initializes common data about regions. */
    constructor() public {
        owner = msg.sender;
        initRegionNeighbors();
        initRegionRewards();
    }

    /* Fallback function. Added so ether sent to this contract is reverted. */
    function() public payable {
        revert("Invalid call to game contract.");
    }

    /* Trigger circuit breaker to prevent new games from being created. */
    function stopNewGames(bool stop)
        public 
        isOwner()
    {
        stopped = stop;
    }

    /// @notice Create a new game instance
    /// @param playerCount number of players
    /// @param playerAddresses address of each player
    /// @param teamAvatars avatar to use for each player
    /// @return Id of the game instance
    function newGame(
        uint32 playerCount, 
        uint32 maxBlocksPerTurn, 
        address[MAX_PLAYERS] playerAddresses, 
        bytes8 teamAvatars
    )
        public
        stopInEmergency() 
        returns(uint256) 
    {
        /* Ensure maxBlocksPerTurn isn't set maliciously low. */
        require(maxBlocksPerTurn >= MAX_BLOCKS_THRESHOLD, "Users must be given enough time to complete their turn.");

        /* 
            Initialize a new game with some default values.
            Push returns array length so subtract 1 to get array index.
        */
        uint256 gameId = gameDataArray.push(GameData(
            /* uint32 turnTeamId */
            uint32(0), 
            /* uint32 turnNum */
            uint32(block.number), 
            /* uint32 maxBlocksPerTurn */
            maxBlocksPerTurn,
            /* uint32 playerCount */
            playerCount,
            /* address[MAX_PLAYERS] playerAddresses */
            playerAddresses, 
            /* uint256 undeployedSoldiers */
            BEGIN_SOLDIERS_COUNTS, 
            /* uint256 regionOwners */
            ALL_REGIONS_NOT_OWNED, 
            /* uint32[REGION_COUNT] regionSoldiers */
            [
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0)
            ], 
            /* uint32 actionCount */
            uint32(0),
            /* uint256 fromRegionList */
            uint256(0), 
            /* uint256 toRegionList */
            uint256(0), 
            /* uint256 moveSoldierCountList */
            uint256(0), 
            /* uint256 submitBlockList */
            uint256(0),
            /* bytes8 teamAvatars */
            teamAvatars
        )) - 1;

        emit NewGame(gameId, uint32(block.number), teamAvatars);
        return gameId;
    }

    /// @notice Move soldiers from one region to an adjacent region.  Attack if moving to enemy territory. 
    /// @param gameId Id of game 
    /// @param turnNum Turn action should occur during 
    /// @param regionFrom Move soldiers from this region
    /// @param regionTo Move soldiers to this region
    /// @param moveSoldierCount Number of soldiers to move
    function attackOrMove(
        uint256 gameId, 
        uint32 turnNum, 
        uint32 regionFrom, 
        uint32 regionTo, 
        uint32 moveSoldierCount
    )
        public 
        onlyIfPlayersTurn(gameId, turnNum) 
        onlyNeighbors(regionFrom, regionTo) 
    {
        GameData storage game = gameDataArray[gameId];
        uint32 i;

        /* Loop through all queued actions. */
        for (i = 0; i < game.actionCount; i++) {
            /* Ensure region doesn't already have a queued action. */
            require(
                regionTo != getData32(game.toRegionList, i), 
                "Region already has queued action."
            );
        }
        require(game.actionCount < MAX_ACTIONS_PER_TURN, "Only 8 actions are allowed per turn");
        require(game.regionSoldiers[regionFrom] > moveSoldierCount, "Must have sufficient soldiers");
        require(game.turnTeamId == getData8(game.regionOwners, regionFrom), "Must own region moving from");

        /* Index to use for creating a new action */
        i = game.actionCount;

        /* Remove soldiers from region */
        game.regionSoldiers[regionFrom] -= moveSoldierCount;

        /* Queue a new action for this turn */
        game.fromRegionList = setData32(game.fromRegionList, i, regionFrom);
        game.toRegionList = setData32(game.toRegionList, i, regionTo);
        game.moveSoldierCountList = setData32(game.moveSoldierCountList, i, moveSoldierCount);
        game.submitBlockList = setData32(game.submitBlockList, i, uint32(block.number));

        /* Update action count */
        game.actionCount++;
    }

    /// @notice Execute actions that have been queued for this turn.
    /// @param gameId Id of game 
    /// @param turnNum Turn deploySoldiersAndEndTurn should occur during 
    /// @param regionDeploy Region where you'd like to deploy soldiers to
    /// @param deploySoldierCount Number of soldiers you'd like to deploy at end of your turn
    function deploySoldiersAndEndTurn(
        uint256 gameId, 
        uint32 turnNum, 
        uint32 regionDeploy, 
        uint32 deploySoldierCount
    )
        public 
        onlyIfPlayersTurn(gameId, turnNum) 
    {
        GameData storage game = gameDataArray[gameId];
        uint32 undeployedSoldierCount = getData32(game.undeployedSoldiers, game.turnTeamId);

        require(undeployedSoldierCount >= deploySoldierCount, "Must have sufficient soldiers.");
        require(
            (regionDeploy == NO_REGION && deploySoldierCount == 0) || 
            getData8(game.regionOwners, regionDeploy) == game.turnTeamId || 
            getData8(game.regionOwners, regionDeploy) == NOT_OWNED,
            "You can only deploy soldiers to a region you own, or that is unoccupied."
        );

        /* If there's any queued actions then execute them before ending turn. */
        if (game.actionCount > 0) {
            executePendingActions(gameId);
        }

        /* Deploy soldiers if a region is specified */
        if (regionDeploy != NO_REGION) {
            game.regionOwners = setData8(game.regionOwners, regionDeploy, game.turnTeamId);
            game.undeployedSoldiers = setData32(
                game.undeployedSoldiers, 
                game.turnTeamId, 
                subSafe(undeployedSoldierCount, deploySoldierCount)
            );
            game.regionSoldiers[regionDeploy] = addSafe(
                game.regionSoldiers[regionDeploy],
                deploySoldierCount
            );
        }

        /* It's the next player's turn */
        game.turnTeamId = getNextTurnTeamId(gameId);
        game.turnNum = uint32(block.number);

        /* Give bonus soldiers to next team based on what regions they control. */
        giveRegionRewards(gameId);

        emit NextTurn(gameId, game.turnNum, game.turnTeamId);
    }

    /// @notice Force turn to end for player who's taking too long.
    /// @param gameId Id of game 
    /// @param turnNum Turn forceEndOfTurn should occur during 
    function forceEndOfTurn(
        uint256 gameId, 
        uint32 turnNum
    )
        public 
        onlyPlayers(gameId)
    {
        GameData storage game = gameDataArray[gameId];
        require(game.turnNum == turnNum, "Wrong turn number.");
        require(addSafe(game.turnNum, game.maxBlocksPerTurn) > block.number, "Player still has time to finish turn.");

        /* If there's any queued actions then execute them before ending turn. */
        if (game.actionCount > 0) {
            executePendingActions(gameId);
        }

        /* It's the next player's turn */
        game.turnTeamId = getNextTurnTeamId(gameId);
        game.turnNum = uint32(block.number);

        /* Give bonus soldiers to next team based on what regions they control. */
        giveRegionRewards(gameId);

        emit NextTurn(gameId, game.turnNum, game.turnTeamId);
    }

    /// @notice Declare victory for a team.
    /// @param gameId Id of game
    /// @param teamId Team you'd like to declare as winner
    function declareWinner(uint256 gameId, uint32 teamId) 
        public 
        onlyPlayers(gameId)
    {
        GameData storage game = gameDataArray[gameId];
        
        bool isWinner = true;
        for (uint32 i = 0; i < REGION_COUNT; i++) {
            if (getData8(game.regionOwners, i) != teamId) {
                isWinner = false;
            }
        }

        require(isWinner, "We don't have a winner.");

        if (isWinner) {
            emit Winner(gameId, teamId);
        }
    }

    /// @notice Caches the hash for a specific block in a map.  Only uses last 32 bits.
    /// @param blockNum Block number
    /// @return Last 32 bits of block hash, or 0 if not available
    function cacheBlockHash32(uint32 blockNum) public returns(uint32) {
        uint32 cachedBlockHash = blockHash32Map[blockNum];

        if (cachedBlockHash == 0) {
            cachedBlockHash = uint32(blockhash(blockNum));
            blockHash32Map[blockNum] = cachedBlockHash;
        }

        return cachedBlockHash;
    }

    /// @notice Get hash for a specific block.  Only uses last 32 bits.
    /// @param blockNum Block number
    /// @return Last 32 bits of block hash, or 0 if not available
    function readBlockHash32(uint32 blockNum) public view returns(uint32) {
        uint32 blockHash32 = uint32(blockhash(blockNum));

        if (blockHash32 == 0) {
            blockHash32 = blockHash32Map[blockNum];
        }

        return blockHash32;
    }

    /// @notice Returns total number of games that have been created.
    function numberOfGames() public view returns(uint256) {
        return gameDataArray.length;
    }

    /// @notice Returns recent game ids where msg.sender is a player.
    /// @param offset Position in game data array to start search from
    /// @return List of game ids
    /// @return Number of game ids
    /// @return Position in loop when ended
    function listGamesForAddress(uint256 offset) 
        public 
        view 
        returns(uint256[10], uint32, uint256) 
    {
        uint256[10] memory gameIdList;
        uint32 gameIdCount;
        uint256 gameId;
        if (gameDataArray.length > 0) {

            /* Start position to search backwards through gameDataArray */
            uint256 startPosition = gameDataArray.length - 1;
            if (offset > 0 && offset < startPosition) {
                startPosition = offset;
            }

            /* Add one to "i" to prevent underflow.  Then sub one from "i" to get gameId. */
            for (uint256 i = startPosition + 1; i > 0; i--) {
                gameId = i - 1;

                GameData storage game = gameDataArray[gameId];
                for (uint32 j = 0; j < game.playerCount; j++) {
                    if (game.playerAddresses[j] == msg.sender) {
                        gameIdList[gameIdCount] = gameId;
                        gameIdCount++;
                        break;
                    }
                }

                if (gameIdCount == 10 || gasleft() < 100000) {
                    break;
                }
            }
        }

        return (gameIdList, gameIdCount, gameId);
    }

    /// @notice Returns the number of soldiers deployed to each region and region owners.
    /// @param gameId Id of game 
    /// @return List of which player owns each region
    /// @return List of number of soldiers deployed to each region
    function soldiersByRegion(uint256 gameId) 
        public 
        view 
        returns(uint32[REGION_COUNT], uint32[REGION_COUNT]) 
    {
        GameData storage game = gameDataArray[gameId];

        uint32[REGION_COUNT] memory regionOwnersList;
        for (uint32 i = 0; i < REGION_COUNT; i++) {
            regionOwnersList[i] = getData8(game.regionOwners, i);
        }

        return (regionOwnersList, game.regionSoldiers);
    }

    /// @notice Returns information about current turn and players.
    /// @param gameId Id of game 
    /// @return Id of current player
    /// @return Turn number
    /// @return Max blocks per turn
    /// @return Number of players
    /// @return Player addresses
    function turnAndPlayerInfo(uint256 gameId) 
        public 
        view 
        returns(uint32, uint32, uint32, uint32, address[MAX_PLAYERS], bytes8) 
    {
        GameData storage game = gameDataArray[gameId];
        return (
            game.turnTeamId, 
            game.turnNum, 
            game.maxBlocksPerTurn, 
            game.playerCount, 
            game.playerAddresses,
            game.teamAvatars
        );
    }

    /// @notice Returns the number of undeployed soldiers for each player.
    /// @param gameId Id of game 
    /// @return Number of undeployed soldiers for each player
    /// @return Reward points for each player
    function undeployedSoldiers(uint256 gameId) 
        public 
        view 
        returns(uint32[MAX_PLAYERS], uint32[MAX_PLAYERS]) 
    {
        GameData storage game = gameDataArray[gameId];

        uint32[MAX_PLAYERS] memory undeployedSoldiersList;
        uint32[MAX_PLAYERS] memory regionRewardList;
        for (uint32 i = 0; i < MAX_PLAYERS; i++) {
            undeployedSoldiersList[i] = getData32(game.undeployedSoldiers, i);
            regionRewardList[i] = calculateRegionRewards(gameId, i); 
        }

        return (undeployedSoldiersList, regionRewardList);
    }

    /// @notice Returns pending actions that have been queued for current turn.
    /// @param gameId Id of game 
    /// @return Number of pending actions
    /// @return List of regions moving soldiers from
    /// @return List of regions moving soldiers to
    /// @return List with number of soldiers to move
    /// @return List with block number when action was queued
    function pendingActions(uint256 gameId) 
        public 
        view 
        returns(
            uint32,
            uint32[MAX_ACTIONS_PER_TURN], 
            uint32[MAX_ACTIONS_PER_TURN], 
            uint32[MAX_ACTIONS_PER_TURN], 
            uint32[MAX_ACTIONS_PER_TURN]
    ) {
        GameData storage game = gameDataArray[gameId];

        uint32[MAX_ACTIONS_PER_TURN] memory fromRegionList;
        uint32[MAX_ACTIONS_PER_TURN] memory toRegionList;
        uint32[MAX_ACTIONS_PER_TURN] memory moveSoldierCountList;
        uint32[MAX_ACTIONS_PER_TURN] memory submitBlockList;

        for (uint32 i = 0; i < MAX_ACTIONS_PER_TURN; i++) {
            fromRegionList[i] = getData32(game.fromRegionList, i);
            toRegionList[i] = getData32(game.toRegionList, i);
            moveSoldierCountList[i] = getData32(game.moveSoldierCountList, i);
            submitBlockList[i] = getData32(game.submitBlockList, i);
        }

        return (
            game.actionCount, 
            fromRegionList, 
            toRegionList, 
            moveSoldierCountList, 
            submitBlockList
        );
    }

    /// @notice Returns pending actions that have been queued for current turn.
    /// @param gameId Id of game 
    /// @return Current block numbber
    /// @return Number of pending actions
    /// @return List with block number when action was queued
    /// @return Number of remaining attackers
    /// @return Number of remaining defenders
    function pendingActionOutcomes(uint256 gameId) 
        public 
        view 
        returns(
            uint32,
            uint32,
            uint32[MAX_ACTIONS_PER_TURN], 
            uint32[MAX_ACTIONS_PER_TURN], 
            uint32[MAX_ACTIONS_PER_TURN]
    ) {
        GameData storage game = gameDataArray[gameId];

        uint32[MAX_ACTIONS_PER_TURN] memory submitBlockList;
        uint32[MAX_ACTIONS_PER_TURN] memory remainingAttackerList;
        uint32[MAX_ACTIONS_PER_TURN] memory remainingDefenderList;

        for (uint32 i = 0; i < MAX_ACTIONS_PER_TURN; i++) {
            uint32 toRegion = getData32(game.toRegionList, i);
            submitBlockList[i] = getData32(game.submitBlockList, i);

            bool friendly = getData8(game.regionOwners, toRegion) == game.turnTeamId || 
                getData8(game.regionOwners, toRegion) == NOT_OWNED;

            if (friendly || block.number > submitBlockList[i] + 1) {
                (uint32 remainingAttackers, uint32 remainingDefenders) = getOutcomeAttackOrMove(
                    /* uint32 submitBlock */
                    submitBlockList[i], 
                    /* uint32 moveSoldierCount */
                    getData32(game.moveSoldierCountList, i), 
                    /* uint32 defenderCount  */
                    game.regionSoldiers[toRegion],
                    /* bool friendly  */
                    friendly
                );

                remainingAttackerList[i] = remainingAttackers;
                remainingDefenderList[i] = remainingDefenders;
            }
        }

        return (
            uint32(block.number), 
            game.actionCount, 
            submitBlockList, 
            remainingAttackerList,
            remainingDefenderList
        );
    }

    /// @notice Execute actions that have been queued for this turn.
    /// @param gameId Id of game 
    function executePendingActions(
        uint256 gameId
    ) 
        private 
    {
        GameData storage game = gameDataArray[gameId];

        /* Loops through all queued actions executing them one by one. */
        for (uint32 i = 0; i < game.actionCount; i++) {
            uint32 regionFrom = getData32(game.fromRegionList, i);
            uint32 regionTo = getData32(game.toRegionList, i);
            bool friendly = getData8(game.regionOwners, regionTo) == game.turnTeamId ||
                getData8(game.regionOwners, regionTo) == NOT_OWNED;

            /* 
                If attacking enemy territory, then uses randomness to determine outcome.
                If moving to friendly territory then just moves the soldiers. 
            */
            (uint32 remainingAttackers, uint32 remainingDefenders) = getOutcomeAttackOrMove(
                /* uint32 submitBlock */
                getData32(game.submitBlockList, i), 
                /* uint32 moveSoldierCount */
                getData32(game.moveSoldierCountList, i), 
                /* uint32 defenderCount  */
                game.regionSoldiers[regionTo],
                /* bool friendly  */
                friendly
            );

            if (remainingDefenders == 0) {
                /* Attacker wins (or move was friendly).  Remaining attackers move to new region. */
                game.regionSoldiers[regionTo] = remainingAttackers;
                game.regionOwners = setData8(game.regionOwners, regionTo, game.turnTeamId);
            }
            else {
                /* Defender wins.  Remaining attackers return back home. */
                game.regionSoldiers[regionFrom] = addSafe(
                    game.regionSoldiers[regionFrom], 
                    remainingAttackers
                );
                game.regionSoldiers[regionTo] = remainingDefenders;
            }
        }

        /* Reset action count to 0. */
        game.actionCount = 0;
    }

    /// @notice Player who's turn is next. 
    /// @param gameId Id of game
    /// @return Next player's turn
    function getNextTurnTeamId(
        uint256 gameId
    ) 
        private 
        view 
        returns(uint32) 
    {
        GameData storage game = gameDataArray[gameId];
        bool[MAX_PLAYERS] memory playerOwnsRegion;
        bool hasNotOwned = false;
        uint32 i;
        
        for (i = 0; i < REGION_COUNT; i++) {
            uint32 regionOwner = getData8(game.regionOwners, i);
            if (regionOwner == NOT_OWNED) {
                hasNotOwned = true;
            }
            else {
                playerOwnsRegion[regionOwner] = true;
            }
        }

        uint32 turnTeamId = game.turnTeamId;
        for (i = 0; i < game.playerCount; i++) {
            turnTeamId = (turnTeamId + 1) % game.playerCount;
            if (hasNotOwned || playerOwnsRegion[turnTeamId]) {
                break;
            }
        }

        return turnTeamId;
    }

    /// @notice Declare victory for a team.
    /// @param submitBlock Block number when action was submitted to queue
    /// @param moveSoldierCount Number of soldiers to move or attack
    /// @param defenderCount Number of soldiers defending destination region
    /// @param friendly Whether this is an attack, or friendly move
    /// @return remainingAttackers Number of attacking soldiers remaining 
    /// @return remainingDefenders Number of defending soldiers remaining
    function getOutcomeAttackOrMove(
        uint32 submitBlock, 
        uint32 moveSoldierCount, 
        uint32 defenderCount, 
        bool friendly
    ) 
        private 
        view 
        returns(uint32, uint32) 
    {
        require(friendly || block.number > submitBlock + 1, "Attacks must be at least 2 blocks old.");

        if (friendly) {
            /* If friendly, just move all soldiers to attacking side. */
            return (addSafe(moveSoldierCount, defenderCount), 0);
        }
        else {
            /* 
                Determine outcome of attack.
                Use blockHash of the block after action was submitted as a source of randomness.

                Only most recent 256 blockhashes are available.
                If too much time has ellapsed, then blockHash will be 0 and attacker loses.
            */
            uint32 blockHash32 = readBlockHash32(submitBlock + 1);
            uint32 deadDefenders = 0;
            uint32 deadAttackers = 0;

            /* If blockHash32 is no longer available then attacker loses by default. */
            if (blockHash32 == 0) {
                deadDefenders = 0;
                deadAttackers = mulSafe(defenderCount, DEFENDER_ADVANTAGE_NUM) / DEFENDER_ADVANTAGE_DENOM;
            }
            /* If blockHash32 is available then use it as a source of randomness. */
            else {
                uint32 randA = uint32(blockHash32 % 256);
                uint32 randB = uint32((blockHash32 >> 8) % 256);

                /* Determine effectiveness of attack. */
                deadDefenders = mulSafe(moveSoldierCount, randA) / 256;

                /* Determine effectiveness of defence.  Gives slight extra advantage to defender. */
                deadAttackers = mulSafe(defenderCount, DEFENDER_ADVANTAGE_NUM * randB) / 
                    (256 * DEFENDER_ADVANTAGE_DENOM);
            }

            /* Determine remaining attackers by subtracting dead attackers. */
            uint32 remainingAttackers = (moveSoldierCount > deadAttackers) ? 
                (moveSoldierCount - deadAttackers) : 0;

            /* 
                Determine remaining defenders by subtracting dead defenders.
                If all attackers are dead then keep at least 1 defender.
            */
            uint32 remainingDefenders = (defenderCount > deadDefenders) ? 
                (defenderCount - deadDefenders) : (remainingAttackers > 0 ? 0 : 1);

            return (remainingAttackers, remainingDefenders);
        }
    }

    /// @notice Calculate a team's reward amount based on what regions they control.
    /// @param gameId Id of game
    /// @param teamId Team you'd like to calculate rewards for
    /// @return Reward amount for team
    function calculateRegionRewards(uint256 gameId, uint32 teamId) 
        private 
        view 
        returns(uint32) 
    {
        GameData storage game = gameDataArray[gameId];

        /* Reward total based on what regions player controls. */
        uint32 rewardTotal = 0;

        /* Bonus multiplier of 5% given per additional region controller.  */
        uint32 bonusScore = REWARD_BONUS_MULTIPLIER_DENOM - 1;
        for (uint32 i = 0; i < REGION_COUNT; i++) {
            if (getData8(game.regionOwners, i) == teamId) {
                rewardTotal += regionRewards[i];
                bonusScore++;
            }
        }

        return ((rewardTotal * bonusScore) / REWARD_BONUS_MULTIPLIER_DENOM);
    }

    /// @notice Reward team with soldiers based on what regions they control.
    /// @param gameId Id of game
    function giveRegionRewards(uint256 gameId) private {
        GameData storage game = gameDataArray[gameId];

        /* Team who's turn it is that gets the reward. */
        uint32 teamId = game.turnTeamId;

        /* Reward total based on what regions player controls. */
        uint32 rewardAmount = calculateRegionRewards(gameId, teamId);

        /* Add reward to undeployed soldiers count. */
        uint32 undeployedSoldierCount = getData32(game.undeployedSoldiers, teamId);
        game.undeployedSoldiers = setData32(
            game.undeployedSoldiers, 
            teamId, 
            addSafe(undeployedSoldierCount, rewardAmount)
        );
    }

    /// @notice Initialize neighbor relationships between all regions
    /// @dev This data shared by all game instances
    function initRegionNeighbors() private {
        regionNeighbors[uint32(Regions.HAWAII)][0] = uint32(Regions.WESTERN_USA);
        regionNeighbors[uint32(Regions.HAWAII)][1] = uint32(Regions.FIJI);
        regionNeighbors[uint32(Regions.HAWAII)][2] = NO_REGION;
        regionNeighbors[uint32(Regions.HAWAII)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.HAWAII)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.WESTERN_CANADA)][0] = uint32(Regions.WESTERN_USA);
        regionNeighbors[uint32(Regions.WESTERN_CANADA)][1] = uint32(Regions.EASTERN_CANADA);
        regionNeighbors[uint32(Regions.WESTERN_CANADA)][2] = uint32(Regions.EASTERN_RUSSIA);
        regionNeighbors[uint32(Regions.WESTERN_CANADA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.WESTERN_CANADA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.EASTERN_CANADA)][0] = uint32(Regions.WESTERN_CANADA);
        regionNeighbors[uint32(Regions.EASTERN_CANADA)][1] = uint32(Regions.GREENLAND);
        regionNeighbors[uint32(Regions.EASTERN_CANADA)][2] = uint32(Regions.EASTERN_USA);
        regionNeighbors[uint32(Regions.EASTERN_CANADA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.EASTERN_CANADA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.WESTERN_USA)][0] = uint32(Regions.HAWAII);
        regionNeighbors[uint32(Regions.WESTERN_USA)][1] = uint32(Regions.WESTERN_CANADA);
        regionNeighbors[uint32(Regions.WESTERN_USA)][2] = uint32(Regions.EASTERN_USA);
        regionNeighbors[uint32(Regions.WESTERN_USA)][3] = uint32(Regions.NORTHERN_SOUTH_AMERICA);
        regionNeighbors[uint32(Regions.WESTERN_USA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.EASTERN_USA)][0] = uint32(Regions.WESTERN_USA);
        regionNeighbors[uint32(Regions.EASTERN_USA)][1] = uint32(Regions.EASTERN_CANADA);
        regionNeighbors[uint32(Regions.EASTERN_USA)][2] = uint32(Regions.NORTHERN_SOUTH_AMERICA);
        regionNeighbors[uint32(Regions.EASTERN_USA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.EASTERN_USA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.GREENLAND)][0] = uint32(Regions.EASTERN_CANADA);
        regionNeighbors[uint32(Regions.GREENLAND)][1] = uint32(Regions.WESTERN_EUROPE);
        regionNeighbors[uint32(Regions.GREENLAND)][2] = NO_REGION;
        regionNeighbors[uint32(Regions.GREENLAND)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.GREENLAND)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.NORTHERN_SOUTH_AMERICA)][0] = uint32(Regions.WESTERN_USA);
        regionNeighbors[uint32(Regions.NORTHERN_SOUTH_AMERICA)][1] = uint32(Regions.EASTERN_USA);
        regionNeighbors[uint32(Regions.NORTHERN_SOUTH_AMERICA)][2] = uint32(Regions.SOUTHERN_SOUTH_AMERICA);
        regionNeighbors[uint32(Regions.NORTHERN_SOUTH_AMERICA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.NORTHERN_SOUTH_AMERICA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.SOUTHERN_SOUTH_AMERICA)][0] = uint32(Regions.NORTHERN_SOUTH_AMERICA);
        regionNeighbors[uint32(Regions.SOUTHERN_SOUTH_AMERICA)][1] = uint32(Regions.WEST_ANTARCTICA);
        regionNeighbors[uint32(Regions.SOUTHERN_SOUTH_AMERICA)][2] = NO_REGION;
        regionNeighbors[uint32(Regions.SOUTHERN_SOUTH_AMERICA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.SOUTHERN_SOUTH_AMERICA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.WEST_ANTARCTICA)][0] = uint32(Regions.SOUTHERN_SOUTH_AMERICA);
        regionNeighbors[uint32(Regions.WEST_ANTARCTICA)][1] = uint32(Regions.EAST_ANTARCTICA);
        regionNeighbors[uint32(Regions.WEST_ANTARCTICA)][2] = NO_REGION;
        regionNeighbors[uint32(Regions.WEST_ANTARCTICA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.WEST_ANTARCTICA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.EAST_ANTARCTICA)][0] = uint32(Regions.WEST_ANTARCTICA);
        regionNeighbors[uint32(Regions.EAST_ANTARCTICA)][1] = uint32(Regions.NEW_ZEALAND);
        regionNeighbors[uint32(Regions.EAST_ANTARCTICA)][2] = NO_REGION;
        regionNeighbors[uint32(Regions.EAST_ANTARCTICA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.EAST_ANTARCTICA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.WESTERN_EUROPE)][0] = uint32(Regions.GREENLAND);
        regionNeighbors[uint32(Regions.WESTERN_EUROPE)][1] = uint32(Regions.EASTERN_EUROPE);
        regionNeighbors[uint32(Regions.WESTERN_EUROPE)][2] = uint32(Regions.WEST_AFRICA);
        regionNeighbors[uint32(Regions.WESTERN_EUROPE)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.WESTERN_EUROPE)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.EASTERN_EUROPE)][0] = uint32(Regions.WESTERN_EUROPE);
        regionNeighbors[uint32(Regions.EASTERN_EUROPE)][1] = uint32(Regions.WEST_AFRICA);
        regionNeighbors[uint32(Regions.EASTERN_EUROPE)][2] = uint32(Regions.MIDDLE_EAST);
        regionNeighbors[uint32(Regions.EASTERN_EUROPE)][3] = uint32(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint32(Regions.EASTERN_EUROPE)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.CENTRAL_RUSSIA)][0] = uint32(Regions.EASTERN_EUROPE);
        regionNeighbors[uint32(Regions.CENTRAL_RUSSIA)][1] = uint32(Regions.MIDDLE_EAST);
        regionNeighbors[uint32(Regions.CENTRAL_RUSSIA)][2] = uint32(Regions.INDIA);
        regionNeighbors[uint32(Regions.CENTRAL_RUSSIA)][3] = uint32(Regions.EASTERN_CHINA);
        regionNeighbors[uint32(Regions.CENTRAL_RUSSIA)][4] = uint32(Regions.EASTERN_RUSSIA);

        regionNeighbors[uint32(Regions.EASTERN_RUSSIA)][0] = uint32(Regions.EASTERN_CHINA);
        regionNeighbors[uint32(Regions.EASTERN_RUSSIA)][1] = uint32(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint32(Regions.EASTERN_RUSSIA)][2] = uint32(Regions.WESTERN_CANADA);
        regionNeighbors[uint32(Regions.EASTERN_RUSSIA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.EASTERN_RUSSIA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.WEST_AFRICA)][0] = uint32(Regions.WESTERN_EUROPE);
        regionNeighbors[uint32(Regions.WEST_AFRICA)][1] = uint32(Regions.EASTERN_EUROPE);
        regionNeighbors[uint32(Regions.WEST_AFRICA)][2] = uint32(Regions.MIDDLE_EAST);
        regionNeighbors[uint32(Regions.WEST_AFRICA)][3] = uint32(Regions.EAST_AFRICA);
        regionNeighbors[uint32(Regions.WEST_AFRICA)][4] = uint32(Regions.SOUTH_AFRICA);

        regionNeighbors[uint32(Regions.MIDDLE_EAST)][0] = uint32(Regions.EASTERN_EUROPE);
        regionNeighbors[uint32(Regions.MIDDLE_EAST)][1] = uint32(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint32(Regions.MIDDLE_EAST)][2] = uint32(Regions.INDIA);
        regionNeighbors[uint32(Regions.MIDDLE_EAST)][3] = uint32(Regions.EAST_AFRICA);
        regionNeighbors[uint32(Regions.MIDDLE_EAST)][4] = uint32(Regions.WEST_AFRICA);

        regionNeighbors[uint32(Regions.EAST_AFRICA)][0] = uint32(Regions.WEST_AFRICA);
        regionNeighbors[uint32(Regions.EAST_AFRICA)][1] = uint32(Regions.SOUTH_AFRICA);
        regionNeighbors[uint32(Regions.EAST_AFRICA)][2] = uint32(Regions.MIDDLE_EAST);
        regionNeighbors[uint32(Regions.EAST_AFRICA)][3] = uint32(Regions.INDIA);
        regionNeighbors[uint32(Regions.EAST_AFRICA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.SOUTH_AFRICA)][0] = uint32(Regions.WEST_AFRICA);
        regionNeighbors[uint32(Regions.SOUTH_AFRICA)][1] = uint32(Regions.EAST_AFRICA);
        regionNeighbors[uint32(Regions.SOUTH_AFRICA)][2] = NO_REGION;
        regionNeighbors[uint32(Regions.SOUTH_AFRICA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.SOUTH_AFRICA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.INDIA)][0] = uint32(Regions.EAST_AFRICA);
        regionNeighbors[uint32(Regions.INDIA)][1] = uint32(Regions.MIDDLE_EAST);
        regionNeighbors[uint32(Regions.INDIA)][2] = uint32(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint32(Regions.INDIA)][3] = uint32(Regions.EASTERN_CHINA);
        regionNeighbors[uint32(Regions.INDIA)][4] = uint32(Regions.SOUTHEAST_ASIA);

        regionNeighbors[uint32(Regions.EASTERN_CHINA)][0] = uint32(Regions.INDIA);
        regionNeighbors[uint32(Regions.EASTERN_CHINA)][1] = uint32(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint32(Regions.EASTERN_CHINA)][2] = uint32(Regions.EASTERN_RUSSIA);
        regionNeighbors[uint32(Regions.EASTERN_CHINA)][3] = uint32(Regions.SOUTHEAST_ASIA);
        regionNeighbors[uint32(Regions.EASTERN_CHINA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.SOUTHEAST_ASIA)][0] = uint32(Regions.INDIA);
        regionNeighbors[uint32(Regions.SOUTHEAST_ASIA)][1] = uint32(Regions.EASTERN_CHINA);
        regionNeighbors[uint32(Regions.SOUTHEAST_ASIA)][2] = uint32(Regions.WESTERN_AUSTRALIA);
        regionNeighbors[uint32(Regions.SOUTHEAST_ASIA)][3] = uint32(Regions.EASTERN_AUSTRALIA);
        regionNeighbors[uint32(Regions.SOUTHEAST_ASIA)][4] = uint32(Regions.FIJI);

        regionNeighbors[uint32(Regions.WESTERN_AUSTRALIA)][0] = uint32(Regions.EASTERN_AUSTRALIA);
        regionNeighbors[uint32(Regions.WESTERN_AUSTRALIA)][1] = uint32(Regions.SOUTHEAST_ASIA);
        regionNeighbors[uint32(Regions.WESTERN_AUSTRALIA)][2] = NO_REGION;
        regionNeighbors[uint32(Regions.WESTERN_AUSTRALIA)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.WESTERN_AUSTRALIA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.EASTERN_AUSTRALIA)][0] = uint32(Regions.WESTERN_AUSTRALIA);
        regionNeighbors[uint32(Regions.EASTERN_AUSTRALIA)][1] = uint32(Regions.SOUTHEAST_ASIA);
        regionNeighbors[uint32(Regions.EASTERN_AUSTRALIA)][2] = uint32(Regions.FIJI);
        regionNeighbors[uint32(Regions.EASTERN_AUSTRALIA)][3] = uint32(Regions.NEW_ZEALAND);
        regionNeighbors[uint32(Regions.EASTERN_AUSTRALIA)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.NEW_ZEALAND)][0] = uint32(Regions.EASTERN_AUSTRALIA);
        regionNeighbors[uint32(Regions.NEW_ZEALAND)][1] = uint32(Regions.FIJI);
        regionNeighbors[uint32(Regions.NEW_ZEALAND)][2] = uint32(Regions.EAST_ANTARCTICA);
        regionNeighbors[uint32(Regions.NEW_ZEALAND)][3] = NO_REGION;
        regionNeighbors[uint32(Regions.NEW_ZEALAND)][4] = NO_REGION;

        regionNeighbors[uint32(Regions.FIJI)][0] = uint32(Regions.NEW_ZEALAND);
        regionNeighbors[uint32(Regions.FIJI)][1] = uint32(Regions.EASTERN_AUSTRALIA);
        regionNeighbors[uint32(Regions.FIJI)][2] = uint32(Regions.SOUTHEAST_ASIA);
        regionNeighbors[uint32(Regions.FIJI)][3] = uint32(Regions.HAWAII);
        regionNeighbors[uint32(Regions.FIJI)][4] = NO_REGION;
    }

    /// @notice Initialize rewards given for controlling each region
    /// @dev This data shared by all game instances
    function initRegionRewards() private {
        regionRewards[uint32(Regions.HAWAII)] = 3;
        regionRewards[uint32(Regions.WESTERN_CANADA)] = 6;
        regionRewards[uint32(Regions.EASTERN_CANADA)] = 5;
        regionRewards[uint32(Regions.WESTERN_USA)] = 11;
        regionRewards[uint32(Regions.EASTERN_USA)] = 8;
        regionRewards[uint32(Regions.GREENLAND)] = 3;
        regionRewards[uint32(Regions.NORTHERN_SOUTH_AMERICA)] = 3;
        regionRewards[uint32(Regions.SOUTHERN_SOUTH_AMERICA)] = 4;
        regionRewards[uint32(Regions.WEST_ANTARCTICA)] = 2;
        regionRewards[uint32(Regions.EAST_ANTARCTICA)] = 2;
        regionRewards[uint32(Regions.WESTERN_EUROPE)] = 10;
        regionRewards[uint32(Regions.EASTERN_EUROPE)] = 6;
        regionRewards[uint32(Regions.CENTRAL_RUSSIA)] = 4;
        regionRewards[uint32(Regions.EASTERN_RUSSIA)] = 3;
        regionRewards[uint32(Regions.WEST_AFRICA)] = 3;
        regionRewards[uint32(Regions.MIDDLE_EAST)] = 4;
        regionRewards[uint32(Regions.EAST_AFRICA)] = 3;
        regionRewards[uint32(Regions.SOUTH_AFRICA)] = 5;
        regionRewards[uint32(Regions.INDIA)] = 7;
        regionRewards[uint32(Regions.EASTERN_CHINA)] = 10;
        regionRewards[uint32(Regions.SOUTHEAST_ASIA)] = 5;
        regionRewards[uint32(Regions.WESTERN_AUSTRALIA)] = 4;
        regionRewards[uint32(Regions.EASTERN_AUSTRALIA)] = 6;
        regionRewards[uint32(Regions.NEW_ZEALAND)] = 4;
        regionRewards[uint32(Regions.FIJI)] = 2;
    }

    /// @notice Reads data using a uint256 to store an array of 8 uint32s
    /// @param combinedData A uint256 which contains data for 8 uint32s
    /// @param index Position in array to read
    /// @return Value at position index
    function getData32(uint256 combinedData, uint32 index) internal pure returns(uint32) {
        uint32 offset = index * 32;
        return uint32((combinedData >> offset) & MASK_32_BITS);
    }

    /// @notice Writes data using a uint256 to store an array of 8 uint32s
    /// @param combinedData A uint256 which contains data for 8 uint32s
    /// @param index Position in array to write
    /// @param value Value to write at position index.  Value must fit in a uint32.
    /// @return Updated combined data
    function setData32(uint256 combinedData, uint32 index, uint32 value) internal pure returns(uint256) {
        uint32 offset = index * 32;
        uint256 zeromask = ~(MASK_32_BITS << offset);
        return (combinedData & zeromask) | (uint256(value) << offset);
    }

    /// @notice Reads data using a uint256 to store an array of 32 uint8s
    /// @param combinedData A uint256 which contains data for 32 uint8s
    /// @param index Position in array to read
    /// @return Value at position index
    function getData8(uint256 combinedData, uint32 index) internal pure returns(uint32) {
        uint32 offset = index * 8;
        return uint32((combinedData >> offset) & MASK_8_BITS);
    }

    /// @notice Writes data using a uint256 to store an array of 32 uint8s
    /// @param combinedData A uint256 which contains data for 32 uint8s
    /// @param index Position in array to write
    /// @param value Value to write at position index.  Value must be less than 256.
    /// @return Updated combined data
    function setData8(uint256 combinedData, uint32 index, uint32 value) internal pure returns(uint256) {
        require(value < 256, "Only 8 bits allowed for value.");
        uint32 offset = index * 8;
        uint256 zeromask = ~(MASK_8_BITS << offset);
        return (combinedData & zeromask) | (uint256(value) << offset);
    }

    /// @notice Safe subtraction that returns 0 on underflow.
    /// @dev We intentially don't assert so as to not block program execution.
    /// @param _a Value to subtract from
    /// @param _b Value to subtract
    /// @return Result of _a - _b
    function subSafe(uint32 _a, uint32 _b) internal pure returns (uint32) {
        if (_b <= _a) {
            uint32 c = _a - _b;
            return c;
        }

        return 0;
    }

    /// @notice Safe addition that returns MAX_UINT32 on overflow
    /// @dev We intentially don't assert so as to not block program execution.
    /// @param _a First value to add
    /// @param _b Second value to add
    /// @return Result of _a + _b
    function addSafe(uint32 _a, uint32 _b) internal pure returns (uint32) {
        uint32 c = _a + _b;
        if (c >= _a) {
            return c;
        }

        return MAX_UINT32;
    }

    /// @notice Safe multiplication that returns MAX_UINT32 on overflow
    /// @dev We intentially don't assert so as to not block program execution.
    /// @param _a First value to multiply
    /// @param _b Second value to multiply
    /// @return Result of _a * _b
    function mulSafe(uint32 _a, uint32 _b) internal pure returns (uint32) {
        if (_a == 0) {
            return 0;
        }

        uint32 c = _a * _b;
        if (c / _a == _b) {
            return c;
        }

        return MAX_UINT32;
    }
}
