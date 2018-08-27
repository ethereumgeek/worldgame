var WorldGame = artifacts.require("./WorldGame.sol");

/* Global constants about regions and actions */
const NOT_OWNED = 255;
const NO_REGION = 255;
const REGION_COUNT = 25;
const MAX_ACTIONS_PER_TURN = 8;
const REGION_REWARDS = [3, 6, 5, 11, 8, 3, 3, 4, 2, 2, 10, 6, 4, 3, 3, 4, 3, 5, 7, 10, 5, 4, 6, 4, 2];
const MAX_BLOCKS_PER_TURN = 256;
const TEAM_AVATARS = ["a", "b", "c", "d", "e", "f", "g", "h"].join("");
const NO_ACCOUNT = "0x0000000000000000000000000000000000000000";

/* Region names sorted in order of region id. */
const REGION_NAMES = [
    "HAWAII",
    "WESTERN_CANADA",
    "EASTERN_CANADA",
    "WESTERN_USA",
    "EASTERN_USA",
    "GREENLAND",
    "NORTHERN_SOUTH_AMERICA",
    "SOUTHERN_SOUTH_AMERICA",
    "WEST_ANTARCTICA",
    "EAST_ANTARCTICA",
    "WESTERN_EUROPE",
    "EASTERN_EUROPE",
    "CENTRAL_RUSSIA",
    "EASTERN_RUSSIA",
    "WEST_AFRICA",
    "MIDDLE_EAST",
    "EAST_AFRICA",
    "SOUTH_AFRICA",
    "INDIA",
    "EASTERN_CHINA",
    "SOUTHEAST_ASIA",
    "WESTERN_AUSTRALIA",
    "EASTERN_AUSTRALIA",
    "NEW_ZEALAND",
    "FIJI"
];

/* Mapping that shows neighbor relationships between regions. */
let REGION_NEIGHBORS_BY_NAME = {
    HAWAII: ["WESTERN_USA", "FIJI"], 
    WESTERN_CANADA: ["WESTERN_USA", "EASTERN_CANADA", "EASTERN_RUSSIA"], 
    EASTERN_CANADA: ["WESTERN_CANADA", "GREENLAND", "EASTERN_USA"], 
    WESTERN_USA: ["HAWAII", "WESTERN_CANADA", "EASTERN_USA", "NORTHERN_SOUTH_AMERICA"], 
    EASTERN_USA: ["WESTERN_USA", "EASTERN_CANADA", "NORTHERN_SOUTH_AMERICA"], 
    GREENLAND: ["EASTERN_CANADA", "WESTERN_EUROPE"], 
    NORTHERN_SOUTH_AMERICA: ["WESTERN_USA", "EASTERN_USA", "SOUTHERN_SOUTH_AMERICA"], 
    SOUTHERN_SOUTH_AMERICA: ["NORTHERN_SOUTH_AMERICA", "WEST_ANTARCTICA"], 
    WEST_ANTARCTICA: ["SOUTHERN_SOUTH_AMERICA", "EAST_ANTARCTICA"], 
    EAST_ANTARCTICA: ["WEST_ANTARCTICA", "NEW_ZEALAND"], 
    WESTERN_EUROPE: ["GREENLAND", "EASTERN_EUROPE", "WEST_AFRICA"], 
    EASTERN_EUROPE: ["WESTERN_EUROPE", "WEST_AFRICA", "MIDDLE_EAST", "CENTRAL_RUSSIA"], 
    CENTRAL_RUSSIA: ["EASTERN_EUROPE", "MIDDLE_EAST", "INDIA", "EASTERN_CHINA", "EASTERN_RUSSIA"], 
    EASTERN_RUSSIA: ["EASTERN_CHINA", "CENTRAL_RUSSIA", "WESTERN_CANADA"], 
    WEST_AFRICA: ["WESTERN_EUROPE", "EASTERN_EUROPE", "MIDDLE_EAST", "EAST_AFRICA", "SOUTH_AFRICA"], 
    MIDDLE_EAST: ["EASTERN_EUROPE", "CENTRAL_RUSSIA", "INDIA", "EAST_AFRICA", "WEST_AFRICA"], 
    EAST_AFRICA: ["WEST_AFRICA", "SOUTH_AFRICA", "MIDDLE_EAST", "INDIA"], 
    SOUTH_AFRICA: ["WEST_AFRICA", "EAST_AFRICA"], 
    INDIA: ["EAST_AFRICA", "MIDDLE_EAST", "CENTRAL_RUSSIA", "EASTERN_CHINA", "SOUTHEAST_ASIA"], 
    EASTERN_CHINA: ["INDIA", "CENTRAL_RUSSIA", "EASTERN_RUSSIA", "SOUTHEAST_ASIA"], 
    SOUTHEAST_ASIA: ["INDIA", "EASTERN_CHINA", "WESTERN_AUSTRALIA", "EASTERN_AUSTRALIA", "FIJI"], 
    WESTERN_AUSTRALIA: ["EASTERN_AUSTRALIA", "SOUTHEAST_ASIA"], 
    EASTERN_AUSTRALIA: ["WESTERN_AUSTRALIA", "SOUTHEAST_ASIA", "FIJI", "NEW_ZEALAND"], 
    NEW_ZEALAND: ["EASTERN_AUSTRALIA", "FIJI", "EAST_ANTARCTICA"], 
    FIJI: ["NEW_ZEALAND", "EASTERN_AUSTRALIA", "SOUTHEAST_ASIA", "HAWAII"]
};

