var WorldGame = artifacts.require("./WorldGame.sol");

const NOT_OWNED = 255;
const NO_REGION = 255;
const REGION_COUNT = 25;
const PLAYER_COUNT = 2;
const MAX_ACTIONS_PER_TURN = 8;
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

const REGION_NEIGHBORS = getRegionNeighbors();
const REGION_REWARDS = [3, 6, 5, 11, 8, 3, 3, 4, 2, 2, 10, 6, 4, 3, 3, 4, 3, 5, 7, 10, 5, 4, 6, 4, 2];
const MAX_BLOCKS_PER_TURN = 256;
const TEAM_AVATARS = ["E", "M", "", "", "", "", "", ""].join("");
const NO_ACCOUNT = "0x0000000000000000000000000000000000000000";


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

async function getSoldierCounts(worldGameInstance, gameId) {
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
    for (let i = 0; i < PLAYER_COUNT; i++) {
        let undeployedSoldiers = parseInt(undeployedSoldiersResp[0][i].toString(), 10);
        undeployedSoldiersArr.push(undeployedSoldiers);
    }

    return { regionOwnersArr, regionSoldiersArr, undeployedSoldiersArr };
}

function hasValueInList(list, len, value) {
    let hasMatch = false;
    for (let i = 0; (i < len && i < list.length); i++) {
        if (list[i] === value) {
            hasMatch = true;
        }
    }
    return hasMatch;
}

function chooseRegionToDeploy(checkRegionOwners, playerNum, offset) {
    for (let i = 0; i < REGION_COUNT; i++) {
        let regionId = (i + offset) % REGION_COUNT;
        if (checkRegionOwners[regionId] === NOT_OWNED || checkRegionOwners[regionId] === playerNum) {
            return regionId;
        }
    }

    return NO_REGION;
}

