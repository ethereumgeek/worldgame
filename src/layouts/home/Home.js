import React, { Component } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import logo from '../../logo.png'

class Home extends Component {

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

        /*
        const NORTH_AMERICA = 0;
        const SOUTH_AMERICA = 1;
        const EUROPE = 2;
        const ASIA = 3;
        const AFRICA = 4;
        const AUSTRALIA = 5;
        const ZEALANDIA = 6;
        const ANTARCTICA = 7;
        */

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
            owner: "eagle",
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
            owner: "moose",
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
            owner: "moose",
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
            owner: "eagle",
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
            owner: "eagle",
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
            owner: "bird",
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
            owner: "goat",
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
            owner: "goat",
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
            owner: "penguin",
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
            owner: "penguin",
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
            owner: "squirrel",
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
            owner: "grizzly",
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
            owner: "grizzly",
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
            owner: "grizzly",
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
            owner: "elephant",
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
            owner: "elephant",
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
            owner: "zebra",
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
            owner: "lion",
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
            owner: "elephant",
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
            owner: "panda",
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
            owner: "monkey",
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
            owner: "kangaroo",
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
            owner: "kangaroo",
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
            owner: "unicorn",
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
            owner: "unicorn",
            soliders: 1
        });

        let renderedTiles = [];
        for(let i=0; i<mapTiles.length; i++) {
            let tile = mapTiles[i];

            let leftPos = Math.floor(Math.max(0, tile.width-70)/2);
            let topPos = Math.floor(Math.max(0, tile.height-90)/2)+5;            
            renderedTiles.push(<div id={tile.id} style={{position:"absolute", textAlign:"center", top:tile.top, left:tile.left, width:tile.width, height:tile.height, background:tile.color}}>{tile.name}<div style={{width:70, height:90, textAlign:"center", position:"absolute", top:topPos, left:leftPos}}><img src={"/" + tile.owner + ".png"} alt="" style={{maxWidth:70, maxHeight:70}}/><div>{tile.soliders}</div></div><div style={{position:"absolute", bottom:0, left:0, color:"#000"}}><span>+{tile.points} </span><img src="/soldier.png" alt="" style={{maxWidth:20, maxHeight:20, verticalAlign:"top"}} /><span>/turn</span></div></div>);
        }

        let renderedGaps = [];
        for(let i=0; i<gapTiles.length; i++) {
            let tile = gapTiles[i];
            renderedGaps.push(<div style={{position:"absolute", top:tile.top, left:tile.left, width:tile.width, height:tile.height, background:"rgba(64, 196, 255, 0.3)"}}></div>);
        }

        /*
            <img style={{position:"absolute", top:510, left:940, maxWidth:100, maxHeight:100}} alt="Elephant" src="/elephant.png" />
            <img style={{position:"absolute", top:670, left:1600, maxWidth:100, maxHeight:100}} alt="Unicorn" src="/unicorn.png" />
            <img style={{position:"absolute", top:90, left:1230, maxWidth:100, maxHeight:100}} alt="Grizzly" src="/grizzly.png" />
            <img style={{position:"absolute", top:210, left:400, maxWidth:100, maxHeight:100}} alt="Eagle" src="/eagle.png" />
            <img style={{position:"absolute", top:110, left:450, maxWidth:100, maxHeight:100}} alt="Moose" src="/moose.png" />
            <img style={{position:"absolute", top:800, left:900, maxWidth:100, maxHeight:100}} alt="Penguin" src="/penguin.png" />
            <img style={{position:"absolute", top:330, left:940, maxWidth:100, maxHeight:100}} alt="Zebra" src="/zebra.png" />
            <img style={{position:"absolute", top:230, left:1300, maxWidth:100, maxHeight:100}} alt="Panda" src="/panda.png" />
            <img style={{position:"absolute", top:500, left:560, maxWidth:100, maxHeight:100}} alt="Goat" src="/goat.png" />
            <img style={{position:"absolute", top:550, left:1450, maxWidth:100, maxHeight:100}} alt="Kangaroo" src="/kangaroo.png" />
            <img style={{position:"absolute", top:150, left:900, maxWidth:100, maxHeight:100}} alt="Squirrel" src="/squirrel.png" />
            <img style={{position:"absolute", top:50, left:700, maxWidth:100, maxHeight:100}} alt="Bird" src="/bird.png" /> 
        */

        return (
        <main>
            <div style={{background:"url('/world_blank.png')", width:1879, height:953, position:"relative"}} >
                {renderedTiles}
                {renderedGaps}                   
            </div>
            <br/><br/>

            <div className="container">

                <div className="pure-g">
                <div className="pure-u-1-1 header">
                    <img src={logo} alt="drizzle-logo" />
                    <h1>Drizzle Examples</h1>
                    <p>Examples of how to get started with Drizzle in various situations.</p>

                    <br/><br/>
                </div>

                <div className="pure-u-1-1">
                    <h2>Active Account</h2>
                    <AccountData accountIndex="0" units="ether" precision="3" />

                    <br/><br/>
                </div>

                <div className="pure-u-1-1">
                    <h2>SimpleStorage</h2>
                    <p>This shows a simple ContractData component with no arguments, along with a form to set its value.</p>
                    <p><strong>Stored Value</strong>: <ContractData contract="SimpleStorage" method="storedData" /></p>
                    <ContractForm contract="SimpleStorage" method="set" />

                    <br/><br/>
                </div>

                <div className="pure-u-1-1">
                    <h2>TutorialToken</h2>
                    <p>Here we have a form with custom, friendly labels. Also note the token symbol will not display a loading indicator. We've suppressed it with the <code>hideIndicator</code> prop because we know this variable is constant.</p>
                    <p><strong>Total Supply</strong>: <ContractData contract="TutorialToken" method="totalSupply" methodArgs={[{from: this.props.accounts[0]}]} /> <ContractData contract="TutorialToken" method="symbol" hideIndicator /></p>
                    <p><strong>My Balance</strong>: <ContractData contract="TutorialToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} /></p>
                    <h3>Send Tokens</h3>
                    <ContractForm contract="TutorialToken" method="transfer" labels={['To Address', 'Amount to Send']} />

                    <br/><br/>
                </div>

                <div className="pure-u-1-1">
                    <h2>ComplexStorage</h2>
                    <p>Finally this contract shows data types with additional considerations. Note in the code the strings below are converted from bytes to UTF-8 strings and the device data struct is iterated as a list.</p>
                    <p><strong>String 1</strong>: <ContractData contract="ComplexStorage" method="string1" toUtf8 /></p>
                    <p><strong>String 2</strong>: <ContractData contract="ComplexStorage" method="string2" toUtf8 /></p>
                    <strong>Single Device Data</strong>: <ContractData contract="ComplexStorage" method="singleDD" />

                    <br/><br/>
                </div>

                </div>
            </div>
        </main>
        )
    }
}

export default Home