/* Converts list of region names to a list of region ids. */
function getRegionIdsFromNames(nameList) {
  let idList = [];
  for (let i = 0; i < nameList.length; i++) {
      for (let j = 0; j < REGION_COUNT; j++) {
          if (nameList[i] === REGION_NAMES[j]) {
              idList.push(j);
          }
      }
  }
  return idList;
}

/* Returns region neighbors as ids instead of names. */
function getRegionNeighbors() {
  let regionNeighbors = {};
  for (let i = 0; i < REGION_COUNT; i++) {
      let regionName = REGION_NAMES[i];
      if (REGION_NEIGHBORS_BY_NAME.hasOwnProperty(regionName)) {
          let neighborNameList = REGION_NEIGHBORS_BY_NAME[regionName];
          let neighborIdList = getRegionIdsFromNames(neighborNameList);
          regionNeighbors[i] = neighborIdList;
      }
  }
  return regionNeighbors;
}

/* Region neighbor map using region ids instead of region names. */
const REGION_NEIGHBORS = getRegionNeighbors();

/* Map region name to region id */
function regionNameToId(name) {
  for (let i = 0; i < REGION_COUNT; i++) {
      let regionName = REGION_NAMES[i];
      if (regionName === name) {
          return i;
      }
  }

  return NO_REGION;
}

/* Calculate expected bonus score based on region ownership. */
function calculateBonus(playerNum, regionOwnersArr) {
    let rewardCount = 0;
    let regionsOwned = 0;
    for (let i = 0; i < REGION_COUNT; i++) {
        if(regionOwnersArr[i] === playerNum) {
          rewardCount += REGION_REWARDS[i];
          regionsOwned++;
        }
    }
    return Math.floor((rewardCount * (19 + regionsOwned)) / 20);
}

/* Get summary of owners and soldiers for each region. Also gets undeployed soliders for each player. */
async function getSoldierCounts(worldGameInstance, gameId, playerCount) {
    let regionOwnersArr = [];
    let regionSoldiersArr = [];
    let undeployedSoldiersArr = [];
    let soldiersByRegionResp = await worldGameInstance.soldiersByRegion(gameId);
    for (let i = 0; i < REGION_COUNT; i++) {
        let regionOwner = parseInt(soldiersByRegionResp[0][i].toString(), 10);
        let regionSoldiers = parseInt(soldiersByRegionResp[1][i].toString(), 10);
        regionOwnersArr.push(regionOwner);
        regionSoldiersArr.push(regionSoldiers);
    }

    let undeployedSoldiersResp = await worldGameInstance.undeployedSoldiers(gameId);
    for (let i = 0; i < playerCount; i++) {
        let undeployedSoldiers = parseInt(undeployedSoldiersResp[0][i].toString(), 10);
        undeployedSoldiersArr.push(undeployedSoldiers);
    }

    return { regionOwnersArr, regionSoldiersArr, undeployedSoldiersArr };
}

/* Checks whether value is in list. */
function hasValueInList(list, len, value) {
    let hasMatch = false;
    for (let i = 0; (i < len && i < list.length); i++) {
        if (list[i] === value) {
            hasMatch = true;
        }
    }
    return hasMatch;
}

/* Decide what region a player should deploy soldiers to. */
function chooseRegionToDeploy(checkRegionOwners, playerNum, offset) {
    for (let i = 0; i < REGION_COUNT; i++) {
        let regionId = (i + offset) % REGION_COUNT;
        if (checkRegionOwners[regionId] === NOT_OWNED || checkRegionOwners[regionId] === playerNum) {
            return regionId;
        }
    }

    return NO_REGION;
}

