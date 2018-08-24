import React, { Component } from 'react'
import { selectTile, hoverTile, syncGameData } from './GameActions'
import ArrowControl from './ArrowControl';
import PropTypes from 'prop-types';
import './Game.css';

class Game extends Component {
    constructor(props, context) {
        super(props)

        // This binding is necessary to make `this` work in the callback
        this.selectTile = this.selectTile.bind(this);
        this.cancelTile = this.cancelTile.bind(this);
        this.hoverTile = this.hoverTile.bind(this);
        this.cancelHover = this.cancelHover.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getColor = this.getColor.bind(this);
        this.regionNameToId = this.regionNameToId.bind(this);
        this.regionIdToName = this.regionIdToName.bind(this);
        this.getTilesFromData = this.getTilesFromData.bind(this);

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

    selectTile(event) {
      event.preventDefault();
      let id = event.currentTarget.id;
      this.props.dispatch(selectTile(id));
    }

    cancelTile(event) {
      event.preventDefault();
      this.props.dispatch(selectTile(null));
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

    getAvatarFromTeamId(teamId) {
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

    getTilesFromData(teamId, regionOwnersList, regionSoldiers) {

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
            continent:"north_america",
            display:"Hawaii",
            name:"HAWAII",
            neighbors:{WESTERN_USA:true, FIJI:true},
            points: 3
        });
    
        mapTiles.push({
            top:0, left:0, width:405, height:175,
            color:this.getColor(colorIndex++),
            continent:"north_america",
            display:"Western Canada and Alaska",
            name:"WESTERN_CANADA",
            neighbors:{WESTERN_USA:true, EASTERN_CANADA:true, EASTERN_RUSSIA:true},
            points: 6
        });
    
        mapTiles.push({
            top:0, left:405, width:200, height:175,
            color:this.getColor(colorIndex++),
            continent:"north_america",
            display:"Eastern Canada",
            name:"EASTERN_CANADA",
            neighbors:{WESTERN_CANADA:true, GREENLAND:true, EASTERN_USA:true},
            points: 5
        });
        
        mapTiles.push({
            top:175, left:205, width:200, height:205,
            color:this.getColor(colorIndex++),
            continent:"north_america",
            display:"Western United States and Mexico",
            name:"WESTERN_USA",
            neighbors:{HAWAII:true, WESTERN_CANADA:true, EASTERN_USA:true, NORTHERN_SOUTH_AMERICA:true},
            points: 11
        });
    
        mapTiles.push({
            top:175, left:405, width:200, height:205,
            color:this.getColor(colorIndex++),
            continent:"north_america",
            display:"Easter United States and Caribbean",
            name:"EASTERN_USA",
            neighbors:{WESTERN_USA:true, EASTERN_CANADA:true, NORTHERN_SOUTH_AMERICA:true},
            points: 8
        });
    
        mapTiles.push({
            top:0, left:605, width:160, height:175,
            color:this.getColor(colorIndex++),
            continent:"north_america",
            display:"Greenland",
            name:"GREENLAND",
            neighbors:{EASTERN_CANADA:true, WESTERN_EUROPE:true},
            points: 3
        });
    
        mapTiles.push({
            top:380, left:375, width:300, height:180,
            color:this.getColor(colorIndex++),
            continent:"south_america",
            display:"Brazil, Peru and the Amazon Basin",
            name:"NORTHERN_SOUTH_AMERICA",
            neighbors:{WESTERN_USA:true, EASTERN_USA:true, SOUTHERN_SOUTH_AMERICA:true},
            points: 3
        });
    
        mapTiles.push({
            top:560, left:375, width:300, height:190,
            color:this.getColor(colorIndex++),
            continent:"south_america",
            display:"Argentina, Chile and the Southern Cone",
            name:"SOUTHERN_SOUTH_AMERICA",
            neighbors:{NORTHERN_SOUTH_AMERICA:true, WEST_ANTARCTICA:true},
            points: 4
        });
    
        mapTiles.push({
            top:750, left:255, width:630, height:120,
            color:this.getColor(colorIndex++),
            continent:"antarctica",
            display:"West Antarctica",
            name:"WEST_ANTARCTICA",
            neighbors:{SOUTHERN_SOUTH_AMERICA:true, EAST_ANTARCTICA:true},
            points: 2
        });
    
        mapTiles.push({
            top:750, left:885, width:630, height:120,
            color:this.getColor(colorIndex++),
            continent:"antarctica",
            display:"East Antarctica",
            name:"EAST_ANTARCTICA",
            neighbors:{WEST_ANTARCTICA:true, NEW_ZEALAND:true},
            points: 2
        });
    
        mapTiles.push({
            top:0, left:765, width:120, height:245,
            color:this.getColor(colorIndex++),
            continent:"europe",
            display:"Western Europe",
            name:"WESTERN_EUROPE",
            neighbors:{GREENLAND:true, EASTERN_EUROPE:true, WEST_AFRICA:true},
            points: 10
        });
    
        mapTiles.push({
            top:0, left:885, width:120, height:245,
            color:this.getColor(colorIndex++),
            continent:"europe",
            display:"Eastern Europe",
            name:"EASTERN_EUROPE",
            neighbors:{WESTERN_EUROPE:true, WEST_AFRICA:true, MIDDLE_EAST:true, CENTRAL_RUSSIA:true},
            points: 6
        });
    
        mapTiles.push({
            top:0, left:1005, width:220, height:245,
            color:this.getColor(colorIndex++),
            continent:"asia",
            display:"Central Russia",
            name:"CENTRAL_RUSSIA",
            neighbors:{EASTERN_EUROPE:true, MIDDLE_EAST:true, INDIA:true, EASTERN_CHINA:true, EASTERN_RUSSIA:true},
            points: 4
        });
    
        mapTiles.push({
            top:0, left:1225, width:485, height:175,
            color:this.getColor(colorIndex++),
            continent:"asia",
            display:"Eastern Russia",
            name:"EASTERN_RUSSIA",
            neighbors:{EASTERN_CHINA:true, CENTRAL_RUSSIA:true, WESTERN_CANADA:true},
            points: 3
        });
    
        mapTiles.push({
            top:245, left:715, width:220, height:255,
            color:this.getColor(colorIndex++),
            continent:"africa",
            display:"West and Central Africa",
            name:"WEST_AFRICA",
            neighbors:{WESTERN_EUROPE:true, EASTERN_EUROPE:true, MIDDLE_EAST:true, EAST_AFRICA:true, SOUTH_AFRICA:true},
            points: 3
        });
    
        mapTiles.push({
            top:245, left:935, width:180, height:135,
            color:this.getColor(colorIndex++),
            continent:"asia",
            display:"Middle East",
            name:"MIDDLE_EAST",
            neighbors:{EASTERN_EUROPE:true, CENTRAL_RUSSIA:true, INDIA:true, EAST_AFRICA: true, WEST_AFRICA:true },
            points: 4
        });
    
        mapTiles.push({
            top:380, left:935, width:180, height:120,
            color:this.getColor(colorIndex++),
            continent:"africa",
            display:"East Africa",
            name:"EAST_AFRICA",
            neighbors:{WEST_AFRICA:true, SOUTH_AFRICA:true, MIDDLE_EAST:true, INDIA:true},
            points: 3
        });
    
        mapTiles.push({
            top:500, left:715, width:400, height:130,
            color:this.getColor(colorIndex++),
            continent:"africa",
            display:"South Africa",
            name:"SOUTH_AFRICA",
            neighbors:{WEST_AFRICA:true, EAST_AFRICA:true},
            points: 5
        });
    
        mapTiles.push({
            top:245, left:1115, width:110, height:175,
            color:this.getColor(colorIndex++),
            continent:"asia",
            display:"India",
            name:"INDIA",
            neighbors:{EAST_AFRICA:true, MIDDLE_EAST:true, CENTRAL_RUSSIA:true, EASTERN_CHINA:true, SOUTHEAST_ASIA:true},
            points: 7
        });
    
        mapTiles.push({
            top:175, left:1225, width:290, height:155,
            color:this.getColor(colorIndex++),
            continent:"asia",
            display:"Eastern China",
            name:"EASTERN_CHINA",
            neighbors:{INDIA:true, CENTRAL_RUSSIA:true, EASTERN_RUSSIA:true, SOUTHEAST_ASIA:true},
            points: 10
        });
    
        mapTiles.push({
            top:330, left:1225, width:290, height:160,
            color:this.getColor(colorIndex++),
            continent:"asia",
            display:"Southeast Asia",
            name:"SOUTHEAST_ASIA",
            neighbors:{INDIA:true, EASTERN_CHINA:true, WESTERN_AUSTRALIA:true, EASTERN_AUSTRALIA:true, FIJI:true},
            points: 5
        });
    
        mapTiles.push({
            top:490, left:1305, width:110, height:200,
            color:this.getColor(colorIndex++),
            continent:"australia",
            display:"Western Australia",
            name:"WESTERN_AUSTRALIA",
            neighbors:{EASTERN_AUSTRALIA:true, SOUTHEAST_ASIA:true},
            points: 4
        });
    
        mapTiles.push({
            top:490, left:1415, width:100, height:200,
            color:this.getColor(colorIndex++),
            continent:"australia",
            display:"Eastern Australia",
            name:"EASTERN_AUSTRALIA",
            neighbors:{WESTERN_AUSTRALIA:true, SOUTHEAST_ASIA:true, FIJI:true, NEW_ZEALAND:true},
            points: 6
        });
    
        mapTiles.push({
            top:600, left:1515, width:195, height:200,
            color:this.getColor(colorIndex++),
            continent:"zealandia",
            display:"New Zealand",
            name:"NEW_ZEALAND",
            neighbors:{EASTERN_AUSTRALIA:true, FIJI:true, EAST_ANTARCTICA:true},
            points: 4
        });
    
        mapTiles.push({
            top:330, left:1515, width:195, height:270,
            color:this.getColor(colorIndex++),
            continent:"zealandia",
            display:"Fiji and the Solomon Islands",
            name:"FIJI",
            neighbors:{NEW_ZEALAND:true, EASTERN_AUSTRALIA:true, SOUTHEAST_ASIA:true, HAWAII:true},
            points: 2
        });

        for (let i = 0; i < mapTiles.length; i++) {
            let regionOwner = regionOwnersList ? regionOwnersList[i] : 255;
            let soldierCount = regionSoldiers ? regionSoldiers[i] : 0;
            mapTiles[i].teamId = regionOwner;
            mapTiles[i].team = this.getAvatarFromTeamId(regionOwner);
            mapTiles[i].soliders = soldierCount;
        }

        return { mapTiles, gapTiles };
    }

  render() {

    let gameId = this.props.gameId;
    let dataKeysByGame = this.props.game.dataKeysByGame;
    let dataKeys = dataKeysByGame.hasOwnProperty(gameId) ? dataKeysByGame[gameId] : null;
    let soldiersByRegionKey = null;
    let undeployedSoldiersKey = null;
    let pendingActionsKey = null;
    let turnAndPlayerInfoKey = null;
    if (dataKeys) {
        soldiersByRegionKey = dataKeys.soldiersByRegion;
        undeployedSoldiersKey = dataKeys.undeployedSoldiers;
        pendingActionsKey = dataKeys.pendingActions;
        turnAndPlayerInfoKey = dataKeys.turnAndPlayerInfo;
    }
    let initialized = false;
    let regionOwnersList = null;
    let regionSoldiers = null;

    let undeployedSoldiers = null;

    let actionCount = 0; 
    let actionList = [];
    
    let turnTeamId = null;
    let turnNum = null;
    let maxBlocksPerTurn = null;
    let playerCount = null;
    let playerAddresses = null;    
    if (
        this.props.WorldGame.initialized && 
        soldiersByRegionKey !== null && 
        undeployedSoldiersKey !== null && 
        pendingActionsKey !== null && 
        turnAndPlayerInfoKey !== null && 
        this.props.WorldGame.soldiersByRegion.hasOwnProperty(soldiersByRegionKey) && 
        this.props.WorldGame.undeployedSoldiers.hasOwnProperty(undeployedSoldiersKey) && 
        this.props.WorldGame.pendingActions.hasOwnProperty(pendingActionsKey) && 
        this.props.WorldGame.turnAndPlayerInfo.hasOwnProperty(turnAndPlayerInfoKey)
    ) {
        let soldiersByRegion = this.props.WorldGame.soldiersByRegion[soldiersByRegionKey].value;
        regionOwnersList = soldiersByRegion[0] || null;
        regionSoldiers = soldiersByRegion[1] || null;

        undeployedSoldiers = this.props.WorldGame.undeployedSoldiers[undeployedSoldiersKey].value;

        let pendingActions = this.props.WorldGame.pendingActions[pendingActionsKey].value;
        actionCount = pendingActions[0] || 0;
        let fromRegionList = pendingActions[1] || [];
        let toRegionList = pendingActions[2] || [];
        let moveSoldierCountList = pendingActions[3] || [];
        let submitBlockList = pendingActions[4] || [];
        actionCount = Math.min(
            actionCount, 
            fromRegionList.length, 
            toRegionList.length, 
            moveSoldierCountList.length, 
            submitBlockList.length
        );
        for (let i = 0; i < actionCount; i++) {
            actionList.push({
                fromRegion: fromRegionList[i], 
                toRegion: toRegionList[i], 
                soldierCount: moveSoldierCountList[i], 
                submitBlock: submitBlockList[i]
            });
        }

        let turnAndPlayerInfo = this.props.WorldGame.turnAndPlayerInfo[turnAndPlayerInfoKey].value;
        turnTeamId = turnAndPlayerInfo[0] || null;
        turnNum = turnAndPlayerInfo[1] || null;
        maxBlocksPerTurn = turnAndPlayerInfo[2] || null;
        playerCount = turnAndPlayerInfo[3] || null;
        playerAddresses = turnAndPlayerInfo[4] || null;
        if (playerAddresses !== null && playerCount !== null) {
            playerAddresses = playerAddresses.slice(0, playerCount);
        }

        initialized = true;
    }

    console.log("Blockchain data");
    console.log(regionOwnersList);
    console.log(regionSoldiers);
    console.log(undeployedSoldiers);
    console.log(actionCount);
    console.log(actionList);
    console.log(turnTeamId);
    console.log(turnNum);
    console.log(maxBlocksPerTurn);
    console.log(playerCount);
    console.log(playerAddresses);
    console.log(initialized);
    
    let yourTeam = this.props.game.yourTeam;
    let selectedTile = this.props.game.selectedTile;
    let hoverTile = this.props.game.hoverTile;

    let teamId = 0;
    let { mapTiles, gapTiles } = this.getTilesFromData(teamId, regionOwnersList, regionSoldiers);

    let selectedTeam = "";
    let selectedCenterPos = {left:0, top:0};
    let selectedNeighbors = {};
    for (let i = 0; i < mapTiles.length; i++) {
      let tile = mapTiles[i];
      let isSelected = (selectedTile === tile.name);

      if(isSelected) {
        selectedNeighbors = tile.neighbors;
        selectedTeam = tile.team;
        selectedCenterPos = {left:tile.left + Math.floor(tile.width/2), top:tile.top + Math.floor(tile.height/2)};
      }
    }

    let neighborCenterPosList = [];
    let renderedTiles = [];
    for(let i=0; i<mapTiles.length; i++) {
        let tile = mapTiles[i];

        let leftPos = Math.floor(Math.max(0, tile.width-70)/2);
        let topPos = Math.floor(Math.max(0, tile.height-90)/2)+5;

        let isSelected = (selectedTile === tile.name);
        let hasHover = (hoverTile === tile.name);

        let isNeighbor = false;
        if(selectedNeighbors.hasOwnProperty(tile.name)) {
          isNeighbor = true;
        }

        let isFriendly = false;
        if(selectedTeam === tile.team) {
          isFriendly = true;
        }

        let isYourTeam = false;
        if(yourTeam === tile.team) {
          isYourTeam = true;
        }

        if(isNeighbor) {
          if(selectedTile === "HAWAII" && tile.name === "FIJI") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:0, y2:selectedCenterPos.top+20});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:1710, y2:tile.top + Math.floor(tile.height/2)-20});
          }
          else if(selectedTile === "FIJI" && tile.name === "HAWAII") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:1710, y2:selectedCenterPos.top-20});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:0, y2:tile.top + Math.floor(tile.height/2)+20});
          }
          else if(selectedTile === "WESTERN_CANADA" && tile.name === "EASTERN_RUSSIA") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:0, y2:selectedCenterPos.top});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:1710, y2:tile.top + Math.floor(tile.height/2)});
          }
          else if(selectedTile === "EASTERN_RUSSIA" && tile.name === "WESTERN_CANADA") {
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
                onClick={isYourTeam ? this.selectTile : null} 
                id={tile.name} 
                key={tile.name} 
                style={{
                    cursor: (isYourTeam || isNeighbor ? "pointer" : ""), 
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
                {(hasHover && isYourTeam && !isSelected) ? 
                    <div style={{position:"absolute", zIndex:10, color:"#00cc00", background:"rgba(0,0,0,0.7)", textAlign:"center", width:90, padding:10, fontSize:24, top:(topPos+10), left:(leftPos-20)}}>SELECT</div> : 
                    null
                }
                {(isNeighbor && hasHover && isFriendly) ? 
                    <div style={{position:"absolute", zIndex:10, color:"#00cc00", background:"rgba(0,0,0,0.7)", textAlign:"center", width:90, padding:10, fontSize:24, top:(topPos+10), left:(leftPos-20)}}>MOVE</div> : 
                    null
                }
                {(isNeighbor && hasHover && !isFriendly) ? 
                    <div style={{position:"absolute", zIndex:10, color:"#ff0000", background:"rgba(0,0,0,0.7)", textAlign:"center", width:90, padding:10, fontSize:24, top:(topPos+10), left:(leftPos-20)}}>ATTACK</div> : 
                    null
                }
                {(isNeighbor && isFriendly) ? 
                    <img src={"/circle_lightblue.png"} alt="" style={{width:90, height:90, position:"absolute", top:(topPos-10), left:(leftPos-10)}}/> : 
                    null
                }
                {(isNeighbor && !isFriendly) ? 
                    <img src={"/circle_red2.png"} alt="" style={{width:90, height:90, position:"absolute", top:(topPos-10), left:(leftPos-10)}}/> : 
                    null
                }
                {isSelected ? 
                    <img src={"/circle_green.png"} alt="" style={{width:90, height:90, position:"absolute", top:(topPos-10), left:(leftPos-10)}}/> : 
                    null
                }
                {tile.team !== null && (
                    <div style={{width:70, height:90, textAlign:"center", position:"absolute", top:topPos, left:leftPos}}>
                        <img src={"/" + tile.team + ".png"} alt="" style={{maxWidth:70, maxHeight:70}}/>
                        <div>{tile.soliders}</div>
                    </div>
                )}
                {hasHover ? 
                    <div style={{position:"absolute", bottom:0, left:0, color:"#000"}}>
                        <span>+{tile.points} </span>
                        <img src="/soldier.png" alt="" style={{maxWidth:20, maxHeight:20, verticalAlign:"top"}} />
                        <span>/turn</span>
                    </div> : 
                    null
                }
            </div>
        );
    }

    let renderedGaps = [];
    for(let i=0; i<gapTiles.length; i++) {
        let tile = gapTiles[i];
        renderedGaps.push(<div key={i} style={{position:"absolute", top:tile.top, left:tile.left, width:tile.width, height:tile.height, background:"rgba(64, 196, 255, 0.3)"}}></div>);
    }

    let renderedArrows = [];
    for(let i=0; i<neighborCenterPosList.length; i++) {
        let neighborCenterPos = neighborCenterPosList[i];
        renderedArrows.push(<ArrowControl isFriendly={neighborCenterPos.isFriendly} shortenDest={neighborCenterPos.shortenDest} onClick={this.cancelTile} key={i} x1={neighborCenterPos.x1} y1={neighborCenterPos.y1} x2={neighborCenterPos.x2} y2={neighborCenterPos.y2} />);
    }

    return (
        <div>
            {gameId}
            <div style={{background:"url('/world_blank.png') no-repeat -65px -35px", width:1710, height:870, position:"relative"}} >
                {renderedTiles}
                {renderedGaps}   
                {renderedArrows}               
            </div>
        </div>
    )
  }
}

Game.contextTypes = {
  drizzle: PropTypes.object
}

export default Game