function choosePendingActions(checkRegionOwners, checkRegionSoliders, playerNum, offset) {

    let fromList = [];
    let toList = [];
    let existingToEntries = {};

    if (playerNum === 0 && offset > 10) {
        return { fromList, toList };
    }

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

function printSummary(checkRegionOwners, checkRegionSoliders) {

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

function getEventFromTransaction(tx, name) {
    for (let i = 0; i < tx.logs.length; i++) {
        if (tx.logs[i].event === name) {
            return tx.logs[i].args;
        }
    }

    return null;
}

async function deployAndCheckCounts(
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
    checkMoveSoldierCountList
) {
    console.log("Player " + playerNum + " deploying " + deployCount + " soldiers to " + REGION_NAMES[deployRegion] + ".");

    let tx = await worldGameInstance.deploySoldiersAndEndTurn(
        gameId, 
        turnNum, 
        deployRegion, 
        deployCount,
        {from: accounts[playerNum]}
    );

    let gasUsed = 0;
    let nextTurnNum = "";
    let nextTeamId = 0;

    let args = getEventFromTransaction(tx, "NextTurn");
    if (args) {
        nextTurnNum = args.turnNum.toString();
        nextTeamId = parseInt(args.nextTeamId.toString(), 10);
        gasUsed += tx.receipt.gasUsed;
    }

    let { 
        regionOwnersArr, 
        regionSoldiersArr, 
        undeployedSoldiersArr 
    } = await getSoldierCounts(worldGameInstance, gameId);

    let ownersChanged = false;
    for (let i = 0; i < REGION_COUNT; i++) {
        let regionOwner = regionOwnersArr[i];
        let regionSoldiers = regionSoldiersArr[i];
        
        if (checkRegionOwners[i] !== regionOwner) {
            if (hasValueInList(checkToRegionList, checkActionCount, i)) {
                ownersChanged = true;
                console.log("Action caused " + REGION_NAMES[i] + " to changed owners.");
            }
            else {
                assert.equal(checkRegionOwners[i], regionOwner, REGION_NAMES[i] + " region owner doesn't match");
            }
        }
        if (checkRegionSoliders[i] !== regionSoldiers) {
            if (hasValueInList(checkFromRegionList, checkActionCount, i) || hasValueInList(checkToRegionList, checkActionCount, i)) {
                console.log("Action caused " + REGION_NAMES[i] + " to changed soldier counts from " + checkRegionSoliders[i] + " to " + regionSoldiers + ".");
            }
            else {
                assert.equal(checkRegionSoliders[i], regionSoldiers, REGION_NAMES[i] + " soldier count doesn't match");
            }
        }
    }

    let bonus = calculateBonus(nextTeamId, checkRegionOwners);
    checkUndeployedSoldiers[nextTeamId] += bonus;

    for (let i = 0; i < PLAYER_COUNT; i++) {
        let undeployedSoldiers = undeployedSoldiersArr[i];
        if (checkUndeployedSoldiers[i] !== undeployedSoldiers) {
            if (!ownersChanged) {
                assert.equal(checkUndeployedSoldiers[i], undeployedSoldiers, "Player " + i + " undeployed soldiers doesn't match");
            }
            else {
                console.log("Action caused Player " + i + "'s bonus to change.");
            }
        }
    }

    return { gasUsed, nextTurnNum, nextTeamId, regionOwnersArr, regionSoldiersArr, undeployedSoldiersArr };
}

async function addPendingAction(
    accounts, 
    worldGameInstance, 
    gameId, 
    turnNum, 
    playerNum, 
    regionFrom, 
    regionTo,
    soldierCount
) {
    console.log("Player " + playerNum + " moving " + soldierCount + " soldiers from " + REGION_NAMES[regionFrom] + " to " + REGION_NAMES[regionTo] + ".");

    try {
        let tx = await worldGameInstance.attackOrMove(
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

    return { actionCount, fromRegionList, toRegionList, moveSoldierCountList, submitBlockList };
}

contract('WorldGame', function(accounts) {

    it("Run game simulation", async function() {
        //try {
            let gasTotal = 0;
            let playerNum = 0;

            let worldGameInstance = await WorldGame.deployed();
            let tx = await worldGameInstance.newGame(
                PLAYER_COUNT, 
                MAX_BLOCKS_PER_TURN, 
                [
                    accounts[0], 
                    accounts[1], 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT, 
                    NO_ACCOUNT
                ], 
                web3.utils.asciiToHex(TEAM_AVATARS),
                {from: accounts[0]}
            );
            
            let gameId = "";
            let turnNum = ""; 
            let teamAvatars = ""; 
            let args = getEventFromTransaction(tx, "NewGame");
            if (args) {
                gameId = args.gameId.toString();
                turnNum = args.turnNum.toString();
                teamAvatars = web3.utils.hexToAscii(args.teamAvatars);
                gasTotal += tx.receipt.gasUsed;
                console.log("New game created with gameId " + gameId);
                console.log("Avatar list " + teamAvatars.match(/.{1,2}/g).join(","));
            }

            let checkActionCount = 0;
            let checkFromRegionList = [];
            let checkToRegionList = [];
            let checkMoveSoldierCountList = [];
            let checkRegionOwners = [];
            let checkRegionSoliders = [];
            let checkUndeployedSoldiers = [];

            for (let i = 0; i < REGION_COUNT; i++) {
                checkRegionOwners.push(NOT_OWNED);
                checkRegionSoliders.push(0);
            }

            for (let i = 0; i < PLAYER_COUNT; i++) {
                checkUndeployedSoldiers.push(20);
            }

            for (let loop = 0; loop < 1000; loop++) {
                let deployRegion = chooseRegionToDeploy(checkRegionOwners, playerNum, loop);
                let deployCount = Math.floor(checkUndeployedSoldiers[playerNum] / 2);
                if (deployRegion === NO_REGION) {
                    deployCount = 0;
                }
                
                checkRegionOwners[deployRegion] = playerNum;
                checkRegionSoliders[deployRegion] += deployCount;
                checkUndeployedSoldiers[playerNum] -= deployCount;

                let { 
                    gasUsed, 
                    nextTurnNum, 
                    nextTeamId, 
                    regionOwnersArr, 
                    regionSoldiersArr, 
                    undeployedSoldiersArr 
                } = await deployAndCheckCounts(
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
                    checkMoveSoldierCountList
                );

                /* If next player is current player then we have a winner */
                if (playerNum == nextTeamId) {
                    await worldGameInstance.declareWinner(
                      gameId,
                      nextTeamId,
                      {from: accounts[0]}
                    );

                    console.log("Winner is player " + playerNum + "!!!");

                    break;
                }

                checkRegionOwners = regionOwnersArr;
                checkRegionSoliders = regionSoldiersArr;
                checkUndeployedSoldiers = undeployedSoldiersArr;
                turnNum = nextTurnNum;
                playerNum = nextTeamId;
                gasTotal += gasUsed;

                let { fromList, toList } = choosePendingActions(checkRegionOwners, checkRegionSoliders, playerNum, loop);

                checkActionCount = 0;
                checkFromRegionList = [];
                checkToRegionList = [];
                checkMoveSoldierCountList = [];
                let expectedActions = 0;
                for (let i = 0; i < fromList.length; i++) {

                    let fromRegionId = fromList[i];
                    let toRegionId = toList[i];

                    if (checkRegionSoliders[fromRegionId] > 0) {
                        let { actionCount, fromRegionList, toRegionList, moveSoldierCountList } = await addPendingAction(
                            accounts, 
                            worldGameInstance, 
                            gameId, 
                            turnNum, 
                            playerNum, 
                            fromRegionId, 
                            toRegionId,
                            checkRegionSoliders[fromRegionId] - 1
                        );

                        checkActionCount = actionCount;
                        checkFromRegionList = fromRegionList;
                        checkToRegionList = toRegionList;
                        checkMoveSoldierCountList = moveSoldierCountList;                        

                        expectedActions++;
                    }
                }

                /* Adds an additional 1 block delay */
                await worldGameInstance.cacheBlockHash32(
                    "0",
                    {from: accounts[0]}
                );

                assert.equal(checkActionCount, expectedActions, 'Expected ' + expectedActions + ' actions should be queued.');
                
                if (loop % 10 === 0) {
                    printSummary(checkRegionOwners, checkRegionSoliders);
                }
                


            }
            
            console.log("Total gas used during simulation was " + gasTotal);
        //}
        //catch (exception) {
        //    console.log("Caught exception. Require likely failed: " + exception);
        //    assert.equal(true, false, "Test generated an exception.");
        //}
    });

    

});
