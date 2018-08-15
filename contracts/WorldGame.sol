pragma solidity ^0.4.0;

contract WorldGame {

    /* Constant to indicate that a region has no owner */
    uint8 constant NOT_OWNED = 255;

    /* Constant to indicate no region */
    uint8 constant NO_REGION = 255;

    /* Number of regions */
    uint8 constant REGION_COUNT = 25;

    /* Maxmimum number of neighbors per region */
    uint8 constant MAX_NEIGHBORS = 5;

    /* Maximum number of players per game */
    uint8 constant MAX_PLAYERS = 10;

    /* Maximum number for actions per turn in a game */
    uint8 constant MAX_ACTIONS_PER_TURN = 10;

    /* Initial number of soldier each player starts with */
    uint32 constant BEGIN_SOLDIERS = 20;

    /* Defender advantage in battle numerator */
    uint8 constant DEFENDER_ADVANTAGE_NUM = 5;

    /* Defender advantage in battle denominator  */
    uint8 constant DEFENDER_ADVANTAGE_DENOM = 4;

    /* Reward bonus multiplier denominator  */
    uint8 constant REWARD_BONUS_MULTIPLIER_DENOM = 20;

    /* Describes which adjacent neighbors each region has. E.g. EASTERN_EUROPE is next to WESTERN_EUROPE. */
    uint8[MAX_NEIGHBORS][REGION_COUNT] public regionNeighbors;

    /* Describes the reward amount given each round for controlling a region. */
    uint8[REGION_COUNT] public regionRewards;

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
        uint8 turnTeamId;

        /* A unique ID to identify this turn. */
        uint32 turnNum;

        /* Number of players in this game. */
        uint8 playerCount;

        /* Address of each player. */
        address[MAX_PLAYERS] playerAddresses;

        /* Which avatar to use for each team. */
        uint8[MAX_PLAYERS] teamAvatars;

        /* Soldiers held by a player in reserve, but not deployed to a region. */
        uint32[MAX_PLAYERS] undeployedSoldiers;

        /* Which player controls each region. */
        uint8[REGION_COUNT] regionOwners;

        /* Number of soldiers deployed to each region. */
        uint32[REGION_COUNT] regionSoldiers;

        /* Number of actions taken this turn. */
        uint8 actionCount;

        /* Region user is moving soldiers from. Listed by action ID. */
        uint8[MAX_ACTIONS_PER_TURN] fromRegionList;

        /* Region user is moving soldiers to. Listed by action ID.  */
        uint8[MAX_ACTIONS_PER_TURN] toRegionList;

        /* Number of soldiers to move. Listed by action ID. */
        uint32[MAX_ACTIONS_PER_TURN] moveSoldierCountList;

        /* Block number when action was submitted. Listed by action ID. */
        uint32[MAX_ACTIONS_PER_TURN] submitBlockList;
    }
    
    /* Event indicating that a new game has started. */
    event NewGame(uint256 gameId);

    /* Event when it's the next player's turn. */
    event NextTurn(uint256 gameId, uint32 turnNum, uint8 nextTeamId);

    /* Event when a player wins the game! */
    event Winner(uint256 gameId, uint8 winningTeamId);

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
            msg.sender == game.playerAddresses[7] || 
            msg.sender == game.playerAddresses[8] || 
            msg.sender == game.playerAddresses[9], 
            "Sender not authorized."
        );

        _;
    }

    /* Modifier to only allow moving soldiers between adjacent regions that exist. */
    modifier onlyNeighbors(uint8 regionFrom, uint8 regionTo) {

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

    /* Constructor initializes common data about regions. */
    constructor() public {
        initRegionNeighbors();
        initRegionRewards();
    }

    /* Fallback function. Added so ether sent to this contract is reverted. */
    function() public {
        revert("Invalid call to game contract.");
    }

    /// @notice Create a new game instance
    /// @param playerCount number of players
    /// @param playerAddresses address of each player
    /// @param teamAvatars avatar to use for each player
    /// @return Id of the game instance
    function newGame(
        uint8 playerCount, 
        address[10] playerAddresses, 
        uint8[10] teamAvatars
    )
        public
        returns(uint256) 
    {
        /* 
            Initialize a new game with some default values.
            Push returns array length so subtract 1 to get array index.
        */
        uint256 gameId = gameDataArray.push(GameData(
            /* uint8 turnTeamId */
            0, 
            /* uint32 turnNum */
            uint32(0),  
            /* uint8 playerCount */
            playerCount,
            /* address[MAX_PLAYERS] playerAddresses */
            playerAddresses, 
            /* uint8[MAX_PLAYERS] teamAvatars */
            teamAvatars, 
            /* uint32[MAX_PLAYERS] undeployedSoldiers */
            [
                BEGIN_SOLDIERS, BEGIN_SOLDIERS, BEGIN_SOLDIERS, BEGIN_SOLDIERS, 
                BEGIN_SOLDIERS, BEGIN_SOLDIERS, BEGIN_SOLDIERS, BEGIN_SOLDIERS, 
                BEGIN_SOLDIERS, BEGIN_SOLDIERS
            ], 
            /* uint8[REGION_COUNT] regionOwners */
            [
                NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, 
                NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, 
                NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, 
                NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, NOT_OWNED, 
                NOT_OWNED
            ], 
            /* uint32[REGION_COUNT] regionSoldiers */
            [
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0)
            ], 
            /* uint8 actionCount */
            0,
            /* uint8[MAX_ACTIONS_PER_TURN] fromRegionList */
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            /* uint8[MAX_ACTIONS_PER_TURN] toRegionList */
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
            /* uint32[MAX_ACTIONS_PER_TURN] moveSoldierCountList */
            [
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0), uint32(0), uint32(0), uint32(0)
            ], 
            /* uint32[MAX_ACTIONS_PER_TURN] submitBlockList */
            [
                uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), uint32(0), 
                uint32(0), uint32(0), uint32(0), uint32(0)
            ]
        )) - 1;

        emit NewGame(gameId);
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
        uint8 regionFrom, 
        uint8 regionTo, 
        uint32 moveSoldierCount
    )
        public 
        onlyIfPlayersTurn(gameId, turnNum) 
        onlyNeighbors(regionFrom, regionTo)
    {
        GameData storage game = gameDataArray[gameId];

        require(game.actionCount < 10, "Only 10 actions are allowed per turn");
        require(game.regionSoldiers[regionFrom] > moveSoldierCount, "Must have sufficient soldiers");
        require(game.turnTeamId == game.regionOwners[regionFrom], "Must own territory");

        /* Index to use for creating a new action */
        uint8 i = game.actionCount;

        /* Remove soldiers from region */
        game.regionSoldiers[regionFrom] -= moveSoldierCount;

        /* Queue a new action for this turn */
        game.fromRegionList[i] = regionFrom;
        game.toRegionList[i] = regionTo;
        game.moveSoldierCountList[i] = moveSoldierCount;
        game.submitBlockList[i] = uint32(block.number);

        /* Update action count */
        game.actionCount++;
    }

    /// @notice Execute actions that have been queued for this turn.
    /// @param gameId Id of game 
    /// @param turnNum Turn executeActions should occur during 
    function executeActions(
        uint256 gameId, 
        uint32 turnNum
    ) 
        public 
        onlyIfPlayersTurn(gameId, turnNum)
    {
        GameData storage game = gameDataArray[gameId];
        require(game.actionCount > 0, "No actions to execute.");

        /* Loops through all queued actions executing them one by one. */
        for (uint8 i = 0; i < game.actionCount; i++) {
            uint8 regionFrom = game.fromRegionList[i];
            uint8 regionTo = game.toRegionList[i];

            /* 
                If attacking enemy territory, then uses randomness to determine outcome.
                If moving to friendly territory then just moves the soldiers. 
            */
            (uint32 remainingAttackers, uint32 remainingDefenders) = getOutcomeAttackOrMove(
                /* uint32 submitBlock */
                game.submitBlockList[i], 
                /* uint32 moveSoldierCount */
                game.moveSoldierCountList[i], 
                /* uint32 defenderCount  */
                game.regionSoldiers[regionTo],
                /* bool friendly  */
                game.regionOwners[regionTo] == game.turnTeamId
            );

            if (remainingDefenders == 0) {
                /* Attacker wins.  Remaining attackers move to new region. */
                game.regionSoldiers[regionTo] = remainingAttackers;
                game.regionOwners[regionTo] = game.turnTeamId;
            }
            else {
                /* Defender wins (or move was friendly).  Remaining attackers return back home. */
                game.regionSoldiers[regionFrom] += remainingAttackers;
                game.regionSoldiers[regionTo] = remainingDefenders;
            }
        }

        /* Reset action count to 0. */
        game.actionCount = 0;
    }

    /// @notice Execute actions that have been queued for this turn.
    /// @param gameId Id of game 
    /// @param turnNum Turn executeActions should occur during 
    /// @param regionDeploy Region where you'd like to deploy soldiers to
    /// @param deploySoldierCount Number of soldiers you'd like to deploy at end of your turn
    function deploySoldiersAndEndTurn(
        uint256 gameId, 
        uint32 turnNum, 
        uint8 regionDeploy, 
        uint32 deploySoldierCount
    )
        public 
        onlyIfPlayersTurn(gameId, turnNum) 
    {
        GameData storage game = gameDataArray[gameId];

        require(game.undeployedSoldiers[game.turnTeamId] >= deploySoldierCount, "Must have sufficient soldiers.");
        require(
            (regionDeploy == NO_REGION && deploySoldierCount == 0) || 
            game.regionOwners[regionDeploy] == game.turnTeamId || 
            game.regionOwners[regionDeploy] == NOT_OWNED,
            "You can only deploy soldiers to a region you own, or that is unoccupied."
        );

        /* If there's any queued actions then execute them before ending turn. */
        if (game.actionCount > 0) {
            executeActions(gameId, turnNum);
        }

        /* Deploy soldiers if a region is specified */
        if (regionDeploy != NO_REGION) {
            game.regionOwners[regionDeploy] = game.turnTeamId;
            game.undeployedSoldiers[game.turnTeamId] -= deploySoldierCount;
            game.regionSoldiers[regionDeploy] += deploySoldierCount;
        }

        /* It's the next player's turn */
        game.turnTeamId = (game.turnTeamId + 1) % game.playerCount;
        game.turnNum++;

        /* Give bonus soldiers to next team based on what regions they control. */
        giveRegionRewards(gameId);

        emit NextTurn(gameId, game.turnNum, game.turnTeamId);
    }

    /// @notice Declare victory for a team.
    /// @param gameId Id of game
    /// @param teamId Team you'd like to declare as winner
    function declareWinner(uint256 gameId, uint8 teamId) 
        public 
        onlyPlayers(gameId)
    {
        GameData storage game = gameDataArray[gameId];
        
        bool isWinner = true;
        for (uint8 i = 0; i < REGION_COUNT; i++) {
            if (game.regionOwners[i] != teamId) {
                isWinner = false;
            }
        }

        if (isWinner) {
            emit Winner(gameId, teamId);
        }
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
        require(block.number > submitBlock + 1, "Actions must be at least 2 blocks old.");

        if (friendly) {
            /* If friendly, just move all soldiers to defending side. */
            return (0, moveSoldierCount+defenderCount);
        }
        else {
            /* 
                Determine outcome of attack.
                Use blockHash of the block after action was submitted as a source of randomness.

                Only most recent 256 blockhashes are available.
                If too much time has ellapsed, then blockHash will be 0 and attacker loses.
            */
            uint256 blockHash = uint256(blockhash(submitBlock + 1));
            uint32 deadDefenders = 0;
            uint32 deadAttackers = 0;

            /* If blockHash is no longer available then attacker loses by default. */
            if (blockHash == 0) {
                deadDefenders = 0;
                deadAttackers = (defenderCount * DEFENDER_ADVANTAGE_NUM) / DEFENDER_ADVANTAGE_DENOM;
            }
            /* If blockHash is available then use it as a source of randomness. */
            else {
                uint8 randA = uint8(blockHash % 256);
                uint8 randB = uint8((blockHash << 8) % 256);

                /* Determine effectiveness of attack. */
                deadDefenders = (moveSoldierCount * randA) / 256;

                /* Determine effectiveness of defence.  Gives slight extra advantage to defender. */
                deadAttackers = (defenderCount * DEFENDER_ADVANTAGE_NUM * randB) / 
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

    /// @notice Reward team with soldiers based on what regions they control.
    /// @param gameId Id of game
    function giveRegionRewards(uint256 gameId) private {
        GameData storage game = gameDataArray[gameId];

        /* Team who's turn it is that gets the reward. */
        uint8 teamId = game.turnTeamId;

        /* Reward total based on what regions player controls. */
        uint32 rewardTotal = 0;

        /* Bonus multiplier of 5% given per additional region controller.  */
        uint8 bonusScore = REWARD_BONUS_MULTIPLIER_DENOM - 1;
        for (uint8 i = 0; i < REGION_COUNT; i++) {
            if (game.regionOwners[i] == teamId) {
                rewardTotal += regionRewards[i];
                bonusScore++;
            }
        }

        /* Add reward to undeployed soldiers count. */
        game.undeployedSoldiers[teamId] += ((rewardTotal * bonusScore) / REWARD_BONUS_MULTIPLIER_DENOM);
    }

    /// @notice Initialize neighbor relationships between all regions
    /// @dev This data shared by all game instances
    function initRegionNeighbors() private {
        regionNeighbors[uint8(Regions.HAWAII)][0] = uint8(Regions.WESTERN_USA);
        regionNeighbors[uint8(Regions.HAWAII)][1] = uint8(Regions.FIJI);
        regionNeighbors[uint8(Regions.HAWAII)][2] = NO_REGION;
        regionNeighbors[uint8(Regions.HAWAII)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.HAWAII)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.WESTERN_CANADA)][0] = uint8(Regions.WESTERN_USA);
        regionNeighbors[uint8(Regions.WESTERN_CANADA)][1] = uint8(Regions.EASTERN_CANADA);
        regionNeighbors[uint8(Regions.WESTERN_CANADA)][2] = uint8(Regions.EASTERN_RUSSIA);
        regionNeighbors[uint8(Regions.WESTERN_CANADA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.WESTERN_CANADA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.EASTERN_CANADA)][0] = uint8(Regions.WESTERN_CANADA);
        regionNeighbors[uint8(Regions.EASTERN_CANADA)][1] = uint8(Regions.GREENLAND);
        regionNeighbors[uint8(Regions.EASTERN_CANADA)][2] = uint8(Regions.EASTERN_USA);
        regionNeighbors[uint8(Regions.EASTERN_CANADA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.EASTERN_CANADA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.WESTERN_USA)][0] = uint8(Regions.HAWAII);
        regionNeighbors[uint8(Regions.WESTERN_USA)][1] = uint8(Regions.WESTERN_CANADA);
        regionNeighbors[uint8(Regions.WESTERN_USA)][2] = uint8(Regions.EASTERN_USA);
        regionNeighbors[uint8(Regions.WESTERN_USA)][3] = uint8(Regions.NORTHERN_SOUTH_AMERICA);
        regionNeighbors[uint8(Regions.WESTERN_USA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.EASTERN_USA)][0] = uint8(Regions.WESTERN_USA);
        regionNeighbors[uint8(Regions.EASTERN_USA)][1] = uint8(Regions.EASTERN_CANADA);
        regionNeighbors[uint8(Regions.EASTERN_USA)][2] = uint8(Regions.NORTHERN_SOUTH_AMERICA);
        regionNeighbors[uint8(Regions.EASTERN_USA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.EASTERN_USA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.GREENLAND)][0] = uint8(Regions.EASTERN_CANADA);
        regionNeighbors[uint8(Regions.GREENLAND)][1] = uint8(Regions.WESTERN_EUROPE);
        regionNeighbors[uint8(Regions.GREENLAND)][2] = NO_REGION;
        regionNeighbors[uint8(Regions.GREENLAND)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.GREENLAND)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.NORTHERN_SOUTH_AMERICA)][0] = uint8(Regions.WESTERN_USA);
        regionNeighbors[uint8(Regions.NORTHERN_SOUTH_AMERICA)][1] = uint8(Regions.EASTERN_USA);
        regionNeighbors[uint8(Regions.NORTHERN_SOUTH_AMERICA)][2] = uint8(Regions.SOUTHERN_SOUTH_AMERICA);
        regionNeighbors[uint8(Regions.NORTHERN_SOUTH_AMERICA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.NORTHERN_SOUTH_AMERICA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.SOUTHERN_SOUTH_AMERICA)][0] = uint8(Regions.NORTHERN_SOUTH_AMERICA);
        regionNeighbors[uint8(Regions.SOUTHERN_SOUTH_AMERICA)][1] = uint8(Regions.WEST_ANTARCTICA);
        regionNeighbors[uint8(Regions.SOUTHERN_SOUTH_AMERICA)][2] = NO_REGION;
        regionNeighbors[uint8(Regions.SOUTHERN_SOUTH_AMERICA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.SOUTHERN_SOUTH_AMERICA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.WEST_ANTARCTICA)][0] = uint8(Regions.SOUTHERN_SOUTH_AMERICA);
        regionNeighbors[uint8(Regions.WEST_ANTARCTICA)][1] = uint8(Regions.EAST_ANTARCTICA);
        regionNeighbors[uint8(Regions.WEST_ANTARCTICA)][2] = NO_REGION;
        regionNeighbors[uint8(Regions.WEST_ANTARCTICA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.WEST_ANTARCTICA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.EAST_ANTARCTICA)][0] = uint8(Regions.WEST_ANTARCTICA);
        regionNeighbors[uint8(Regions.EAST_ANTARCTICA)][1] = uint8(Regions.NEW_ZEALAND);
        regionNeighbors[uint8(Regions.EAST_ANTARCTICA)][2] = NO_REGION;
        regionNeighbors[uint8(Regions.EAST_ANTARCTICA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.EAST_ANTARCTICA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.WESTERN_EUROPE)][0] = uint8(Regions.GREENLAND);
        regionNeighbors[uint8(Regions.WESTERN_EUROPE)][1] = uint8(Regions.EASTERN_EUROPE);
        regionNeighbors[uint8(Regions.WESTERN_EUROPE)][2] = uint8(Regions.WEST_AFRICA);
        regionNeighbors[uint8(Regions.WESTERN_EUROPE)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.WESTERN_EUROPE)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.EASTERN_EUROPE)][0] = uint8(Regions.WESTERN_EUROPE);
        regionNeighbors[uint8(Regions.EASTERN_EUROPE)][1] = uint8(Regions.WEST_AFRICA);
        regionNeighbors[uint8(Regions.EASTERN_EUROPE)][2] = uint8(Regions.MIDDLE_EAST);
        regionNeighbors[uint8(Regions.EASTERN_EUROPE)][3] = uint8(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint8(Regions.EASTERN_EUROPE)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.CENTRAL_RUSSIA)][0] = uint8(Regions.EASTERN_EUROPE);
        regionNeighbors[uint8(Regions.CENTRAL_RUSSIA)][1] = uint8(Regions.MIDDLE_EAST);
        regionNeighbors[uint8(Regions.CENTRAL_RUSSIA)][2] = uint8(Regions.INDIA);
        regionNeighbors[uint8(Regions.CENTRAL_RUSSIA)][3] = uint8(Regions.EASTERN_CHINA);
        regionNeighbors[uint8(Regions.CENTRAL_RUSSIA)][4] = uint8(Regions.EASTERN_RUSSIA);

        regionNeighbors[uint8(Regions.EASTERN_RUSSIA)][0] = uint8(Regions.EASTERN_CHINA);
        regionNeighbors[uint8(Regions.EASTERN_RUSSIA)][1] = uint8(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint8(Regions.EASTERN_RUSSIA)][2] = uint8(Regions.WESTERN_CANADA);
        regionNeighbors[uint8(Regions.EASTERN_RUSSIA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.EASTERN_RUSSIA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.WEST_AFRICA)][0] = uint8(Regions.WESTERN_EUROPE);
        regionNeighbors[uint8(Regions.WEST_AFRICA)][1] = uint8(Regions.EASTERN_EUROPE);
        regionNeighbors[uint8(Regions.WEST_AFRICA)][2] = uint8(Regions.MIDDLE_EAST);
        regionNeighbors[uint8(Regions.WEST_AFRICA)][3] = uint8(Regions.EAST_AFRICA);
        regionNeighbors[uint8(Regions.WEST_AFRICA)][4] = uint8(Regions.SOUTH_AFRICA);

        regionNeighbors[uint8(Regions.MIDDLE_EAST)][0] = uint8(Regions.EASTERN_EUROPE);
        regionNeighbors[uint8(Regions.MIDDLE_EAST)][1] = uint8(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint8(Regions.MIDDLE_EAST)][2] = uint8(Regions.INDIA);
        regionNeighbors[uint8(Regions.MIDDLE_EAST)][3] = uint8(Regions.EAST_AFRICA);
        regionNeighbors[uint8(Regions.MIDDLE_EAST)][4] = uint8(Regions.WEST_AFRICA);

        regionNeighbors[uint8(Regions.EAST_AFRICA)][0] = uint8(Regions.WEST_AFRICA);
        regionNeighbors[uint8(Regions.EAST_AFRICA)][1] = uint8(Regions.SOUTH_AFRICA);
        regionNeighbors[uint8(Regions.EAST_AFRICA)][2] = uint8(Regions.MIDDLE_EAST);
        regionNeighbors[uint8(Regions.EAST_AFRICA)][3] = uint8(Regions.INDIA);
        regionNeighbors[uint8(Regions.EAST_AFRICA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.SOUTH_AFRICA)][0] = uint8(Regions.WEST_AFRICA);
        regionNeighbors[uint8(Regions.SOUTH_AFRICA)][1] = uint8(Regions.EAST_AFRICA);
        regionNeighbors[uint8(Regions.SOUTH_AFRICA)][2] = NO_REGION;
        regionNeighbors[uint8(Regions.SOUTH_AFRICA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.SOUTH_AFRICA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.INDIA)][0] = uint8(Regions.EAST_AFRICA);
        regionNeighbors[uint8(Regions.INDIA)][1] = uint8(Regions.MIDDLE_EAST);
        regionNeighbors[uint8(Regions.INDIA)][2] = uint8(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint8(Regions.INDIA)][3] = uint8(Regions.EASTERN_CHINA);
        regionNeighbors[uint8(Regions.INDIA)][4] = uint8(Regions.SOUTHEAST_ASIA);

        regionNeighbors[uint8(Regions.EASTERN_CHINA)][0] = uint8(Regions.INDIA);
        regionNeighbors[uint8(Regions.EASTERN_CHINA)][1] = uint8(Regions.CENTRAL_RUSSIA);
        regionNeighbors[uint8(Regions.EASTERN_CHINA)][2] = uint8(Regions.EASTERN_RUSSIA);
        regionNeighbors[uint8(Regions.EASTERN_CHINA)][3] = uint8(Regions.SOUTHEAST_ASIA);
        regionNeighbors[uint8(Regions.EASTERN_CHINA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.SOUTHEAST_ASIA)][0] = uint8(Regions.INDIA);
        regionNeighbors[uint8(Regions.SOUTHEAST_ASIA)][1] = uint8(Regions.EASTERN_CHINA);
        regionNeighbors[uint8(Regions.SOUTHEAST_ASIA)][2] = uint8(Regions.WESTERN_AUSTRALIA);
        regionNeighbors[uint8(Regions.SOUTHEAST_ASIA)][3] = uint8(Regions.EASTERN_AUSTRALIA);
        regionNeighbors[uint8(Regions.SOUTHEAST_ASIA)][4] = uint8(Regions.FIJI);

        regionNeighbors[uint8(Regions.WESTERN_AUSTRALIA)][0] = uint8(Regions.EASTERN_AUSTRALIA);
        regionNeighbors[uint8(Regions.WESTERN_AUSTRALIA)][1] = uint8(Regions.SOUTHEAST_ASIA);
        regionNeighbors[uint8(Regions.WESTERN_AUSTRALIA)][2] = NO_REGION;
        regionNeighbors[uint8(Regions.WESTERN_AUSTRALIA)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.WESTERN_AUSTRALIA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.EASTERN_AUSTRALIA)][0] = uint8(Regions.WESTERN_AUSTRALIA);
        regionNeighbors[uint8(Regions.EASTERN_AUSTRALIA)][1] = uint8(Regions.SOUTHEAST_ASIA);
        regionNeighbors[uint8(Regions.EASTERN_AUSTRALIA)][2] = uint8(Regions.FIJI);
        regionNeighbors[uint8(Regions.EASTERN_AUSTRALIA)][3] = uint8(Regions.NEW_ZEALAND);
        regionNeighbors[uint8(Regions.EASTERN_AUSTRALIA)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.NEW_ZEALAND)][0] = uint8(Regions.EASTERN_AUSTRALIA);
        regionNeighbors[uint8(Regions.NEW_ZEALAND)][1] = uint8(Regions.FIJI);
        regionNeighbors[uint8(Regions.NEW_ZEALAND)][2] = uint8(Regions.EAST_ANTARCTICA);
        regionNeighbors[uint8(Regions.NEW_ZEALAND)][3] = NO_REGION;
        regionNeighbors[uint8(Regions.NEW_ZEALAND)][4] = NO_REGION;

        regionNeighbors[uint8(Regions.FIJI)][0] = uint8(Regions.NEW_ZEALAND);
        regionNeighbors[uint8(Regions.FIJI)][1] = uint8(Regions.EASTERN_AUSTRALIA);
        regionNeighbors[uint8(Regions.FIJI)][2] = uint8(Regions.SOUTHEAST_ASIA);
        regionNeighbors[uint8(Regions.FIJI)][3] = uint8(Regions.HAWAII);
        regionNeighbors[uint8(Regions.FIJI)][4] = NO_REGION;
    }

    /// @notice Initialize rewards given for controlling each region
    /// @dev This data shared by all game instances
    function initRegionRewards() private {
        regionRewards[uint8(Regions.HAWAII)] = 3;
        regionRewards[uint8(Regions.WESTERN_CANADA)] = 6;
        regionRewards[uint8(Regions.EASTERN_CANADA)] = 5;
        regionRewards[uint8(Regions.WESTERN_USA)] = 11;
        regionRewards[uint8(Regions.EASTERN_USA)] = 8;
        regionRewards[uint8(Regions.GREENLAND)] = 3;
        regionRewards[uint8(Regions.NORTHERN_SOUTH_AMERICA)] = 3;
        regionRewards[uint8(Regions.SOUTHERN_SOUTH_AMERICA)] = 4;
        regionRewards[uint8(Regions.WEST_ANTARCTICA)] = 2;
        regionRewards[uint8(Regions.EAST_ANTARCTICA)] = 2;
        regionRewards[uint8(Regions.WESTERN_EUROPE)] = 10;
        regionRewards[uint8(Regions.EASTERN_EUROPE)] = 6;
        regionRewards[uint8(Regions.CENTRAL_RUSSIA)] = 4;
        regionRewards[uint8(Regions.EASTERN_RUSSIA)] = 3;
        regionRewards[uint8(Regions.WEST_AFRICA)] = 3;
        regionRewards[uint8(Regions.MIDDLE_EAST)] = 4;
        regionRewards[uint8(Regions.EAST_AFRICA)] = 3;
        regionRewards[uint8(Regions.SOUTH_AFRICA)] = 5;
        regionRewards[uint8(Regions.INDIA)] = 7;
        regionRewards[uint8(Regions.EASTERN_CHINA)] = 10;
        regionRewards[uint8(Regions.SOUTHEAST_ASIA)] = 5;
        regionRewards[uint8(Regions.WESTERN_AUSTRALIA)] = 4;
        regionRewards[uint8(Regions.EASTERN_AUSTRALIA)] = 6;
        regionRewards[uint8(Regions.NEW_ZEALAND)] = 4;
        regionRewards[uint8(Regions.FIJI)] = 2;
    }
}