/* Decide which actions player should take.  Is aggressive at taking over territory. */
function decidePendingActions(checkRegionOwners, checkRegionSoliders, playerNum, offset) {
    let fromList = [];
    let toList = [];
    let existingToEntries = {};
    for (let i = 0; i < REGION_COUNT; i++) {
        let regionId = (i + offset) % REGION_COUNT;
        if (checkRegionOwners[regionId] === playerNum && checkRegionSoliders[regionId] > 5) {
            let neighborList = REGION_NEIGHBORS[regionId];
            for (let j = 0; j < neighborList.length; j++) {
                let toRegionId = neighborList[j];
                if (checkRegionOwners[toRegionId] !== playerNum && !existingToEntries.hasOwnProperty(toRegionId)) {
                    fromList.push(regionId);
                    toList.push(toRegionId);
                    existingToEntries[toRegionId] = true;
                    break;
                }
            }
        }
    }

    let minLength = Math.min(10, fromList.length, toList.length);
    fromList = fromList.slice(0, minLength);
    toList = toList.slice(0, minLength);    
    return { fromList, toList };
}

/* Prints summary showing region counts for each player. */
function printSummary(checkRegionOwners) {
    let summary = {};
    for (let i = 0; i < REGION_COUNT; i++) {
        let owner = checkRegionOwners[i];
        if (!summary.hasOwnProperty(owner)) {
            summary[owner] = 1;
        }
        else {
          summary[owner]++;
        }
    }

    console.log("");
    console.log("=======================================================");
    console.log("Regions owned by each player: " + JSON.stringify(summary));
    console.log("");
}

/* Returns event from transaction based on name. */
function getEventFromTransaction(tx, name) {
    for (let i = 0; i < tx.logs.length; i++) {
        if (tx.logs[i].event === name) {
            return tx.logs[i].args;
        }
    }
    return null;
}

/* Execute queued actions, deploy soldiers, end turn and check that map looks correct. */
async function endTurnAndCheckCounts(
    accounts, 
    worldGameInstance, 
    gameId, 
    turnNum, 
    playerNum, 
    deployRegion, 
    deployCount,
    checkRegionOwners,
    checkRegionSoliders,
    checkUndeployedSoldiers, 
    checkActionCount, 
    checkFromRegionList, 
    checkToRegionList, 
    playerCount, 
    debugLog
) {
    if (debugLog) console.log("Player " + playerNum + " deploying " + deployCount + " soldiers to " + REGION_NAMES[deployRegion] + ".");

    /* End turn executing queued actions and deploying soldiers. */
    let tx = await worldGameInstance.deploySoldiersAndEndTurn(
        gameId, 
        turnNum, 
        deployRegion, 
        deployCount,
        {from: accounts[playerNum]}
    );

    /* Get response with information on next turn. */
    let gasUsed = 0;
    let nextTurnNum = "";
    let nextTeamId = 0;
    let args = getEventFromTransaction(tx, "NextTurn");
    if (args) {
        nextTurnNum = args.turnNum.toString();
        nextTeamId = parseInt(args.nextTeamId.toString(), 10);
        gasUsed += tx.receipt.gasUsed;
    }

    /* Read updated region owners and soldier counts from blockchain. */
    let { 
        regionOwnersArr, 
        regionSoldiersArr, 
        undeployedSoldiersArr 
    } = await getSoldierCounts(worldGameInstance, gameId, playerCount);

    /* Loop through regions verifying data is correct/consistent */
    let ownersChanged = false;
    for (let i = 0; i < REGION_COUNT; i++) {
        let regionOwner = regionOwnersArr[i];
        let regionSoldiers = regionSoldiersArr[i];
        
        if (checkRegionOwners[i] !== regionOwner) {
            if (hasValueInList(checkToRegionList, checkActionCount, i)) {
                ownersChanged = true;
                if (debugLog) console.log("Action caused " + REGION_NAMES[i] + " to changed owners.");
            }
            else {
                assert.equal(checkRegionOwners[i], regionOwner, REGION_NAMES[i] + " region owner doesn't match");
            }
        }
        if (checkRegionSoliders[i] !== regionSoldiers) {
            if (hasValueInList(checkFromRegionList, checkActionCount, i) || hasValueInList(checkToRegionList, checkActionCount, i)) {
                if (debugLog) console.log("Action caused " + REGION_NAMES[i] + " to changed soldier counts from " + checkRegionSoliders[i] + " to " + regionSoldiers + ".");
            }
            else {
                assert.equal(checkRegionSoliders[i], regionSoldiers, REGION_NAMES[i] + " soldier count doesn't match");
            }
        }
    }

    /* Calculate expected bonus for next player. */
    let bonus = calculateBonus(nextTeamId, checkRegionOwners);
    checkUndeployedSoldiers[nextTeamId] += bonus;

    /* Check that undeployed soldier counts are correct/consistent. */
    for (let i = 0; i < playerCount; i++) {
        let undeployedSoldiers = undeployedSoldiersArr[i];
        if (checkUndeployedSoldiers[i] !== undeployedSoldiers) {
            if (!ownersChanged) {
                assert.equal(checkUndeployedSoldiers[i], undeployedSoldiers, "Player " + i + " undeployed soldiers doesn't match");
            }
            else {
                if (debugLog) console.log("Action caused Player " + i + "'s bonus to change.");
            }
        }
    }

    return { gasUsed, nextTurnNum, nextTeamId, regionOwnersArr, regionSoldiersArr, undeployedSoldiersArr };
}

