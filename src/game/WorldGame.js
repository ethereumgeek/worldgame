import React, { Component } from 'react'
import { selectTile, hoverTile, checkWeb3 } from './gameActions'
import ArrowControl from './ArrowControl';
import PropTypes from 'prop-types';

class WorldGame extends Component {
    constructor(props, context) {
        super(props)

        // This binding is necessary to make `this` work in the callback
        this.selectTile = this.selectTile.bind(this);
        this.cancelTile = this.cancelTile.bind(this);
        this.hoverTile = this.hoverTile.bind(this);
        this.cancelHover = this.cancelHover.bind(this);
    }

    selectTile(event) {
      event.preventDefault();
      let id = event.currentTarget.id;
      this.props.dispatch(selectTile(id));

      //TODO: delete this
      this.props.dispatch(checkWeb3(this.context.drizzle));
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

  render() {

    let yourTeam = this.props.game.yourTeam;
    let selectedTile = this.props.game.selectedTile;
    let hoverTile = this.props.game.hoverTile;

    let colorIndex = 0;
    let mapTiles = [];
    let gapTiles = [];

    gapTiles.push({top:220, left:70, width:200, height:90});
    gapTiles.push({top: 430, left: 70, width: 370, height: 350});
    gapTiles.push({top: 410, left: 270, width: 170, height: 20});
    gapTiles.push({top: 780, left: 70, width: 250, height: 130});
    gapTiles.push({top: 220, left: 670, width: 160, height: 60});
    gapTiles.push({top: 280, left: 670, width: 110, height: 130});
    gapTiles.push({top: 410, left: 740, width: 40, height: 250});
    gapTiles.push({top: 660, left: 740, width: 630, height: 120});
    gapTiles.push({top: 720, left: 1370, width: 210, height: 60});
    gapTiles.push({top: 520, left: 1180, width: 190, height: 140});
    gapTiles.push({top: 450, left: 1180, width: 110, height: 70});
    gapTiles.push({top: 830, left: 1580, width: 195, height: 80});
    gapTiles.push({top: 210, left: 1580, width: 195, height: 150});

    mapTiles.push({
        top:310, left:70, width:200, height:120,
        color:this.getColor(colorIndex++),
        continent:"north_america",
        name:"Hawaii",
        id:"hawaii",
        neighbors:{western_usa:true, fiji:true},
        points: 3,
        team: "eagle",
        soliders: 1
    });

    mapTiles.push({
        top:30, left:70, width:400, height:190,
        color:this.getColor(colorIndex++),
        continent:"north_america",
        name:"Western Canada and Alaska",
        id:"western_canada",
        neighbors:{western_usa:true, eastern_canada:true, eastern_russia:true},
        points: 6,
        team: "moose",
        soliders: 1
    });

    mapTiles.push({
        top:30, left:470, width:200, height:190,
        color:this.getColor(colorIndex++),
        continent:"north_america",
        name:"Eastern Canada",
        id:"eastern_canada",
        neighbors:{western_canada:true, greenland:true, eastern_usa:true},
        points: 5,
        team: "moose",
        soliders: 1
    });
    
    mapTiles.push({
        top:220, left:270, width:200, height:190,
        color:this.getColor(colorIndex++),
        continent:"north_america",
        name:"Western United States and Mexico",
        id:"western_usa",
        neighbors:{hawaii:true, western_canada:true, eastern_usa:true, northern_south_america:true},
        points: 11,
        team: "eagle",
        soliders: 1
    });

    mapTiles.push({
        top:220, left:470, width:200, height:190,
        color:this.getColor(colorIndex++),
        continent:"north_america",
        name:"Easter United States and Caribbean",
        id:"eastern_usa",
        neighbors:{western_usa:true, eastern_canada:true, northern_south_america:true},
        points: 8,
        team: "eagle",
        soliders: 1
    });

    mapTiles.push({
        top:30, left:670, width:160, height:190,
        color:this.getColor(colorIndex++),
        continent:"north_america",
        name:"Greenland",
        id:"greenland",
        neighbors:{eastern_canada:true, western_europe:true},
        points: 3,
        team: "bird",
        soliders: 1
    });

    mapTiles.push({
        top:410, left:440, width:300, height:180,
        color:this.getColor(colorIndex++),
        continent:"south_america",
        name:"Brazil, Peru and the Amazon Basin",
        id:"northern_south_america",
        neighbors:{western_usa:true, eastern_usa:true, southern_south_america:true},
        points: 3,
        team: "goat",
        soliders: 1
    });

    mapTiles.push({
        top:590, left:440, width:300, height:190,
        color:this.getColor(colorIndex++),
        continent:"south_america",
        name:"Argentina, Chile and the Southern Cone",
        id:"southern_south_america",
        neighbors:{northern_south_america:true, west_antarctica:true},
        points: 4,
        team: "goat",
        soliders: 1
    });

    mapTiles.push({
        top:780, left:320, width:630, height:130,
        color:this.getColor(colorIndex++),
        continent:"antarctica",
        name:"West Antarctica",
        id:"west_antarctica",
        neighbors:{southern_south_america:true, east_antarctica:true},
        points: 2,
        team: "penguin",
        soliders: 1
    });

    mapTiles.push({
        top:780, left:950, width:630, height:130,
        color:this.getColor(colorIndex++),
        continent:"antarctica",
        name:"East Antarctica",
        id:"east_antarctica",
        neighbors:{west_antarctica:true, new_zealand:true},
        points: 2,
        team: "penguin",
        soliders: 1
    });

    mapTiles.push({
        top:30, left:830, width:120, height:250,
        color:this.getColor(colorIndex++),
        continent:"europe",
        name:"Western Europe",
        id:"western_europe",
        neighbors:{greenland:true, eastern_europe:true, west_africa:true},
        points: 10,
        team: "squirrel",
        soliders: 1
    });

    mapTiles.push({
        top:30, left:950, width:120, height:250,
        color:this.getColor(colorIndex++),
        continent:"europe",
        name:"Eastern Europe",
        id:"eastern_europe",
        neighbors:{western_europe:true, west_africa:true, middle_east:true, central_russia:true},
        points: 6,
        team: "grizzly",
        soliders: 1
    });

    mapTiles.push({
        top:30, left:1070, width:220, height:250,
        color:this.getColor(colorIndex++),
        continent:"asia",
        name:"Central Russia",
        id:"central_russia",
        neighbors:{eastern_europe:true, middle_east:true, india:true, eastern_china:true, eastern_russia:true},
        points: 4,
        team: "grizzly",
        soliders: 1
    });

    mapTiles.push({
        top:30, left:1290, width:485, height:180,
        color:this.getColor(colorIndex++),
        continent:"asia",
        name:"Eastern Russia",
        id:"eastern_russia",
        neighbors:{eastern_china:true, central_russia:true, western_canada:true},
        points: 3,
        team: "grizzly",
        soliders: 1
    });

    mapTiles.push({
        top:280, left:780, width:220, height:250,
        color:this.getColor(colorIndex++),
        continent:"africa",
        name:"West and Central Africa",
        id:"west_africa",
        neighbors:{western_europe:true, eastern_europe:true, middle_east:true, east_africa:true, south_africa:true},
        points: 3,
        team: "elephant",
        soliders: 1
    });

    mapTiles.push({
        top:280, left:1000, width:180, height:130,
        color:this.getColor(colorIndex++),
        continent:"asia",
        name:"Middle East",
        id:"middle_east",
        neighbors:{eastern_europe:true, central_russia:true, india:true, east_africa: true, west_africa:true },
        points: 4,
        team: "elephant",
        soliders: 1
    });

    mapTiles.push({
        top:410, left:1000, width:180, height:120,
        color:this.getColor(colorIndex++),
        continent:"africa",
        name:"East Africa",
        id:"east_africa",
        neighbors:{west_africa:true, south_africa:true, middle_east:true, india:true},
        points: 3,
        team: "zebra",
        soliders: 1
    });

    mapTiles.push({
        top:530, left:780, width:400, height:130,
        color:this.getColor(colorIndex++),
        continent:"africa",
        name:"South Africa",
        id:"south_africa",
        neighbors:{west_africa:true, east_africa:true},
        points: 5,
        team: "lion",
        soliders: 1
    });

    mapTiles.push({
        top:280, left:1180, width:110, height:170,
        color:this.getColor(colorIndex++),
        continent:"asia",
        name:"India",
        id:"india",
        neighbors:{east_africa:true, middle_east:true, central_russia:true, eastern_china:true, southeast_asia:true},
        points: 7,
        team: "elephant",
        soliders: 1
    });

    mapTiles.push({
        top:210, left:1290, width:290, height:150,
        color:this.getColor(colorIndex++),
        continent:"asia",
        name:"Eastern China",
        id:"eastern_china",
        neighbors:{india:true, central_russia:true, eastern_russia:true, southeast_asia:true},
        points: 10,
        team: "panda",
        soliders: 1
    });

    mapTiles.push({
        top:360, left:1290, width:290, height:160,
        color:this.getColor(colorIndex++),
        continent:"asia",
        name:"Southeast Asia",
        id:"southeast_asia",
        neighbors:{india:true, eastern_china:true, western_australia:true, eastern_australia:true, fiji:true},
        points: 5,
        team: "monkey",
        soliders: 1
    });

    mapTiles.push({
        top:520, left:1370, width:110, height:200,
        color:this.getColor(colorIndex++),
        continent:"australia",
        name:"Western Australia",
        id:"western_australia",
        neighbors:{eastern_australia:true, southeast_asia:true},
        points: 4,
        team: "kangaroo",
        soliders: 1
    });

    mapTiles.push({
        top:520, left:1480, width:100, height:200,
        color:this.getColor(colorIndex++),
        continent:"australia",
        name:"Eastern Australia",
        id:"eastern_australia",
        neighbors:{western_australia:true, southeast_asia:true, fiji:true, new_zealand:true},
        points: 6,
        team: "kangaroo",
        soliders: 1
    });

    mapTiles.push({
        top:630, left:1580, width:195, height:200,
        color:this.getColor(colorIndex++),
        continent:"zealandia",
        name:"New Zealand",
        id:"new_zealand",
        neighbors:{eastern_australia:true, fiji:true, east_antarctica:true},
        points: 4,
        team: "unicorn",
        soliders: 1
    });

    mapTiles.push({
        top:360, left:1580, width:195, height:270,
        color:this.getColor(colorIndex++),
        continent:"zealandia",
        name:"Fiji and the Solomon Islands",
        id:"fiji",
        neighbors:{new_zealand:true, eastern_australia:true, southeast_asia:true, hawaii:true},
        points: 2,
        team: "unicorn",
        soliders: 1
    });

    let selectedTeam = "";
    let selectedCenterPos = {left:0, top:0};
    let selectedNeighbors = {};
    for(let i=0; i<mapTiles.length; i++) {
      let tile = mapTiles[i];
      let isSelected = (selectedTile === tile.id);

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

        let isSelected = (selectedTile === tile.id);
        let hasHover = (hoverTile === tile.id);

        let isNeighbor = false;
        if(selectedNeighbors.hasOwnProperty(tile.id)) {
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
          if(selectedTile === "hawaii" && tile.id === "fiji") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:70, y2:selectedCenterPos.top+20});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:1775, y2:tile.top + Math.floor(tile.height/2)-20});
          }
          else if(selectedTile === "fiji" && tile.id === "hawaii") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:1775, y2:selectedCenterPos.top-20});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:70, y2:tile.top + Math.floor(tile.height/2)+20});
          }
          else if(selectedTile === "western_canada" && tile.id === "eastern_russia") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:70, y2:selectedCenterPos.top});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:1775, y2:tile.top + Math.floor(tile.height/2)});
          }
          else if(selectedTile === "eastern_russia" && tile.id === "western_canada") {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:1775, y2:selectedCenterPos.top});
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:false, x1:tile.left + Math.floor(tile.width/2), y1:tile.top + Math.floor(tile.height/2), x2:70, y2:tile.top + Math.floor(tile.height/2)});
          }
          else {
            neighborCenterPosList.push({isFriendly:isFriendly, shortenDest:true, x1:selectedCenterPos.left, y1:selectedCenterPos.top, x2:tile.left + Math.floor(tile.width/2), y2:tile.top + Math.floor(tile.height/2)});
          }
        }

        renderedTiles.push(<div onMouseEnter={this.hoverTile} onMouseLeave={this.cancelHover} onClick={isYourTeam ? this.selectTile : null} id={tile.id} key={tile.id} style={{cursor:(isYourTeam || isNeighbor ? "pointer" : ""), position:"absolute", textAlign:"center", top:tile.top, left:tile.left, width:tile.width, height:tile.height, background:tile.color}}>{tile.name}{(hasHover && isYourTeam && !isSelected) ? <div style={{position:"absolute", zIndex:10, color:"#00cc00", background:"rgba(0,0,0,0.7)", textAlign:"center", width:90, padding:10, fontSize:24, top:(topPos+10), left:(leftPos-20)}}>SELECT</div> : null}{(isNeighbor && hasHover && isFriendly) ? <div style={{position:"absolute", zIndex:10, color:"#00cc00", background:"rgba(0,0,0,0.7)", textAlign:"center", width:90, padding:10, fontSize:24, top:(topPos+10), left:(leftPos-20)}}>MOVE</div> : null}{(isNeighbor && hasHover && !isFriendly) ? <div style={{position:"absolute", zIndex:10, color:"#ff0000", background:"rgba(0,0,0,0.7)", textAlign:"center", width:90, padding:10, fontSize:24, top:(topPos+10), left:(leftPos-20)}}>ATTACK</div> : null}{(isNeighbor && isFriendly) ? <img src={"/circle_lightblue.png"} alt="" style={{width:90, height:90, position:"absolute", top:(topPos-10), left:(leftPos-10)}}/> : null}{(isNeighbor && !isFriendly) ? <img src={"/circle_red2.png"} alt="" style={{width:90, height:90, position:"absolute", top:(topPos-10), left:(leftPos-10)}}/> : null}{isSelected ? <img src={"/circle_green.png"} alt="" style={{width:90, height:90, position:"absolute", top:(topPos-10), left:(leftPos-10)}}/> : null}<div style={{width:70, height:90, textAlign:"center", position:"absolute", top:topPos, left:leftPos}}><img src={"/" + tile.team + ".png"} alt="" style={{maxWidth:70, maxHeight:70}}/><div>{tile.soliders}</div></div>{hasHover ? <div style={{position:"absolute", bottom:0, left:0, color:"#000"}}><span>+{tile.points} </span><img src="/soldier.png" alt="" style={{maxWidth:20, maxHeight:20, verticalAlign:"top"}} /><span>/turn</span></div> : null}</div>);
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
        <div style={{background:"url('/world_blank.png')", width:1879, height:953, position:"relative"}} >
            {renderedTiles}
            {renderedGaps}   
            {renderedArrows}               
        </div>
    )
  }
}

WorldGame.contextTypes = {
  drizzle: PropTypes.object
}

export default WorldGame
