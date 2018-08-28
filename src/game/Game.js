import React, { Component } from 'react'
import { selectTile, moveOrAttack, deployAndEndTurn, hoverTile, syncGameData, showOverlay, cacheBlockHash, declareWinner } from './GameActions'
import ArrowControl from './ArrowControl';
import PropTypes from 'prop-types';
import './Game.css';
import './Common.css';
import OverlayContainer from './OverlayContainer';

class Game extends Component {
    constructor(props, context) {
        super(props)

        // This binding is necessary to make `this` work in the callback
        this.showOverlay = this.showOverlay.bind(this);
        this.moveOrAttack = this.moveOrAttack.bind(this);
        this.cancelTile = this.cancelTile.bind(this);
        this.outsideClick = this.outsideClick.bind(this);
        this.hoverTile = this.hoverTile.bind(this);
        this.cancelHover = this.cancelHover.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getColor = this.getColor.bind(this);
        this.regionNameToId = this.regionNameToId.bind(this);
        this.regionIdToName = this.regionIdToName.bind(this);
        this.regionIdToDisplay = this.regionIdToDisplay.bind(this);
        this.getTilesFromData = this.getTilesFromData.bind(this);
        this.forceNextBlock = this.forceNextBlock.bind(this);
        this.declareWinner = this.declareWinner.bind(this);

        this.regionNames = [
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

        this.regionDisplay = [
          "Hawaii",
          "Western Canada and Alaska",
          "Eastern Canada",
          "Western United States and Mexico",
          "Eastern United States and Caribbean",
          "Greenland",
          "Brazil, Peru and the Amazon Basin",
          "Argentina, Chile and the Southern Cone",
          "West Antarctica",
          "East Antarctica",
          "Western Europe",
          "Eastern Europe",
          "Central Russia",
          "Eastern Russia",
          "West and Central Africa",
          "Middle East",
          "East Africa",
          "South Africa",
          "India",
          "Eastern China",
          "Southeast Asia",
          "Western Australia",
          "Eastern Australia",
          "New Zealand",
          "Fiji and the Solomon Islands"
      ];
    }
    
    regionNameToId(name) {
        for (let i = 0; i < this.regionNames.length; i++) {
            if(this.regionNames[i] === name) {
                return i;
            }
        }
        return 255;
    }

    regionIdToName(id) {
        if (id >= 0 && id < this.regionNames.length) {
            return this.regionNames[id];
        }
        return "";
    }

    regionIdToDisplay(id) {
        if (id >= 0 && id < this.regionDisplay.length) {
            return this.regionDisplay[id];
        }
        return "";
    }

    componentDidMount() {
        this.props.dispatch(syncGameData(this.context.drizzle, this.props.gameId));
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.gameId !== this.props.gameId) {
            this.props.dispatch(syncGameData(this.context.drizzle, nextProps.gameId));
        }
    }

    handleChange(event) {

    }

    showOverlay(event) {
      event.preventDefault();
      let id = event.currentTarget.id;
      this.props.dispatch(showOverlay(id));
    }

    moveOrAttack(event) {
      event.preventDefault();
      let toRegionName = event.currentTarget.id;
      let fromRegionName = this.props.game.selectedTileRegion;
      let toRegionId = this.regionNameToId(toRegionName);
      let fromRegionId = this.regionNameToId(fromRegionName);
      let soldiers = this.props.game.selectedTileSoldiers;
      let turnNum = this.props.game.selectedTileTurnNum;

      this.props.dispatch(moveOrAttack(
          this.context.drizzle, 
          this.props.gameId, 
          turnNum, 
          fromRegionId, 
          toRegionId, 
          soldiers
      ));
    }

    endTurn(event, turnNum, waitingForActions, waitingForBlock) {
        const NO_REGION = 255;
        if (!waitingForActions) {
            this.props.dispatch(deployAndEndTurn(
                this.context.drizzle, 
                this.props.gameId, 
                turnNum, 
                NO_REGION, 
                0
            ));
        }
        else {
            alert("You cannot end turn until block #" + waitingForBlock);
        }
    }

    forceNextBlock(event, blockNumber) {
      event.preventDefault();

      this.props.dispatch(cacheBlockHash(
          this.context.drizzle, 
          blockNumber
      ));
    }

    declareWinner(event, winnerId) {
      event.preventDefault();

      this.props.dispatch(declareWinner(
          this.context.drizzle, 
          this.props.gameId, 
          winnerId
      ));
    }

    cancelTile(event) {
      event.preventDefault();
      this.props.dispatch(selectTile(null, null, null));
    }

    outsideClick(event) {
      this.props.dispatch(selectTile(null, null, null));
    }

    hoverTile(event) {
      event.preventDefault();
      let id = event.currentTarget.id;
      this.props.dispatch(hoverTile(id));
    }

    cancelHover(event) {
      event.preventDefault();
      this.props.dispatch(hoverTile(null));
    }

    getColor(colorIndex) {
        let redStrength = colorIndex % 4;
        let blueStrength = Math.floor(colorIndex/4) % 4;
        let greenStrength = Math.floor(colorIndex/3) % 3;

        if(blueStrength > 1 && greenStrength > 0 && redStrength === 0) {
            redStrength = 2;
        }

        let red = (85 * redStrength);
        let blue = (85 * blueStrength);
        let green = (127 * greenStrength);

        return "rgba(" + red + ", " + blue + ", " + green + ", 0.2)";
    }

