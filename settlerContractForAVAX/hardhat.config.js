require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-abi-exporter');
require('dotenv').config();

let dotenv = require('dotenv')
dotenv.config({ path: "./.env" }) 

const { ProxyAgent, setGlobalDispatcher} = require("undici")

const proxyAgent = new ProxyAgent("http://127.0.0.1:7890")
setGlobalDispatcher(proxyAgent)

/** @type import('hardhat/config').HardhatUserConfig */

const SnowtraceAPIKey = process.env.SNOWTRACE_API_KEY

const privateKey = process.env.PRIVATEKEY
module.exports = {
  solidity: "0.8.17",

networks: {
    avalanche: {
      url: process.env.AVALANCHE_RPC_URL,
      accounts: [privateKey], 
      chainId: 43114,
    },

    avalancheFujiTestnet: {
      url: process.env.AVALANCHE_FUJI_RPC_URL,
      accounts: [privateKey],
      chainId: 43113,
      },
  
  },

  
  localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      // See its defaults
    },

  abiExporter: {
    path: './deployments/abi',
    clear: true,
    flat: true,
    only: [],
    spacing: 2,
    pretty: true,
},


etherscan: {
  apiKey: {
    avalanche: SnowtraceAPIKey,
    avalancheFujiTestnet: SnowtraceAPIKey,
  }

},


};