/* Queue an individual action that player is taking this turn. */
async function queueNewPendingAction(
    accounts, 
    worldGameInstance, 
    gameId, 
    turnNum, 
    playerNum, 
    regionFrom, 
    regionTo,
    soldierCount,
    debugLog
) {
    if (debugLog) console.log("Player " + playerNum + " moving " + soldierCount + " soldiers from " + REGION_NAMES[regionFrom] + " to " + REGION_NAMES[regionTo] + ".");

    /* Queue new pending action and assert if there's a problem. */
    try {
        await worldGameInstance.attackOrMove(
            gameId, 
            turnNum, 
            regionFrom, 
            regionTo, 
            soldierCount,
            {from: accounts[playerNum]}
        );
    }
    catch (e) {
        assert.equal(false, true, "Unable to add pending action");
    }

    /* Read list of current queued pending actions. */
    let pendingActionsResp = await worldGameInstance.pendingActions(gameId);
    let actionCount = parseInt(pendingActionsResp[0].toString());
    let fromRegionList = [];
    let toRegionList = [];
    let moveSoldierCountList = [];
    let submitBlockList = [];
    for (let i = 0; i < MAX_ACTIONS_PER_TURN; i++) {
        fromRegionList.push(parseInt(pendingActionsResp[1][i].toString(), 10));
        toRegionList.push(parseInt(pendingActionsResp[2][i].toString(), 10));
        moveSoldierCountList.push(parseInt(pendingActionsResp[3][i].toString(), 10));
        submitBlockList.push(parseInt(pendingActionsResp[4][i].toString(), 10));
    }

    /* Return information on current queued pending actions. */
    return { actionCount, fromRegionList, toRegionList, moveSoldierCountList, submitBlockList };
}

/* Initialize a simple game by deploying soldiers to one region per player. */
async function initializeSimpleGame(worldGameInstance, accounts, playerCount, regions, deployCounts) {

    /* Create array of player addresses based on playerCount. */
    let initAccounts = [
        NO_ACCOUNT, NO_ACCOUNT, NO_ACCOUNT, NO_ACCOUNT, 
        NO_ACCOUNT, NO_ACCOUNT, NO_ACCOUNT, NO_ACCOUNT
    ];

    for (let i = 0; i < playerCount; i++) {
        initAccounts[i] = accounts[i];
    }

    /* Start a new game. */
    let tx = await worldGameInstance.newGame(
        playerCount, 
        MAX_BLOCKS_PER_TURN, 
        initAccounts, 
        web3.utils.asciiToHex(TEAM_AVATARS.substring(0, playerCount)),
        {from: accounts[0]}
    );

    /* Get information from new game such as gameId and turnNum. */
    let gameId = "";
    let turnNum = ""; 
    let args = getEventFromTransaction(tx, "NewGame");
    if (args) {
        gameId = args.gameId.toString();
        turnNum = args.turnNum.toString();
    }

    /* Have each player deploy troops to one region. */
    let nextTeamId = 0;
    const PLAYER_INITIAL_SOLDIERS = 20;
    for (let teamId = 0; teamId < playerCount; teamId++) {
        assert.equal(nextTeamId, teamId, "Team id should initially increment monotonically.");
        let deployRegion = teamId * 3;
        if (regions !== null && regions.length === playerCount) {
            deployRegion = regions[teamId];
        }

        let deployCount = PLAYER_INITIAL_SOLDIERS;
        if (deployCounts !== null && deployCounts.length === playerCount) {
            deployCount = deployCounts[teamId];
        }

        tx = await worldGameInstance.deploySoldiersAndEndTurn(
            gameId, 
            turnNum, 
            deployRegion, 
            deployCount,
            {from: accounts[teamId]}
        );

        args = getEventFromTransaction(tx, "NextTurn");
        if (args) {
            turnNum = args.turnNum.toString();
            nextTeamId = parseInt(args.nextTeamId.toString(), 10);
        }
    }

    return { gameId, turnNum, nextTeamId };
}