    getAvatarFromTeamId(avatarIds, teamId) {

        const AVATAR_STRINGS = ["unicorn", "moose", "eagle", "grizzly", "penguin", "elephant", "panda", "lion", "zebra", "owl", "chicken", "triceratops", "crocodile", "spider", "monkey", "mouse", "dog", "cat", "beaver", "monster", "llama", "pig", "dragon", "owl_guitar", "alien", "dino", "rawr", "penguin_jacket", "snail", "polar_bear", "bird", "bird_red", "horse", "monster_pink", "gnu", "koala", "wolf"];

        if (avatarIds) {
            if (teamId < avatarIds.length) {
                let charCode = avatarIds.charCodeAt(teamId);
                charCode = charCode >= 97 ? charCode - 97 : 0;
                if (charCode < AVATAR_STRINGS.length) {
                    return AVATAR_STRINGS[charCode];
                }
            }
        }
        
        if (teamId === 0) {
            return "unicorn";
        }
        else if (teamId === 1) {
            return "moose";
        }
        else if (teamId === 2) {
            return "eagle";
        }
        else if (teamId === 3) {
            return "grizzly";
        }
        else if (teamId === 4) {
            return "penguin";
        }
        else if (teamId === 5) {
            return "elephant";
        }
        else if (teamId === 6) {
            return "panda";
        }
        else if (teamId === 7) {
            return "lion";
        }

        return null;
    }

