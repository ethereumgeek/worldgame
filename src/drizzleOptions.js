import ComplexStorage from './../build/contracts/ComplexStorage.json'
import SimpleStorage from './../build/contracts/SimpleStorage.json'
import TutorialToken from './../build/contracts/TutorialToken.json'
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
    ComplexStorage,
    SimpleStorage,
    TutorialToken,
    WorldGame
  ],
  events: {
    SimpleStorage: ['StorageSet'],
    WorldGame: ['NewGame', 'NextTurn', 'Winner']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions