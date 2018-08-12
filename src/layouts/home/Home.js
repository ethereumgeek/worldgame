import React, { Component } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import logo from '../../logo.png'

class Home extends Component {
    render() {

        const NORTH_AMERICA = 0;
        const SOUTH_AMERICA = 1;
        const EUROPE = 2;
        const ASIA = 3;
        const AFRICA = 4;
        const AUSTRALIA = 5;
        const ZEALANDIA = 6;
        const ANTARCTICA = 7;

        let continents = [];

        return (
        <main className="container">
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

            <div className="pure-u-1-1">
                <h2>World Game</h2>
                <p>Testing world game example.</p>
                <div style={{background:"url('/world_blank.png')", width:1879, height:953, position:"relative"}} >

                    <div style={{position:"absolute", top:220, left:70, width:200, height:190, background:"rgba(255, 0, 64, 0.2)"}}></div>

                    <div style={{position:"absolute", top:30, left:200, width:270, height:190, background:"rgba(255, 0, 128, 0.2)"}}></div>
                    <div style={{position:"absolute", top:30, left:470, width:200, height:190, background:"rgba(255, 128, 0, 0.2)"}}></div>
                    <div style={{position:"absolute", top:220, left:270, width:200, height:190, background:"rgba(255, 0, 0, 0.2)"}}></div>
                    <div style={{position:"absolute", top:220, left:470, width:200, height:190, background:"rgba(255, 64, 64, 0.2)"}}></div>
                    <div style={{position:"absolute", top:30, left:670, width:160, height:190, background:"rgba(255, 196, 64, 0.2)"}}></div>

                    <div style={{position:"absolute", top:410, left:440, width:300, height:180, background:"rgba(128, 255, 0, 0.2)"}}></div>
                    <div style={{position:"absolute", top:590, left:440, width:300, height:190, background:"rgba(0, 255, 128, 0.2)"}}></div>

                    <div style={{position:"absolute", top:780, left:320, width:630, height:130, background:"rgba(128, 128, 64, 0.2)"}}></div>
                    <div style={{position:"absolute", top:780, left:950, width:630, height:130, background:"rgba(64, 64, 128, 0.2)"}}></div>

                    <div style={{position:"absolute", top:30, left:830, width:150, height:250, background:"rgba(128, 0, 128, 0.2)"}}></div>
                    <div style={{position:"absolute", top:30, left:980, width:200, height:250, background:"rgba(128, 128, 0, 0.2)"}}></div>
                    <div style={{position:"absolute", top:30, left:1180, width:200, height:180, background:"rgba(128, 128, 64, 0.2)"}}></div>
                    <div style={{position:"absolute", top:30, left:1380, width:200, height:180, background:"rgba(128, 128, 128, 0.2)"}}></div>

                    <div style={{position:"absolute", top:280, left:780, width:200, height:200, background:"rgba(255, 0, 128, 0.2)"}}></div>
                    <div style={{position:"absolute", top:280, left:980, width:200, height:200, background:"rgba(255, 128, 0, 0.2)"}}></div>
                    <div style={{position:"absolute", top:210, left:1180, width:140, height:270, background:"rgba(255, 128, 64, 0.2)"}}></div>
                    <div style={{position:"absolute", top:210, left:1320, width:260, height:150, background:"rgba(255, 128, 128, 0.2)"}}></div>

                    <div style={{position:"absolute", top:360, left:1320, width:260, height:160, background:"rgba(0, 128, 196, 0.2)"}}></div>
                    <div style={{position:"absolute", top:520, left:1370, width:110, height:200, background:"rgba(0, 255, 196, 0.2)"}}></div>
                    <div style={{position:"absolute", top:520, left:1480, width:100, height:200, background:"rgba(0, 196, 255, 0.2)"}}></div>
                    <div style={{position:"absolute", top:630, left:1580, width:180, height:200, background:"rgba(255, 196, 255, 0.2)"}}></div>
                    <div style={{position:"absolute", top:430, left:1580, width:180, height:200, background:"rgba(255, 255, 0, 0.2)"}}></div>

                    <div style={{position:"absolute", top:480, left:780, width:200, height:200, background:"rgba(255, 0, 0, 0.2)"}}></div>
                    <div style={{position:"absolute", top:480, left:980, width:200, height:200, background:"rgba(255, 64, 64, 0.2)"}}></div>

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
                </div>
                <br/><br/>
            </div>

            </div>
        </main>
        )
    }
}

export default Home