    getTilesFromData(regionOwnersList, regionSoldiers, avatarIds) {
        let colorIndex = 0;
        let mapTiles = [];
        let gapTiles = [];
    
        gapTiles.push({top: 175, left: 0, width: 205, height: 105});
        gapTiles.push({top: 400, left: 0, width: 375, height: 350});
        gapTiles.push({top: 380, left: 205, width: 170, height: 20});
        gapTiles.push({top: 750, left: 0, width: 255, height: 120});
        gapTiles.push({top: 175, left: 605, width: 160, height: 70});
        gapTiles.push({top: 245, left: 605, width: 110, height: 135});
        gapTiles.push({top: 380, left: 675, width: 40, height: 250});
        gapTiles.push({top: 630, left: 675, width: 630, height: 120});
        gapTiles.push({top: 690, left: 1305, width: 210, height: 60});
        gapTiles.push({top: 490, left: 1115, width: 190, height: 140});
        gapTiles.push({top: 420, left: 1115, width: 110, height: 70});
        gapTiles.push({top: 800, left: 1515, width: 195, height: 70});
        gapTiles.push({top: 175, left: 1515, width: 195, height: 155});
    
        mapTiles.push({
            top:280, left:0, width:205, height:120,
            color:this.getColor(colorIndex++),
            name:"HAWAII",
            neighbors:{WESTERN_USA:true, FIJI:true},
            points: 3
        });
    
        mapTiles.push({
            top:0, left:0, width:405, height:175,
            color:this.getColor(colorIndex++),
            name:"WESTERN_CANADA",
            neighbors:{WESTERN_USA:true, EASTERN_CANADA:true, EASTERN_RUSSIA:true},
            points: 6
        });
    
        mapTiles.push({
            top:0, left:405, width:200, height:175,
            color:this.getColor(colorIndex++),
            name:"EASTERN_CANADA",
            neighbors:{WESTERN_CANADA:true, GREENLAND:true, EASTERN_USA:true},
            points: 5
        });
        
        mapTiles.push({
            top:175, left:205, width:200, height:205,
            color:this.getColor(colorIndex++),
            name:"WESTERN_USA",
            neighbors:{HAWAII:true, WESTERN_CANADA:true, EASTERN_USA:true, NORTHERN_SOUTH_AMERICA:true},
            points: 11
        });
    
        mapTiles.push({
            top:175, left:405, width:200, height:205,
            color:this.getColor(colorIndex++),
            name:"EASTERN_USA",
            neighbors:{WESTERN_USA:true, EASTERN_CANADA:true, NORTHERN_SOUTH_AMERICA:true},
            points: 8
        });
    
        mapTiles.push({
            top:0, left:605, width:160, height:175,
            color:this.getColor(colorIndex++),
            name:"GREENLAND",
            neighbors:{EASTERN_CANADA:true, WESTERN_EUROPE:true},
            points: 3
        });
    
        mapTiles.push({
            top:380, left:375, width:300, height:180,
            color:this.getColor(colorIndex++),
            name:"NORTHERN_SOUTH_AMERICA",
            neighbors:{WESTERN_USA:true, EASTERN_USA:true, SOUTHERN_SOUTH_AMERICA:true},
            points: 3
        });
    
        mapTiles.push({
            top:560, left:375, width:300, height:190,
            color:this.getColor(colorIndex++),
            name:"SOUTHERN_SOUTH_AMERICA",
            neighbors:{NORTHERN_SOUTH_AMERICA:true, WEST_ANTARCTICA:true},
            points: 4
        });
    
        mapTiles.push({
            top:750, left:255, width:630, height:120,
            color:this.getColor(colorIndex++),
            name:"WEST_ANTARCTICA",
            neighbors:{SOUTHERN_SOUTH_AMERICA:true, EAST_ANTARCTICA:true},
            points: 2
        });
    
        mapTiles.push({
            top:750, left:885, width:630, height:120,
            color:this.getColor(colorIndex++),
            name:"EAST_ANTARCTICA",
            neighbors:{WEST_ANTARCTICA:true, NEW_ZEALAND:true},
            points: 2
        });
    
        mapTiles.push({
            top:0, left:765, width:120, height:245,
            color:this.getColor(colorIndex++),
            name:"WESTERN_EUROPE",
            neighbors:{GREENLAND:true, EASTERN_EUROPE:true, WEST_AFRICA:true},
            points: 10
        });
    
        mapTiles.push({
            top:0, left:885, width:120, height:245,
            color:this.getColor(colorIndex++),
            name:"EASTERN_EUROPE",
            neighbors:{WESTERN_EUROPE:true, WEST_AFRICA:true, MIDDLE_EAST:true, CENTRAL_RUSSIA:true},
            points: 6
        });
    
        mapTiles.push({
            top:0, left:1005, width:220, height:245,
            color:this.getColor(colorIndex++),
            name:"CENTRAL_RUSSIA",
            neighbors:{EASTERN_EUROPE:true, MIDDLE_EAST:true, INDIA:true, EASTERN_CHINA:true, EASTERN_RUSSIA:true},
            points: 4
        });
    
        mapTiles.push({
            top:0, left:1225, width:485, height:175,
            color:this.getColor(colorIndex++),
            name:"EASTERN_RUSSIA",
            neighbors:{EASTERN_CHINA:true, CENTRAL_RUSSIA:true, WESTERN_CANADA:true},
            points: 3
        });
    
        mapTiles.push({
            top:245, left:715, width:220, height:255,
            color:this.getColor(colorIndex++),
            name:"WEST_AFRICA",
            neighbors:{WESTERN_EUROPE:true, EASTERN_EUROPE:true, MIDDLE_EAST:true, EAST_AFRICA:true, SOUTH_AFRICA:true},
            points: 3
        });
    
        mapTiles.push({
            top:245, left:935, width:180, height:135,
            color:this.getColor(colorIndex++),
            name:"MIDDLE_EAST",
            neighbors:{EASTERN_EUROPE:true, CENTRAL_RUSSIA:true, INDIA:true, EAST_AFRICA: true, WEST_AFRICA:true },
            points: 4
        });
    
        mapTiles.push({
            top:380, left:935, width:180, height:120,
            color:this.getColor(colorIndex++),
            name:"EAST_AFRICA",
            neighbors:{WEST_AFRICA:true, SOUTH_AFRICA:true, MIDDLE_EAST:true, INDIA:true},
            points: 3
        });
    
        mapTiles.push({
            top:500, left:715, width:400, height:130,
            color:this.getColor(colorIndex++),
            name:"SOUTH_AFRICA",
            neighbors:{WEST_AFRICA:true, EAST_AFRICA:true},
            points: 5
        });
    
        mapTiles.push({
            top:245, left:1115, width:110, height:175,
            color:this.getColor(colorIndex++),
            name:"INDIA",
            neighbors:{EAST_AFRICA:true, MIDDLE_EAST:true, CENTRAL_RUSSIA:true, EASTERN_CHINA:true, SOUTHEAST_ASIA:true},
            points: 7
        });
    
        mapTiles.push({
            top:175, left:1225, width:290, height:155,
            color:this.getColor(colorIndex++),
            name:"EASTERN_CHINA",
            neighbors:{INDIA:true, CENTRAL_RUSSIA:true, EASTERN_RUSSIA:true, SOUTHEAST_ASIA:true},
            points: 10
        });
    
        mapTiles.push({
            top:330, left:1225, width:290, height:160,
            color:this.getColor(colorIndex++),
            name:"SOUTHEAST_ASIA",
            neighbors:{INDIA:true, EASTERN_CHINA:true, WESTERN_AUSTRALIA:true, EASTERN_AUSTRALIA:true, FIJI:true},
            points: 5
        });
    
        mapTiles.push({
            top:490, left:1305, width:110, height:200,
            color:this.getColor(colorIndex++),
            name:"WESTERN_AUSTRALIA",
            neighbors:{EASTERN_AUSTRALIA:true, SOUTHEAST_ASIA:true},
            points: 4
        });
    
        mapTiles.push({
            top:490, left:1415, width:100, height:200,
            color:this.getColor(colorIndex++),
            name:"EASTERN_AUSTRALIA",
            neighbors:{WESTERN_AUSTRALIA:true, SOUTHEAST_ASIA:true, FIJI:true, NEW_ZEALAND:true},
            points: 6
        });
    
        mapTiles.push({
            top:600, left:1515, width:195, height:200,
            color:this.getColor(colorIndex++),
            name:"NEW_ZEALAND",
            neighbors:{EASTERN_AUSTRALIA:true, FIJI:true, EAST_ANTARCTICA:true},
            points: 4
        });
    
        mapTiles.push({
            top:330, left:1515, width:195, height:270,
            color:this.getColor(colorIndex++),
            name:"FIJI",
            neighbors:{NEW_ZEALAND:true, EASTERN_AUSTRALIA:true, SOUTHEAST_ASIA:true, HAWAII:true},
            points: 2
        });

        for (let i = 0; i < mapTiles.length; i++) {
            let regionOwner = regionOwnersList ? parseInt(regionOwnersList[i], 10) : 255;
            let soldierCount = regionSoldiers ? parseInt(regionSoldiers[i], 10) : 0;
            mapTiles[i].teamId = regionOwner;
            mapTiles[i].avatar = this.getAvatarFromTeamId(avatarIds, regionOwner);
            mapTiles[i].soliders = soldierCount;
            mapTiles[i].regionId = this.regionNameToId(mapTiles[i].name);
            mapTiles[i].display = this.regionIdToDisplay(mapTiles[i].regionId);
        }

        return { mapTiles, gapTiles };
    }

