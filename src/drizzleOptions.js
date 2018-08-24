import WorldGame from './../build/contracts/WorldGame.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    WorldGame
  ],
  events: {
    WorldGame: ['NewGame', 'NextTurn', 'Winner']
  },
  syncAlways: true,
  polls: {
    accounts: 1500,
    blocks: 3000
  }
}

export default drizzleOptions