/* ************************************************************************** */
/* Tests start here.                                                          */
/* ************************************************************************** */

contract('WorldGame', function(accounts) {

    /* ************************************************************************** */
    /* Testing the circuit breaker is able to halt new game creation.             */
    /* ************************************************************************** */
    it("Test circuit breaker", async function() {

        const PLAYER_COUNT_CIRCUIT_BREAKER = 3;
        let worldGameInstance = await WorldGame.deployed();

        /* Before circuit breaker we should be able to create a new game.  */
        let hasAssert = false;
        try {
            await worldGameInstance.newGame(
                PLAYER_COUNT_CIRCUIT_BREAKER, 
                MAX_BLOCKS_PER_TURN, 
                [
                    accounts[0], 
                    accounts[1], 
                    accounts[2], 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT
                ], 
                web3.utils.asciiToHex(TEAM_AVATARS.substring(0, PLAYER_COUNT_CIRCUIT_BREAKER)),
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, false, "Should be able to create game before circuit breaker.");
        
        /* After circuit breaker we should not be able to create new games.  */
        await worldGameInstance.stopNewGames(true,
            {from: accounts[0]}
        );

        hasAssert = false;
        try {
            await worldGameInstance.newGame(
                PLAYER_COUNT_CIRCUIT_BREAKER, 
                MAX_BLOCKS_PER_TURN, 
                [
                    accounts[0], 
                    accounts[1], 
                    accounts[2], 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT
                ], 
                web3.utils.asciiToHex(TEAM_AVATARS.substring(0, PLAYER_COUNT_CIRCUIT_BREAKER)),
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, true, "Circuit breaker failed to work.");        

        /* Disable circuit breaker to not interfere with following test. */
        await worldGameInstance.stopNewGames(false,
            {from: accounts[0]}
        );
    });


    /* ************************************************************************** */
    /* Testing player A cannot move player B's soldiers.                          */
    /* ************************************************************************** */
    it("Player A can't move player B's soldiers", async function() {

        let PLAYER_COUNT_MOVE_ONLY_YOURS = 4;
        let worldGameInstance = await WorldGame.deployed();
        let { gameId, turnNum, nextTeamId } = await initializeSimpleGame(
            worldGameInstance, 
            accounts, 
            PLAYER_COUNT_MOVE_ONLY_YOURS, 
            [
                regionNameToId("HAWAII"), 
                regionNameToId("WESTERN_CANADA"), 
                regionNameToId("EASTERN_CHINA"), 
                regionNameToId("WEST_AFRICA")
            ],
            null
        );

        assert.equal(nextTeamId, 0, "It should be first player's turn");

        /* Player tries moving soldiers that they don't own */
        let hasAssert = false;
        try {
            await worldGameInstance.attackOrMove(
                gameId, 
                turnNum, 
                regionNameToId("WESTERN_CANADA"), 
                regionNameToId("EASTERN_CANADA"), 
                10,
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, true, "Player was able to move soldiers they didn't own.");        
    
        /* Player moves soldiers that they own */
        hasAssert = false;
        try {
            await worldGameInstance.attackOrMove(
                gameId, 
                turnNum, 
                regionNameToId("HAWAII"), 
                regionNameToId("WESTERN_USA"), 
                10,
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, false, "Player was unable to move soldiers they own.");        
    });


    /* ************************************************************************** */
    /* Testing player can attack neighboring region, but not across map.          */
    /* ************************************************************************** */
    it("Player can attack neighbor but not across map", async function() {

        let PLAYER_COUNT_ATTACK_NEIGHBORS = 4;
        let worldGameInstance = await WorldGame.deployed();
        let { gameId, turnNum, nextTeamId } = await initializeSimpleGame(
            worldGameInstance, 
            accounts, 
            PLAYER_COUNT_ATTACK_NEIGHBORS, 
            [
                regionNameToId("WESTERN_USA"), 
                regionNameToId("EASTERN_USA"), 
                regionNameToId("EASTERN_CHINA"), 
                regionNameToId("WEST_AFRICA")
            ],
            null
        );

        assert.equal(nextTeamId, 0, "It should be first player's turn");

        /* Try to attack region that's not a neighbor. */
        let hasAssert = false;
        try {
            await worldGameInstance.attackOrMove(
                gameId, 
                turnNum, 
                regionNameToId("WESTERN_USA"), 
                regionNameToId("EASTERN_CHINA"), 
                19,
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, true, "Player was able to attack across map to a non-neighbor.");

        /* Try to attack region that is a neighbor. */
        hasAssert = false;
        try {
            await worldGameInstance.attackOrMove(
                gameId, 
                turnNum, 
                regionNameToId("WESTERN_USA"), 
                regionNameToId("EASTERN_USA"), 
                19,
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, false, "Player was not able to attack neighboring region.");

    });


    /* ************************************************************************** */
    /* Testing player loses attack after 257 block delay.                              */
    /* ************************************************************************** */
    it("Testing player loses attack after 257 block delay", async function() {

        /* 
            Blockhash after an attack is committed is used for randomness.
            However, only the most recent 256 blockhashes are available.
            If too much time has ellapsed, then blockHash will be 0 and attacker loses. 
        */

        let PLAYER_COUNT_DELAY_257_BLOCKS = 4;
        let worldGameInstance = await WorldGame.deployed();
        let { gameId, turnNum, nextTeamId } = await initializeSimpleGame(
            worldGameInstance, 
            accounts, 
            PLAYER_COUNT_DELAY_257_BLOCKS, 
            [
                regionNameToId("WESTERN_USA"), 
                regionNameToId("EASTERN_USA"), 
                regionNameToId("EASTERN_CHINA"), 
                regionNameToId("WEST_AFRICA")
            ],
            [
                20,
                2,
                1,
                10
            ]
        );

        assert.equal(nextTeamId, 0, "It should be first player's turn");

        /* Attack a region that is a neighbor. */
        hasAssert = false;
        try {
            await worldGameInstance.attackOrMove(
                gameId, 
                turnNum, 
                regionNameToId("WESTERN_USA"), 
                regionNameToId("EASTERN_USA"), 
                19,
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, false, "Player was not able to attack neighboring region.");

        /* Force 257 additional blocks */
        for (let i = 0; i < 257; i++) {
            await worldGameInstance.cacheBlockHash32(
              "0",
              {from: accounts[0]}
            );
        }
        
        /* End turn and execute pending attack. */
        await worldGameInstance.deploySoldiersAndEndTurn(
            gameId, 
            turnNum, 
            regionNameToId("EAST_AFRICA"), 
            5,
            {from: accounts[0]}
        );

        let { 
            regionOwnersArr, 
            regionSoldiersArr
        } = await getSoldierCounts(worldGameInstance, gameId, PLAYER_COUNT_DELAY_257_BLOCKS);

        let westernUsaId = regionNameToId("WESTERN_USA");
        let easternUsaId = regionNameToId("EASTERN_USA");

        /* Check that attacker lost the attack with expected counts (of maximum damage). */
        assert.equal(regionOwnersArr[westernUsaId], 0, "Attacker should still own western usa.");
        assert.equal(regionOwnersArr[easternUsaId], 1, "Defender should still own eastern usa.");
        assert.equal(regionSoldiersArr[westernUsaId], 18, "Attacker should have lost two soldiers.");
        assert.equal(regionSoldiersArr[easternUsaId], 2, "Defender should still have all soldiers.");  
    });


    /* ************************************************************************** */
    /* Testing player can only move on their turn.                                */
    /* ************************************************************************** */
    it("Player can only move on their turn", async function() {

        let PLAYER_COUNT_MOVE_ON_TURN = 4;
        let worldGameInstance = await WorldGame.deployed();
        let { gameId, turnNum, nextTeamId } = await initializeSimpleGame(
            worldGameInstance, 
            accounts, 
            PLAYER_COUNT_MOVE_ON_TURN, 
            [
                regionNameToId("MIDDLE_EAST"), 
                regionNameToId("WESTERN_CANADA"), 
                regionNameToId("EASTERN_CHINA"), 
                regionNameToId("EAST_AFRICA")
            ],
            null
        );

        assert.equal(nextTeamId, 0, "It should be first player's turn");

        /* Player tries to move when not their turn. */
        let hasAssert = false;
        try {
            await worldGameInstance.attackOrMove(
                gameId, 
                turnNum, 
                regionNameToId("MIDDLE_EAST"), 
                regionNameToId("EASTERN_EUROPE"), 
                10,
                {from: accounts[1]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, true, "Player was able to move when it wasn't their turn.");        
    
        /* Player tries to move when it is their turn. */
        hasAssert = false;
        try {
            await worldGameInstance.attackOrMove(
                gameId, 
                turnNum, 
                regionNameToId("MIDDLE_EAST"), 
                regionNameToId("EASTERN_EUROPE"), 
                10,
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, false, "Player was unable to move soldiers on their turn.");        
    });


    /* ************************************************************************** */
    /* Testing player cannot move more soldiers than they have.                   */
    /* ************************************************************************** */
    it("Cannot move more soldiers than you have", async function() {

        let PLAYER_COUNT_MUST_HAVE_ENOUGH = 4;
        let worldGameInstance = await WorldGame.deployed();
        let { gameId, turnNum, nextTeamId } = await initializeSimpleGame(
            worldGameInstance, 
            accounts, 
            PLAYER_COUNT_MUST_HAVE_ENOUGH, 
            [
                regionNameToId("EASTERN_CHINA"), 
                regionNameToId("FIJI"), 
                regionNameToId("NEW_ZEALAND"), 
                regionNameToId("SOUTH_AFRICA")
            ],
            null
        );

        assert.equal(nextTeamId, 0, "It should be first player's turn");

        /* Player tries moving more soldiers than they have. */
        let hasAssert = false;
        try {
            await worldGameInstance.attackOrMove(
                gameId, 
                turnNum, 
                regionNameToId("EASTERN_CHINA"), 
                regionNameToId("SOUTHEAST_ASIA"), 
                21,
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, true, "Player was able to move more soldiers than they have.");        
        
        /* Player only moves soldiers that they have. */
        hasAssert = false;
        try {
            await worldGameInstance.attackOrMove(
                gameId, 
                turnNum, 
                regionNameToId("EASTERN_CHINA"), 
                regionNameToId("SOUTHEAST_ASIA"), 
                19,
                {from: accounts[0]}
            );
        }
        catch (e) {
            hasAssert = true;
        }

        assert.equal(hasAssert, false, "Player was unable to move soldiers that they have.");        
    });


    /* ************************************************************************** */
    /* Testing a full game simulation until we have a winner.                     */
    /* ************************************************************************** */
    it("Full game simulation until winner", async function() {

        /* Get game contract */
        let worldGameInstance = await WorldGame.deployed();

        /* Set debugLog to true for detailed logging. */
        let debugLog = false;

        /* Keep track of gas during game simulation */
        let gasTotal = 0;

        /* Set up player ids */
        const PLAYER_COUNT_FULL_SIMULATION = 3;
        let playerNum = 0;

        /* Create a new game. */
        let tx = await worldGameInstance.newGame(
            PLAYER_COUNT_FULL_SIMULATION, 
            MAX_BLOCKS_PER_TURN, 
            [
                accounts[0], 
                accounts[1], 
                accounts[2],
                NO_ACCOUNT, 
                NO_ACCOUNT, 
                NO_ACCOUNT, 
                NO_ACCOUNT, 
                NO_ACCOUNT
            ], 
            web3.utils.asciiToHex(TEAM_AVATARS.substring(0, PLAYER_COUNT_FULL_SIMULATION)),
            {from: accounts[0]}
        );
        
        /* Get data about the new game. */
        let gameId = "";
        let turnNum = ""; 
        let teamAvatars = ""; 
        let args = getEventFromTransaction(tx, "NewGame");
        if (args) {
            gameId = args.gameId.toString();
            turnNum = args.turnNum.toString();
            teamAvatars = web3.utils.hexToAscii(args.teamAvatars);
            gasTotal += tx.receipt.gasUsed;

            if (debugLog) console.log("New game created with gameId " + gameId);
            if (debugLog) console.log("Avatar list " + teamAvatars.match(/.{1,2}/g).join(","));
        }

        /* Initialize data about actions and regions for verification. */
        let checkActionCount = 0;
        let checkFromRegionList = [];
        let checkToRegionList = [];
        let checkRegionOwners = [];
        let checkRegionSoliders = [];
        let checkUndeployedSoldiers = [];
        for (let i = 0; i < REGION_COUNT; i++) {
            checkRegionOwners.push(NOT_OWNED);
            checkRegionSoliders.push(0);
        }

        /* Initialize expected undeployed soldier counts. */
        for (let i = 0; i < PLAYER_COUNT_FULL_SIMULATION; i++) {
            checkUndeployedSoldiers.push(20);
        }

        /* Simulate game with a maximum of 999 turns */
        for (let loop = 0; loop < 1000; loop++) {

            /* Assert if we don't have a winner after 999 turns */
            if (loop === 999) {
                assert.equal(false, true, "Too many loops, but still no winner.");
            }

            /* Decide region and number of soldiers to deploy. */
            let deployRegion = chooseRegionToDeploy(checkRegionOwners, playerNum, loop);
            let deployCount = Math.floor(checkUndeployedSoldiers[playerNum] / 2);
            if (deployRegion === NO_REGION) {
                deployCount = 0;
            }
            
            /* Player is deploying soldiers.  Update expected counts to use in verification. */
            checkRegionOwners[deployRegion] = playerNum;
            checkRegionSoliders[deployRegion] += deployCount;
            checkUndeployedSoldiers[playerNum] -= deployCount;

            /* Execute queued actions, deploy soldiers, end turn and check that map looks correct. */
            let { 
                gasUsed, 
                nextTurnNum, 
                nextTeamId, 
                regionOwnersArr, 
                regionSoldiersArr, 
                undeployedSoldiersArr 
            } = await endTurnAndCheckCounts(
                accounts, 
                worldGameInstance, 
                gameId, 
                turnNum, 
                playerNum, 
                deployRegion, 
                deployCount, 
                checkRegionOwners, 
                checkRegionSoliders, 
                checkUndeployedSoldiers, 
                checkActionCount, 
                checkFromRegionList, 
                checkToRegionList, 
                PLAYER_COUNT_FULL_SIMULATION, 
                debugLog
            );

            /* If next player is current player then we have a winner. */
            if (playerNum == nextTeamId) {

                /* Will assert if we don't actually have a winner. */
                await worldGameInstance.declareWinner(
                  gameId,
                  nextTeamId,
                  {from: accounts[0]}
                );

                /* Game is over! */
                if (debugLog) console.log("Winner is player " + playerNum + "!!!");
                break;
            }

            /* Store region counts for use in verification when turn ends. */
            checkRegionOwners = regionOwnersArr;
            checkRegionSoliders = regionSoldiersArr;
            checkUndeployedSoldiers = undeployedSoldiersArr;
            turnNum = nextTurnNum;
            playerNum = nextTeamId;
            gasTotal += gasUsed;

            /* Decide which actions player should take.  Is aggressive at taking over territory. */
            let { fromList, toList } = decidePendingActions(
                regionOwnersArr, 
                regionSoldiersArr, 
                playerNum, 
                loop
            );

            /* Queue actions that player is taking this turn. */
            checkActionCount = 0;
            checkFromRegionList = [];
            checkToRegionList = [];
            let expectedActions = 0;
            for (let i = 0; i < fromList.length; i++) {

                let fromRegionId = fromList[i];
                let toRegionId = toList[i];

                if (checkRegionSoliders[fromRegionId] > 0) {
                    let { 
                        actionCount, 
                        fromRegionList, 
                        toRegionList
                    } = await queueNewPendingAction(
                        accounts, 
                        worldGameInstance, 
                        gameId, 
                        turnNum, 
                        playerNum, 
                        fromRegionId, 
                        toRegionId,
                        checkRegionSoliders[fromRegionId] - 1,
                        debugLog
                    );

                    checkActionCount = actionCount;
                    checkFromRegionList = fromRegionList;
                    checkToRegionList = toRegionList;

                    expectedActions++;
                }
            }

            /* Adds an additional 1 block delay */
            await worldGameInstance.cacheBlockHash32(
                "0",
                {from: accounts[0]}
            );

            /* Check queued action count as is expected. */
            assert.equal(
                checkActionCount, 
                expectedActions, 
                "Expected " + expectedActions + " actions should be queued."
            );
            
            /* Prints summary showing region counts for each player every 10 moves. */
            if (loop % 10 === 0 && debugLog) {
                printSummary(checkRegionOwners);
            }
        }
        
        /* Log total gas used during full game simulation. */
        if (debugLog) console.log("Total gas used during full game simulation was " + gasTotal);
    });

});