  render() {

    let pendingEndTurnKey = this.props.game.pendingEndTurn;
    let pendingAttackOrMoveKey = this.props.game.pendingAttackOrMove;
    let hasEndTurnTransaction = false;
    let hasAttackOrMoveTransaction = false;
    if (pendingEndTurnKey !== null) {
        let state = this.context.drizzle.store.getState();  
        if (state.transactionStack[pendingEndTurnKey]) {
            hasEndTurnTransaction = true;
        }
    }

    if (pendingAttackOrMoveKey !== null) {
        let state = this.context.drizzle.store.getState();  
        if (state.transactionStack[pendingAttackOrMoveKey]) {
            hasAttackOrMoveTransaction = true;
        }
    }

    const NO_PLAYER = 255;
    let { eth, utils } = this.context.drizzle.web3;
    let { selectedAddress = "" } = eth.currentProvider.publicConfigStore.getState();
    
    let gameId = this.props.gameId;
    let dataKeysByGame = this.props.game.dataKeysByGame;
    let dataKeys = dataKeysByGame.hasOwnProperty(gameId) ? dataKeysByGame[gameId] : null;
    let soldiersByRegionKey = null;
    let undeployedSoldiersKey = null;
    let pendingActionsKey = null;
    let pendingActionOutcomesKey = null;
    let turnAndPlayerInfoKey = null;
    if (dataKeys) {
        soldiersByRegionKey = dataKeys.soldiersByRegion;
        undeployedSoldiersKey = dataKeys.undeployedSoldiers;
        pendingActionsKey = dataKeys.pendingActions;
        pendingActionOutcomesKey = dataKeys.pendingActionOutcomes
        turnAndPlayerInfoKey = dataKeys.turnAndPlayerInfo;
    }
    let initialized = false;
    let regionOwnersList = null;
    let regionSoldiers = null;

    let undeployedSoldiers = null;
    let playerRewardPoints = null;

    let actionCount = 0; 
    let actionList = [];
    
    let blockNumber = 0;
    let turnTeamId = null;
    let turnNum = null;
    let maxBlocksPerTurn = null;
    let playerCount = null;
    let playerAddresses = null;
    let avatarIds = null;
    if (
        this.props.WorldGame.initialized && 
        soldiersByRegionKey !== null && 
        undeployedSoldiersKey !== null && 
        pendingActionsKey !== null && 
        pendingActionOutcomesKey !== null && 
        turnAndPlayerInfoKey !== null && 
        this.props.WorldGame.soldiersByRegion.hasOwnProperty(soldiersByRegionKey) && 
        this.props.WorldGame.undeployedSoldiers.hasOwnProperty(undeployedSoldiersKey) && 
        this.props.WorldGame.pendingActions.hasOwnProperty(pendingActionsKey) && 
        this.props.WorldGame.pendingActionOutcomes.hasOwnProperty(pendingActionOutcomesKey) && 
        this.props.WorldGame.turnAndPlayerInfo.hasOwnProperty(turnAndPlayerInfoKey)
    ) {
        let soldiersByRegion = this.props.WorldGame.soldiersByRegion[soldiersByRegionKey].value;
        regionOwnersList = soldiersByRegion[0];
        regionSoldiers = soldiersByRegion[1];

        let undeployedSoldiersResp = this.props.WorldGame.undeployedSoldiers[undeployedSoldiersKey].value;
        undeployedSoldiers = undeployedSoldiersResp[0];
        playerRewardPoints = undeployedSoldiersResp[1];

        let turnAndPlayerInfo = this.props.WorldGame.turnAndPlayerInfo[turnAndPlayerInfoKey].value;
        turnTeamId = parseInt(turnAndPlayerInfo[0], 10);
        turnNum = parseInt(turnAndPlayerInfo[1], 10);
        maxBlocksPerTurn = parseInt(turnAndPlayerInfo[2], 10);
        playerCount = parseInt(turnAndPlayerInfo[3], 10);
        playerAddresses = turnAndPlayerInfo[4];
        avatarIds = utils.hexToAscii(turnAndPlayerInfo[5]);

        let pendingActions = this.props.WorldGame.pendingActions[pendingActionsKey].value;
        let pendingActionOutcomes = this.props.WorldGame.pendingActionOutcomes[pendingActionOutcomesKey].value;
        actionCount = pendingActions[0];
        let fromRegionList = pendingActions[1];
        let toRegionList = pendingActions[2];
        let moveSoldierCountList = pendingActions[3];
        blockNumber = parseInt(pendingActionOutcomes[0], 10);
        let actionCountOutcomes = pendingActionOutcomes[1];
        let submitBlockList = pendingActionOutcomes[2];
        let remainingAttackerList = pendingActionOutcomes[3];
        let remainingDefenderList = pendingActionOutcomes[4];

        actionCount = Math.min(
            actionCount, 
            actionCountOutcomes, 
            fromRegionList.length, 
            toRegionList.length, 
            moveSoldierCountList.length, 
            submitBlockList.length, 
            remainingAttackerList.length, 
            remainingDefenderList.length
        );
        for (let i = 0; i < actionCount; i++) {
            let toRegion = parseInt(toRegionList[i], 10);
            let owner = parseInt(regionOwnersList[toRegion], 10);
            let submitBlock = parseInt(submitBlockList[i], 10);
            let isFriendly = false;
            let outcomeBlock = submitBlock + 2;
            if (owner === turnTeamId || owner === NO_PLAYER) {
                isFriendly = true;
                outcomeBlock = submitBlock;
            }
            
            actionList.push({
                fromRegion: parseInt(fromRegionList[i], 10), 
                toRegion: toRegion, 
                soldierCount: parseInt(moveSoldierCountList[i], 10), 
                submitBlock: submitBlock,
                hasOutcome: (blockNumber >= outcomeBlock), 
                outcomeBlock: outcomeBlock, 
                remainingAttackers: parseInt(remainingAttackerList[i], 10), 
                remainingDefenders: parseInt(remainingDefenderList[i], 10), 
                owner: owner,
                isFriendly: isFriendly
            });
        }

        if (playerAddresses !== null && playerCount !== null && avatarIds !== null) {
            playerAddresses = playerAddresses.slice(0, playerCount);
            avatarIds = avatarIds.substring(0, playerCount);

            // Prevents duplicate avatars being registered
            let checkDuplicateAvatar = {};
            for (let i = 0; i < avatarIds.length; i++) {
                let id = avatarIds[i];
                if (checkDuplicateAvatar.hasOwnProperty(id)) {
                    avatarIds = null;
                    break;
                }

                checkDuplicateAvatar[id] = true;
            }
        }

        initialized = true;
    }

    let yourUndeployedSoldiers = 0;
    let youPlayerRewardPoints = 0;
    let playerNum = NO_PLAYER;
    if (selectedAddress && playerAddresses) {
        for (let i = 0; i < playerAddresses.length; i++) {
            if (selectedAddress.toLowerCase() === playerAddresses[i].toLowerCase()) {
                playerNum = i;
                yourUndeployedSoldiers = i < undeployedSoldiers.length ? parseInt(undeployedSoldiers[i], 10) : 0;
                youPlayerRewardPoints = i < playerRewardPoints.length ? parseInt(playerRewardPoints[i], 10) : 0;
            }
        }
    }

    let currentPlayerStr = "";
    if (playerAddresses) {
        for (let i = 0; i < playerAddresses.length; i++) {
            if (i === turnTeamId) {
                currentPlayerStr = "Player " + (i + 1);
                if (i === playerNum) {
                    currentPlayerStr += " (you)";
                }
            }
        }
    }

    let yourTurn = (playerNum === turnTeamId);
    let selectedOverlayId = null;
    if (!hasAttackOrMoveTransaction && !hasEndTurnTransaction) {
        selectedOverlayId = this.props.game.selectedOverlayId;
    }

    let selectedTileRegion = null;
    if (!hasAttackOrMoveTransaction && !hasEndTurnTransaction) {
        selectedTileRegion = this.props.game.selectedTileRegion;
    }
    
    let hoverTile = this.props.game.hoverTile;

    let actionMessageByRegion = {};
    let actionSoldiersByRegion = {};
    let waitingForActions = false;
    let endTurnByBlock = null;
    if (turnNum !== null && maxBlocksPerTurn !== null) {
        endTurnByBlock = turnNum + maxBlocksPerTurn;
    }

    let waitingForBlock = 0;
    let renderedActions = [];
    for (let i = 0; i < actionList.length; i++) {
        let actionEntry = actionList[i];

        actionMessageByRegion[actionEntry.toRegion] = "ATTACKING";
        let actionType = "Attack with";
        let isFriendly = false;
        if (actionEntry.owner === turnTeamId || actionEntry.owner === NO_PLAYER) {
            isFriendly = true;
            actionType = "Move";
            actionMessageByRegion[actionEntry.toRegion] = "MOVING";
        }

        let initialDefenders = regionSoldiers ? parseInt(regionSoldiers[actionEntry.toRegion], 10) : 0;
        let initialAttackers = actionEntry.soldierCount;
        let remainingDefenders = actionEntry.remainingDefenders;
        let remainingAttackers = actionEntry.remainingAttackers;

        if (!actionSoldiersByRegion.hasOwnProperty(actionEntry.toRegion)) {
            actionSoldiersByRegion[actionEntry.toRegion] = 0;
        }
        actionSoldiersByRegion[actionEntry.toRegion] += initialAttackers;

        let outcomeClass = "outcomePending";
        let outcomeText = "Waiting for block #" + actionEntry.outcomeBlock + ".  Current block is #" + blockNumber + ".";
        if (actionEntry.hasOutcome) {
            if (isFriendly) {
                outcomeClass = "outcomeWon";
                outcomeText = currentPlayerStr + " moved " + initialAttackers + " " + (initialAttackers === 1 ? "soldier" : "soldiers") + ".";
            }
            else {
                let lostDefenders = initialDefenders > remainingDefenders ? initialDefenders - remainingDefenders : 0;
                let lostAttackers = initialAttackers > remainingAttackers ? initialAttackers - remainingAttackers : 0;
      
                if (remainingDefenders === 0) {
                    outcomeClass = "outcomeWon";
                    outcomeText = currentPlayerStr + " won the attack!  " + currentPlayerStr + " lost " + lostAttackers + " " + (lostAttackers === 1 ? "soldier" : "soldiers") + ", and killed " + lostDefenders + " " + (lostDefenders === 1 ? "soldier" : "soldiers") + ".";
                }
                else {
                    outcomeClass = "outcomeLost";
                    outcomeText = currentPlayerStr + " failed the attack!  " + currentPlayerStr + " lost " + lostAttackers + " " + (lostAttackers === 1 ? "soldier" : "soldiers") + ", and killed " + lostDefenders + " " + (lostDefenders === 1 ? "soldier" : "soldiers") + ".";
                }
            }
        }
        else {
            waitingForActions = true;
            waitingForBlock = Math.max(waitingForBlock, actionEntry.outcomeBlock);
        }
        
        const BLOCKHASHES_EXPIRE_BLOCKS = 256;
        let finishTurnBlock = actionEntry.outcomeBlock + (BLOCKHASHES_EXPIRE_BLOCKS - 1);
        endTurnByBlock = (endTurnByBlock === null) ? finishTurnBlock : Math.min(endTurnByBlock, finishTurnBlock);

        renderedActions.push(
            <li key={i}>
                {actionType} {actionEntry.soldierCount} {actionEntry.soldierCount === 1 ? "soldier" : "soldiers"} from 
                <span> "{this.regionIdToDisplay(actionEntry.fromRegion)}" </span> to 
                <span> "{this.regionIdToDisplay(actionEntry.toRegion)}"</span>. 
                <span className={outcomeClass}> {outcomeText}</span>
            </li>
        );
    }

    let endTurnMinutes = 0;
    if (endTurnByBlock !== null && endTurnByBlock > blockNumber) {
        let remainingBlocks = endTurnByBlock - blockNumber;
        endTurnMinutes = Math.floor(remainingBlocks/4);
    }

    let endTurnHours = Math.floor(endTurnMinutes/60);
    endTurnMinutes %= 60;

    let { mapTiles, gapTiles } = this.getTilesFromData(regionOwnersList, regionSoldiers, avatarIds);

    let selectedTeam = NO_PLAYER;
    let selectedCenterPos = {left:0, top:0};
    let selectedNeighbors = {};
    for (let i = 0; i < mapTiles.length; i++) {
      let tile = mapTiles[i];
      let isSelected = (selectedTileRegion === tile.name);

      if(isSelected) {
        selectedNeighbors = tile.neighbors;
        selectedTeam = tile.teamId;
        selectedCenterPos = {left:tile.left + Math.floor(tile.width/2), top:tile.top + Math.floor(tile.height/2)};
      }
    }
    
    let firstTilePlayer = mapTiles.length > 0 ? mapTiles[0].teamId : NO_PLAYER;
    let testWinnerRegionCount = 0;
    let yourRegionCount = 0;
    let overlayData = null;
    let neighborCenterPosList = [];
    let renderedTiles = [];
    for (let i = 0; i < mapTiles.length; i++) {
        let tile = mapTiles[i];

        let leftPos = Math.floor(Math.max(0, tile.width-70)/2);
        let topPos = Math.floor(Math.max(0, tile.height-90)/2)+5;

        let isSelected = (selectedTileRegion === tile.name);
        let hasHover = (hoverTile === tile.name);
        let isSelectedOverlay = (selectedOverlayId === tile.name);

        let isNeighbor = false;
        if (selectedNeighbors.hasOwnProperty(tile.name)) {
            isNeighbor = true;
        }

        let isFriendly = false;
        if (selectedTeam === tile.teamId || tile.teamId === NO_PLAYER) {
            isFriendly = true;
        }

        let isYourTeam = false;
        if (playerNum === tile.teamId) {
            isYourTeam = true;
            yourRegionCount++;
        }

        if (firstTilePlayer === tile.teamId) {
            testWinnerRegionCount++;
        }

        let isUnowned = false;
        if (tile.teamId === NO_PLAYER) {
            isUnowned = true;
        }

        let queuedAction = null;
        let queuedSoldiers = 0;
        if (actionMessageByRegion.hasOwnProperty(i)) {
            queuedAction = actionMessageByRegion[i];
            queuedSoldiers = actionSoldiersByRegion[i];
        }

        if (isSelectedOverlay) {
            let soldiers = tile.soliders;
            let isNotOwned = (tile.teamId === NO_PLAYER);
            overlayData = {
                tile, isYourTeam, isNotOwned, soldiers, yourUndeployedSoldiers, yourTurn
            };
        }

        let hideQueueSummary = hasHover && (isYourTeam || isUnowned);

        if (queuedAction === null && isNeighbor) {
          if (selectedTileRegion === "HAWAII" && tile.name === "FIJI") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:0, y2:selectedCenterPos.top+20});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:1710, y2:tile.top + Math.floor(tile.height/2)-20});
          }
          else if (selectedTileRegion === "FIJI" && tile.name === "HAWAII") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:1710, y2:selectedCenterPos.top-20});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:0, y2:tile.top + Math.floor(tile.height/2)+20});
          }
          else if (selectedTileRegion === "WESTERN_CANADA" && tile.name === "EASTERN_RUSSIA") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:0, y2:selectedCenterPos.top});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:1710, y2:tile.top + Math.floor(tile.height/2)});
          }
          else if (selectedTileRegion === "EASTERN_RUSSIA" && tile.name === "WESTERN_CANADA") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:1710, y2:selectedCenterPos.top});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:0, y2:tile.top + Math.floor(tile.height/2)});
          }
          else {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:true, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:tile.left + Math.floor(tile.width/2), y2:tile.top + Math.floor(tile.height/2)});
          }
        }

        renderedTiles.push(
            <div 
                onMouseEnter={this.hoverTile} 
                onMouseLeave={this.cancelHover} 
                onClick={selectedTileRegion === null ? this.showOverlay : (queuedAction === null && isNeighbor ? this.moveOrAttack : this.cancelTile)} 
                id={tile.name} 
                key={tile.name} 
                style={{
                    cursor: "pointer",
                    position: "absolute", 
                    textAlign: "center", 
                    top: tile.top, 
                    left: tile.left, 
                    width: tile.width, 
                    height: tile.height, 
                    background: tile.color
                }}
            >
                {tile.display}
                {(selectedTileRegion === null && yourTurn && hasHover && (isYourTeam || isUnowned) && !isSelected) ? 
                    <div style={{position:"absolute", zIndex:5, color:"#00cc00", background:"rgba(0,0,0,0.7)", textAlign:"center", width:90, padding:10, fontSize:24, top:(topPos+10), left:(leftPos-20)}}>SELECT</div> : 
                    null
                }
                {(queuedAction === null && isNeighbor && hasHover && isFriendly) ? 
                    <div style={{position:"absolute", zIndex:5, color:"#00cc00", background:"rgba(0,0,0,0.7)", textAlign:"center", width:90, padding:10, fontSize:24, top:(topPos+10), left:(leftPos-20)}}>MOVE</div> : 
                    null
                }
                {(queuedAction === null && isNeighbor && hasHover && !isFriendly) ? 
                    <div style={{position:"absolute", zIndex:5, color:"#ff0000", background:"rgba(0,0,0,0.7)", textAlign:"center", width:90, padding:10, fontSize:24, top:(topPos+10), left:(leftPos-20)}}>ATTACK</div> : 
                    null
                }
                {(!hideQueueSummary && queuedAction) ? 
                    <div style={{position:"absolute", zIndex:5, color:(queuedAction === "ATTACKING" ? "#ff0000" : "#00cc00"), background:"rgba(80,80,80,0.9)", textAlign:"center", width:90, padding:10, fontSize:16, top:(topPos+5), left:(leftPos-20)}}>{queuedAction}<div>{"+" + queuedSoldiers}</div></div> : 
                    null
                }
                {(queuedAction === null && isNeighbor && isFriendly) ? 
                    <img src={"/circle_lightblue.png"} alt="" style={{width:90, height:90, position:"absolute", top:(topPos-10), left:(leftPos-10)}}/> : 
                    null
                }
                {(queuedAction === null && isNeighbor && !isFriendly) ? 
                    <img src={"/circle_red2.png"} alt="" style={{width:90, height:90, position:"absolute", top:(topPos-10), left:(leftPos-10)}}/> : 
                    null
                }
                {isSelected ? 
                    <img src={"/circle_green.png"} alt="" style={{width:90, height:90, position:"absolute", top:(topPos-10), left:(leftPos-10)}}/> : 
                    null
                }
                {tile.avatar !== null && (
                    <div style={{width:70, height:90, textAlign:"center", position:"absolute", top:topPos, left:leftPos}}>
                        <img src={"/" + tile.avatar + ".png"} alt="" style={{maxWidth:70, maxHeight:70}}/>
                        <div>{tile.soliders}</div>
                    </div>
                )}
            </div>
        );
    }

    let renderedGaps = [];
    for(let i = 0; i < gapTiles.length; i++) {
        let tile = gapTiles[i];
        renderedGaps.push(<div key={i} onClick={this.cancelTile} style={{position:"absolute", top:tile.top, left:tile.left, width:tile.width, height:tile.height, background:"rgba(64, 196, 255, 0.3)"}}></div>);
    }

    let renderedArrows = [];
    for(let i = 0; i < neighborCenterPosList.length; i++) {
        let neighborCenterPos = neighborCenterPosList[i];
        renderedArrows.push(<ArrowControl isFriendly={neighborCenterPos.isFriendly} shortenDest={neighborCenterPos.shortenDest} onClick={this.cancelTile} key={i} x1={neighborCenterPos.x1} y1={neighborCenterPos.y1} x2={neighborCenterPos.x2} y2={neighborCenterPos.y2} />);
    }

    let hasWinner = false;
    let winnerId = NO_PLAYER;
    if (testWinnerRegionCount === mapTiles.length && firstTilePlayer !== NO_PLAYER) {
        hasWinner = true;
        winnerId = firstTilePlayer;
    }

    let renderPlayerList = [];
    if (playerAddresses) {
        for (let i = 0; i < playerAddresses.length; i++) {
            let avatar = this.getAvatarFromTeamId(avatarIds, i);
            let extraMsg = "";
            if (i === playerNum) {
                extraMsg = "(you)";
            }
            
            let borderStyle = "1px solid #999";
            let backgroundStyle = "";
            if (hasWinner) {
                if (i === winnerId) {
                  borderStyle = "1px solid #1Aa239";
                  backgroundStyle = "#1Aa239";
                }
            }
            else {
                if (i === turnTeamId) {
                  borderStyle = "1px solid #1Aa239";
                  backgroundStyle = "#1Aa239";
                }
            }

            renderPlayerList.push(
                <td style={{border: borderStyle, background: backgroundStyle}} key={i}>
                    <div style={{width:70, height:120, textAlign:"center", padding:10}}>
                        <div>player {i+1}</div>
                        <div><img src={"/" + avatar + ".png"} alt="" style={{maxWidth:70, maxHeight:70, marginTop:5}}/></div>
                        <div>{extraMsg}</div>
                    </div>
                </td>
            );
        }
    }

    return (
        <div>
            {
                selectedOverlayId !== null && 
                <OverlayContainer 
                    data={overlayData} 
                    gameId={gameId} 
                    turnNum={turnNum} 
                    playerNum={playerNum} 
                    waitingForActions={waitingForActions} 
                    waitingForBlock={waitingForBlock} 
                    actionCount={actionCount} 
                />
            }
            <div className="menuGap"></div>
            <div onClick={this.outsideClick} style={{background:"#fafafa", width: 1710}}>
                {initialized && (
                    <div style={{padding: 20}}>
                        {hasWinner ? (
                            <div>
                                {winnerId === playerNum ? (
                                    <span style={{fontSize:20, fontWeight:"bold", color:"#1Aa239"}}>{"You win the game!"}</span>    
                                ) : (
                                    <span style={{fontSize:20, fontWeight:"bold", color:"#1Aa239"}}>{"Player " + (winnerId+1) + " wins the game!"}</span>    
                                )}
                                <table style={{marginTop:20}}><tbody><tr>{renderPlayerList}</tr></tbody></table>
                                <button onClick={(event) => this.declareWinner(event, winnerId)} className="btn">Declare winner on blockchain</button>
                            </div>
                        ) : (
                            <div>
                                {yourTurn ? (
                                    <span style={{fontSize:20, fontWeight:"bold", color:"#1Aa239"}}>{"It's your turn. "}</span>
                                ) : (
                                    <span style={{fontSize:20, fontWeight:"bold", color:"#dd2010"}}>{playerNum === NO_PLAYER ? "You are not playing. " : ""}{"It's player " + (turnTeamId + 1) + "'s turn. "}</span>
                                )}
                                {playerNum === NO_PLAYER ? (
                                    <span></span>
                                ) : (
                                    <span>
                                        {"You are player " + (playerNum + 1) + ". "}
                                        {"You control " + yourRegionCount + " regions (worth " + youPlayerRewardPoints + " points) and have " + yourUndeployedSoldiers + " undeployed " + (yourUndeployedSoldiers === 1 ? "soldier" : "soldiers") + ". "}
                                        {yourTurn && endTurnByBlock !== null ? <span>You must end your turn by block #{endTurnByBlock} (~{endTurnHours}h {endTurnMinutes}min). </span> : ""}
                                        {<span>Interact with the map to move, attack or deploy soldiers. </span>}
                                    </span>
                                )}
                                <table style={{marginTop:20}}><tbody><tr>{renderPlayerList}</tr></tbody></table>
                                <div style={{marginTop:20}}>
                                    <div>Queued moves and attacks for current player. Max 8 per turn:</div>
                                    <ul>
                                    {renderedActions.length > 0 ? renderedActions : <li>None.</li>}
                                    </ul>
                                </div>
                                {yourTurn && (
                                    <div>
                                        <button onClick={(event) => this.endTurn(event, turnNum, waitingForActions, waitingForBlock)} className={waitingForActions ? "btnDisabled" : "btn"} style={{marginBottom:0}}>End your turn without deploying soldiers</button>
                                        <button onClick={(event) => this.forceNextBlock(event, blockNumber)} className="btn" style={{marginBottom:0}}>Force next block</button>
                                        {waitingForActions && <div className="errorExplainer">You cannot end turn until block #{waitingForBlock}</div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div style={{background:"url('/world_blank.png') no-repeat -65px -35px", width:1710, height:870, position:"relative"}} >
                {renderedTiles}
                {renderedGaps}   
                {renderedArrows}               
            </div>
            <div onClick={this.outsideClick} style={{background: "#fafafa", width: 1710, height: 100}}>
            </div>
        </div>
    )
  }
}

Game.contextTypes = {
  drizzle: PropTypes.object
}

export default Game
