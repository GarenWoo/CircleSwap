<script>
import { ethers } from 'ethers';
import express from 'express';

export default {

  name: 'erc20',

  data() {
    return {
      account: null,
      tokenBalance: null,
      coinBalance: null,
      coinSymbol: null,
      AmountInForSwap: null,
      chainName: null,
      coinPrice: null,
      name: null,
      decimal: null,
      symbol: null,
      supply: null,
      SourceChainIdInHexa: null,
      TargetChainIdInHexa: null,
      slippage: '0.5',
      slippageChecker: null,
      amountInChecker: null,
      AddressInputChecker: null,
      swapToMeBool: true,
      destinationAddrInput: null,
      swapEstimateOut: null,
      errorMessage: null,
      TxHash: null,
      initializationSteps: 0,
      txURL: null,

      tips: null,
      buttonText: "Connect",
      connectedBool: false,
      executeErrorMessage: null,
      inProcessBool: false,
      myAnotherAddrInputBool: false,
      othersAddrInputBool: false,
      
      // This following global variables are declared but unnecessary to be returned:

      // scanApiKey: null,
      // TargetChainScanApiKey: null,
      // scanApiURL: null,
      // scanURL: null,
      // scanURLTargetChain: null,
      // USDCProxyAddress: null,
      // USDCAddress: null,
      // RouterAddress: null,
      // WrappedCoinAddress: null,
      // TokenMessengerAddr: null,
      // MessageTransmitterAddr: null,
      // settlerAddress: null,
      // routerContract: null,
      // erc20Token: null,
      // TokenMessagerContract: null,
      // MessageTransmitterContract: null,
      // coinUSDCPair: null,
      // TargetChainScanApiURL: null,
      // blockEventHandler:null,
      // this.switchForCrossChainSwapBool: false,
      // TargetChainDomain: null,
      // isIntraSwap: false,
      // destinationAddrIntra: null,
      // destinationAddrCrosschain: null,
      // targetNodeRPCURL: null,
    }
  },

  async created() {
  },

  computed: {
    // The following function is to judge if all variables have got their value before Crosschain-Swap is open to use.
    unconnectedDisabled() {
      return !this.connectedBool;
    },

    connectButtonDisabled() {
      return (this.initializationSteps != 0 && this.initializationSteps < 5) || this.inProcessBool;
    },

    showTxButton() {
      return this.TxHash != null;
    },

    showUSDCSymbol() {
      return this.swapEstimateOut != null && this.swapEstimateOut != 0 && this.AmountInForSwap > 0;
    },

    addrInputShow() {
      return !this.swapToMeBool;
    }

  },

    


  methods: {

    // ---------------------------------------------------- Connect & Disconnect ---------------------------------------------------- 

    async connect() {
      // Situation 1: When connectedBool is false:     
      if (this.connectedBool == false) {
        // Clear the errorMessage shown on the front page if the connection of this time is not the first one.
        this.errorMessage = null;
        this.slippageChecker = null;
        this.AddressInputChecker = null;
        // Start to listen the change of the network or the account on EVM-compatible chain
        window.ethereum.on('chainChanged', this.providerChangeListener);
        window.ethereum.on('accountsChanged', this.accountChangeListener);

        // Initialize the network provider and the wallet account.
        await this.initProvider();
        await this.initAccount();

        // Shortly afterwards, the token's contract will be initialized and read. 
        // Get the information of contracts. And then connectedBool will be set to true.
        if (this.account) {
          await this.initContract();
          await this.readContract();
          this.listenTxOfAccount();
          this.connectedBool = true;
        } else {
          this.errorMessage = "Cannot get the account's infomation. Please refresh the page and connect again.";
          console.log(this.errorMessage);
        }
      } else {
        // Situation 2: when connectedBool is true:
        // Disconnect the current wallet and all variable will be reset to the original value.
        Object.assign(this.$data, {
          account: null,
          tokenBalance: null,
          coinBalance: null,
          coinSymbol: null,
          AmountInForSwap: null,
          chainName: null,
          coinPrice: null,
          name: null,
          decimal: null,
          symbol: null,
          supply: null,
          SourceChainIdInHexa: null,
          TargetChainIdInHexa: null,
          slippage: '0.5',
          slippageChecker: null,
          amountInChecker: null,
          AddressInputChecker: null,
          swapToMeBool: true,
          destinationAddrInput: null,
          swapEstimateOut: null,
          errorMessage: null,
          TxHash: null,
          initializationSteps: 0,
          txURL: null,
          executeErrorMessage: null,
          inProcessBool: false,
          myAnotherAddrInputBool: false,
          othersAddrInputBool: false,
        });
        // the following variables are not declared in the data() field , so assign the original value to them respectively
        this.scanApiKey = null;
        this.TargetChainScanApiKey = null;
        this.scanApiURL = null;
        this.scanURL = null;
        this.scanURLTargetChain = null;
        this.USDCProxyAddress = null;
        this.USDCAddress = null;
        this.RouterAddress = null;
        this.WrappedCoinAddress = null;
        this.erc20Token = null;
        this.TokenMessagerContract = null;
        this.MessageTransmitterContract = null;
        this.settlerAddress = null;
        this.routerContract = null;
        this.coinUSDCPair = null;
        this.TargetChainScanApiURL = null;
        this.TokenMessengerAddr = null;
        this.MessageTransmitterAddr = null;
        this.blockEventHandler = null;
        this.switchForCrossChainSwapBool = false;
        this.TargetChainDomain = null;
        this.isIntraSwap = false;
        this.destinationAddrIntra = null;
        this.destinationAddrCrosschain = null;
        this.targetNodeRPCURL = null;
        // After clicking the disconnect button, all listeners should be stopped.
        this.stopListeningToBlocks();
        window.ethereum.off('accountsChanged', this.accountChangeListener);
        window.ethereum.off('chainChanged', this.providerChangeListener);

        this.connectedBool = false;
      }

      if (this.connectedBool) {
        this.buttonText = "Connected";
        await this.connectionChecker();
      } else {
        this.buttonText = "Disconnected";
        this.tips = "Wallet disconnected. Click to Reconnect";
        this.initializationSteps = 0;
      }

    },


    // ---------------------------------------------------- Networks ---------------------------------------------------- 

    getNetworkInfo() {
      switch (this.chainId) {
            // mainnet
            case 1:
            this.chainName = 'Ethereum Mainnet';
            this.scanApiKey = process.env.ETHERSCAN_API_KEY;
            this.USDCProxyAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
            this.USDCAddress = '0xa2327a938Febf5FEC13baCFb16Ae10EcBc4cbDCF';
            this.RouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
            this.WrappedCoinAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
            this.TokenMessengerAddr = '0xbd3fa81b58ba92a82136038b25adec7066af3155',
            this.MessageTransmitterAddr = '0x0a992d191deec32afe36203ad87d7d289a738f81',
            this.scanApiURL = 'https://api.etherscan.io/api';
            this.scanURL = 'https://etherscan.io/';
              break;
            case 43114:
            this.chainName = 'Avalanche C-Chain';
            this.scanApiKey = process.env.SNOWTRACE_API_KEY;
            this.USDCProxyAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
            this.USDCAddress = '0xa3fa3D254bf6aF295b5B22cC6730b04144314890';
            this.RouterAddress = '0x60ae616a2155ee3d9a68541ba4544862310933d4';
            this.WrappedCoinAddress = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
            this.TokenMessengerAddr = '0x6b25532e1060ce10cc3b0a99e5683b91bfde6982',
            this.MessageTransmitterAddr = '0x8186359af5f57fbb40c6b14a588d2a59c0c29880',
            this.scanApiURL = 'https://api.snowtrace.io/api';
            this.scanURL = 'https://snowtrace.io/';
              break;
            case 10:
            this.chainName = 'Optimism Mainnet';
            this.scanApiKey = process.env.OPTIMISMSCAN_API_KEY;
            this.USDCProxyAddress = '0x0b2c639c533813f4aa9d7837caf62653d097ff85';
            this.USDCAddress = '0xbd17DEee53a58B48548117a11a2E7bbF2D0d6Fa7';
            this.RouterAddress = '0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858';
            this.WrappedCoinAddress = '0x4200000000000000000000000000000000000006';
            this.TokenMessengerAddr = '0x2B4069517957735bE00ceE0fadAE88a26365528f',
            this.MessageTransmitterAddr = '0x4d41f22c5a0e5c74090899e5a8fb597a8842b3e8',
            this.scanApiURL = 'https://api-optimistic.etherscan.io/api';
            this.scanURL = 'https://optimistic.etherscan.io/';
              break;
            case 42161:
            this.chainName = 'Arbitrum One';
            this.scanApiKey = process.env.ARBISCAN_API_KEY;
            this.USDCProxyAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831';
            this.USDCAddress = '0x0f4fb9474303d10905AB86aA8d5A65FE44b6E04A';
            this.RouterAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
            this.WrappedCoinAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
            this.TokenMessengerAddr = '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
            this.MessageTransmitterAddr = '0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca',
            this.scanApiURL = 'https://api.arbiscan.io/api';
            this.scanURL = 'https://arbiscan.io/';
              break;
            case 8453:
            this.chainName = 'Base';
            this.scanApiKey = process.env.BASE_API_KEY;
            this.USDCProxyAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
            this.USDCAddress = '0x6D0c9A70D85E42Ba8B76dc06620d4E988ec8D0C1';
            this.RouterAddress = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86';
            this.WrappedCoinAddress = '0x4200000000000000000000000000000000000006';
            this.TokenMessengerAddr = '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
            this.MessageTransmitterAddr = '0xAD09780d193884d503182aD4588450C416D6F9D4',
            this.scanApiURL = 'https://api.basescan.org/api';
            this.scanURL = 'https://basescan.org/';
              break;
            // testnet
            case 5:
            this.chainName = 'Ethereum-Goerli Testnet';
            this.scanApiKey = process.env.ETHERSCAN_API_KEY;
            this.USDCProxyAddress = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F';
            this.USDCAddress = '0xe27658a36cA8A59fE5Cc76a14Bde34a51e587ab4';
            this.RouterAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
            this.WrappedCoinAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
            this.TokenMessengerAddr = '0xd0c3da58f55358142b8d3e06c1c30c5c6114efe8',
            this.MessageTransmitterAddr = '0x26413e8157cd32011e726065a5462e97dd4d03d9',
            this.scanApiURL = 'https://api-goerli.etherscan.io/api';
            this.scanURL = 'https://goerli.etherscan.io/';
              break;
            case 43113:
            this.chainName = 'Avalanche-Fuji Testnet';
            this.scanApiKey = process.env.SNOWTRACE_API_KEY;
            this.USDCProxyAddress = '0x5425890298aed601595a70ab815c96711a31bc65';
            this.USDCAddress = '0x79beb0a978443dBc125599170332b3F40D448F63';
            this.RouterAddress = '0x3705aBF712ccD4fc56Ee76f0BD3009FD4013ad75';
            this.WrappedCoinAddress = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c';
            this.TokenMessengerAddr = '0xeb08f243e5d3fcff26a9e38ae5520a669f4019d0',
            this.MessageTransmitterAddr = '0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79',
            this.scanApiURL = 'https://api-testnet.snowtrace.io/api';
            this.scanURL = 'https://testnet.snowtrace.io/';
              break;
            case 420:
            this.chainName = 'Optimism-Goerli Testnet';
            this.scanApiKey = process.env.OPTIMISMSCAN_API_KEY;
            this.USDCProxyAddress = '0xe05606174bac4a6364b31bd0eca4bf4dd368f8c6';
            this.USDCAddress = '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85';
            this.RouterAddress = '0x8F1f2A89930dC9aaa7B5a799AC695dF809B0fbe5';
            this.WrappedCoinAddress = '0x4200000000000000000000000000000000000006';
            this.TokenMessengerAddr = '0x23a04d5935ed8bc8e3eb78db3541f0abfb001c6e',
            this.MessageTransmitterAddr = '0x9ff9a4da6f2157a9c82ce756f8fd7e0d75be8895',
            this.scanApiURL = 'https://api-goerli-optimistic.etherscan.io/api';
            this.scanURL = 'https://goerli-optimistic.etherscan.io/';
              break;
            case 421613:
            this.chainName = 'Arbitrum-Goerli Testnet';
            this.scanApiKey = process.env.ARBISCAN_API_KEY;
            this.USDCProxyAddress = '0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63';
            this.USDCAddress = '0xC042E9E8cE7eB153a9B3113F91ABbF1065dfC44e';
            this.RouterAddress = '0x81cD91B6BD7D275a7AeebBA15929AE0f0751d18C';
            this.WrappedCoinAddress = '0xEe01c0CD76354C383B8c7B4e65EA88D00B06f36f';
            this.TokenMessengerAddr = '0x12dcfd3fe2e9eac2859fd1ed86d2ab8c5a2f9352',
            this.MessageTransmitterAddr = '0x109bc137cb64eab7c0b1dddd1edf341467dc2d35',
            this.scanApiURL = 'https://api-goerli.arbiscan.io/api';
            this.scanURL = 'https://goerli.arbiscan.io/';
              break;
            case 84531:
            this.chainName = 'Base-Goerli Testnet';
            this.scanApiKey = process.env.BASE_API_KEY;
            this.USDCProxyAddress = '0xf175520c52418dfe19c8098071a252da48cd1c19';
            this.USDCAddress = '0x057B113c020cA7Be92DE51591c2BcB99976F8A2c';
            this.RouterAddress = '0x9E3A2a71a5134EA25b547C3EE9131192da7B3DE5';
            this.WrappedCoinAddress = '0x4200000000000000000000000000000000000006';
            this.TokenMessengerAddr = '0x877b8e8c9e2383077809787ED6F279ce01CB4cc8',
            this.MessageTransmitterAddr = '0x9ff9a4da6f2157A9c82CE756f8fD7E0d75be8895',
            this.scanApiURL = 'https://api-goerli.basescan.org/api';
            this.scanURL = 'https://goerli.basescan.org/';
              break;
          }
    },


    setTargetChain() {
      switch (this.TargetChainIdInHexa) {
        // Target chain is Ethereum Mainnet:
        case "0x1":
        this.TargetChainScanApiURL = 'https://api.etherscan.io/api';
        this.TargetChainScanApiKey = process.env.ETHERSCAN_API_KEY;
        this.TargetChainDomain = 0;
        this.scanURLTargetChain = 'https://etherscan.io/';
        this.settlerAddress = '';
        this.targetNodeRPCURL = process.env.ETHEREUM_RPC_URL;
        break;
        // Target chain is Avalanche C-Chain:
        case "0xa86a":
        this.TargetChainScanApiURL = 'https://api.snowtrace.io/api';
        this.TargetChainScanApiKey = process.env.SNOWTRACE_API_KEY;
        this.TargetChainDomain = 1;
        this.scanURLTargetChain = 'https://snowtrace.io/';
        this.settlerAddress = '';
        this.targetNodeRPCURL = process.env.AVALANCHE_RPC_URL;
        break;
        // Target chain is Avalanche Optimism Mainnet:
        case "0xa":
        this.TargetChainScanApiURL = 'https://api-optimistic.etherscan.io/api';
        this.TargetChainScanApiKey = process.env.OPTIMISMSCAN_API_KEY;
        this.TargetChainDomain = 2;
        this.scanURLTargetChain = 'https://optimistic.etherscan.io/';
        this.settlerAddress = '';
        this.targetNodeRPCURL = process.env.OPTIMISM_RPC_URL;
        break;
        // Target chain is Arbitrum One:
        case "0xa4b1":
        this.TargetChainScanApiURL = 'https://api.arbiscan.io/api';
        this.TargetChainScanApiKey = process.env.ARBISCAN_API_KEY;
        this.TargetChainDomain = 3;
        this.scanURLTargetChain = 'https://arbiscan.io/';
        this.settlerAddress = '';
        this.targetNodeRPCURL = process.env.ARBITRUM_RPC_URL;
        break;
        // Target chain is Base:
        case "0x2105":
        this.TargetChainScanApiURL = 'https://api.basescan.org/api';
        this.TargetChainScanApiKey = process.env.BASE_API_KEY;
        this.TargetChainDomain = 6;
        this.scanURLTargetChain = 'https://basescan.org/';
        this.settlerAddress = '';
        this.targetNodeRPCURL = process.env.BASE_RPC_URL;
        break;
        // Target chain is Ethereum-Goerli:
        case "0x5":
        this.TargetChainScanApiURL = 'https://api-goerli.etherscan.io/api';
        this.TargetChainScanApiKey = process.env.ETHERSCAN_API_KEY;
        this.TargetChainDomain = 0;
        this.scanURLTargetChain = 'https://goerli.etherscan.io/';
        this.settlerAddress = '';
        this.targetNodeRPCURL = process.env.ETHEREUM_GOERLI_RPC_URL;
        break;
        // Target chain is Avalanche-Fuji:
        case "0xa869":
        this.TargetChainScanApiURL = 'https://api-testnet.snowtrace.io/api';
        this.TargetChainScanApiKey = process.env.SNOWTRACE_API_KEY;
        this.TargetChainDomain = 1;
        this.scanURLTargetChain = 'https://testnet.snowtrace.io/';
        this.settlerAddress = '0x3490ff3bc24146AA6140e1efd5b0A0fAAEda39E9';
        this.targetNodeRPCURL = process.env.AVALANCHE_FUJI_RPC_URL;
        break;
        // Target chain is Optimism-Goerli:
        case "0x1a4":
        this.TargetChainScanApiURL = 'https://api-goerli-optimistic.etherscan.io/api';
        this.TargetChainScanApiKey = process.env.OPTIMISMSCAN_API_KEY;
        this.TargetChainDomain = 2;
        this.scanURLTargetChain = 'https://goerli-optimistic.etherscan.io/';
        this.settlerAddress = '';
        this.targetNodeRPCURL = process.env.OPTIMISM_GOERLI_RPC_URL;
        break;
        // Target chain is Arbitrum-Goerli:
        case "0x66eed":
        this.TargetChainScanApiURL = 'https://api-goerli.arbiscan.io/api';
        this.TargetChainScanApiKey = process.env.ARBISCAN_API_KEY;
        this.TargetChainDomain = 3;
        this.scanURLTargetChain = 'https://goerli.arbiscan.io/';
        this.settlerAddress = '';
        this.targetNodeRPCURL = process.env.ARBITRUM_GOERLI_RPC_URL;
        break;
        // Target chain is Base-Goerli:
        case "0x14a33":
        this.TargetChainScanApiURL = 'https://api-goerli.basescan.org/api';
        this.TargetChainScanApiKey = process.env.BASE_API_KEY;
        this.TargetChainDomain = 6;
        this.scanURLTargetChain = 'https://goerli.basescan.org/';
        this.settlerAddress = '';
        this.targetNodeRPCURL = process.env.BASE_GOERLI_RPC_URL;
        break;
      }
    },


    // The following function will be used when the source chain is selected at the 1st time or changed to another one,
    // the frontend will tranmit the global variable, SourceChainIdInHexa. 
    // Then request Metamask to ask user whether switch to the network corresponding to SourceChainIdInHexa.
    // Because of the switch of Network, this function will lead to window.ethereum.on('chainChanged').
    async switchToOtherNetwork() {
      this.initializationSteps = 0;
      try {
        // Check if the wallet has already connected to the selected network.
        if (this.connectedBool == true) {
          if (ethers.BigNumber.from(this.SourceChainIdInHexa) != this.chainId) {
          } else {
            this.tips = `Already connected: ${this.chainName}`;
            console.log(this.tips);
          }
        
        // Situation 1: If the switch is not for crosschain-swap, all the initialization will continue to be conducted after the change of network or account captured by listeners.
        // Situation 2: If the switch is for crosschain-swap, it should stop the listeners and uniquely conduct all initialization which is the same as first-time connection.
        //    CrosschainSwap will call switchToOtherNetwork. If the initialization won't be done uniquely, the signer cannot be updated before the next step of crosschain-swap. Then error will occur.
        //    The unique initialization will be divided into 2 parts. the actual initialization of provider, account, contracts, listeners, and gas-estimate will be placed at the rear place.
        //    And the other part will be placed at the front. Meanwhile, the action of network-switch is in the middle.
        //  --------------------------------- front part ---------------------------------
        if (this.switchForCrossChainSwapBool == true) {
          // For the case of cross-chain swap, all the initialization will be done in the rear part of this function.
          // Considering the occurrence of window.ethereum when switch to the target chain, so turn off the following two listeners.
            window.ethereum.off('accountsChanged', this.accountChangeListener);
            window.ethereum.off('chainChanged', this.providerChangeListener);
            this.errorMessage = null;
            this.slippageChecker = null;
            this.AddressInputChecker = null;
            this.TxHash = null;
            this.txURL = null;
            this.executeErrorMessage = null;
            this.stopListeningToBlocks();
          }
        
        //  --------------------------------- middle part ---------------------------------
        if (window.ethereum) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: this.SourceChainIdInHexa }],           // chainId must be in hexadecimal
          });
        } else {
          this.errorMessage = 'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html';
          console.error(this.errorMessage);
        }

        //  --------------------------------- rear part ---------------------------------
        if (this.switchForCrossChainSwapBool == true) {
            if (this.connectedBool == true) {
            await this.initProvider();
            await this.initAccount();
            await this.initContract();
            await this.readContract();
            this.listenTxOfAccount();

            this.swapEstimate();

            this.switchForCrossChainSwapBool = false;

            this.tips = `Switched to ${this.chainName} successfully. Wait for completion of crosschain swap`;
            }
          }
          // Reopen the listeners.
          window.ethereum.on('chainChanged', this.providerChangeListener);
          window.ethereum.on('accountsChanged', this.accountChangeListener);
      }
      } catch (error) {
        this.SourceChainIdInHexa = ethers.BigNumber.from(this.chainId).toHexString().replace(/^0x0+/, '0x');
        this.errorMessage = `Fail to switch network.`;
        console.error(this.errorMessage + error);
      }
    },


    // ---------------------------------------------------- Initialization ----------------------------------------------------

    async initProvider() {
      if(window.ethereum) {
          this.provider = new ethers.providers.Web3Provider(window.ethereum);
          let network = await this.provider.getNetwork();
          this.chainId = network.chainId;
          this.SourceChainIdInHexa = ethers.BigNumber.from(this.chainId).toHexString().replace(/^0x0+/, '0x');
          console.log(`SourceChainIdInHexa: ${this.SourceChainIdInHexa}`);
          this.getCoinSymbol();
          this.getNetworkInfo();
      } else {
        this.errorMessage = "Need to install MetaMask.";
        console.log(this.errorMessage);
      }

      this.initializationSteps += 1;
    },


    getCoinSymbol() {
      const ethChains = [1, 5, 10, 420, 42161, 8453, 84531];
      const avaxChains = [43114, 43113];
      const agorChains = [421613];

      if (ethChains.includes(this.chainId)) {
          this.coinSymbol = 'ETH';
          this.coinUSDCPair = 'ETHUSDT';
        } else if (avaxChains.includes(this.chainId)) {
          this.coinSymbol = 'AVAX';
          this.coinUSDCPair = 'AVAXUSDT';
        } else if (agorChains.includes(this.chainId)) {
          this.coinSymbol = 'AGOR';
          this.coinUSDCPair = 'ETHUSDT';
        } else {
          this.errorMessage = 'Chain ID not recognized.';
          console.log(this.errorMessage);
        }
        console.log(`Coin symbol: ${this.coinSymbol}`);
    },


    async initAccount(){
        try {
          if(window.ethereum) {
            this.accounts = await this.provider.send("eth_requestAccounts", []);
            this.account = this.accounts[0];
            this.signer = this.provider.getSigner();
          } else {
            this.errorMessage = 'window.ethereum failed, check if the wallet is connected.';
            console.log(this.errorMessage);
          }
        } catch(error){
          console.log(error);
        }

        this.initializationSteps += 1;
    },


    async initContract() {
      this.erc20Token = new ethers.Contract(this.USDCProxyAddress, await this.getContractABI(this.USDCAddress), this.signer);
      this.routerContract = new ethers.Contract(this.RouterAddress, await this.getContractABI(this.RouterAddress), this.signer);
      this.TokenMessagerContract = new ethers.Contract(this.TokenMessengerAddr, await this.getContractABI(this.TokenMessengerAddr), this.signer);

      this.initializationSteps += 1;
      // this.bank = new ethers.Contract(bankAddr.address, bankAbi, this.signer);
    }, 


    // This function includes all needed information of the ERC20 token. 
    // In addition, the account's coin balance is also included here.
    async readContract() {
      this.provider.getBalance(this.account).then((r) => {
        this.coinBalance = ethers.utils.formatUnits(r, 18);
      });

      this.erc20Token.name().then((r) => {
        this.name = r;
      })
      await this.erc20Token.decimals().then((r) => {
        this.decimal = r;
      })
      this.erc20Token.symbol().then((r) => {
        this.symbol = r;
      })
      this.erc20Token.totalSupply().then((r) => {
        this.supply = ethers.utils.formatUnits(r, this.decimal);
      })

      this.erc20Token.balanceOf(this.account).then((r) => {
        this.tokenBalance = ethers.utils.formatUnits(r, this.decimal);
      })

      this.initializationSteps += 1;

    },


    async getContractABI(contractAddress) {
      try {
        const fetchedABI = await fetch(`${this.scanApiURL}?module=contract&action=getabi&address=${contractAddress}&apikey=${this.scanApiKey}`);
        const contractABI = await fetchedABI.json();
        if (contractABI.status === '1') {
          return JSON.parse(contractABI.result);
        } else {
          this.errorMessage = `Failed to get contract ABI for address: ${contractAddress}, status: ${contractABI.status}`;
          console.error(this.errorMessage);
          return null;
        }
      } catch (error) {
        this.errorMessage = error.toString();
        console.error(this.errorMessage);
        return null;
      }
    },


    // ---------------------------------------------------- Listeners ---------------------------------------------------- 

    async providerChangeListener() {
      this.errorMessage = null;
      this.slippageChecker = null;
      this.AddressInputChecker = null;
      this.TxHash = null;
      this.txURL = null;
      this.executeErrorMessage = null;
      if (this.connectedBool == true) {
      await this.initProvider();
      await this.initAccount();
      await this.initContract();
      await this.readContract();
      this.listenTxOfAccount();

      this.swapEstimate();

      this.tips = `Switch to ${this.chainName} successfully`;
      }
    },


    async accountChangeListener() {
      this.errorMessage = null;
      this.slippageChecker = null;
      this.AddressInputChecker = null;
      this.TxHash = null;
      this.txURL = null;
      this.executeErrorMessage = null;
      if (this.connectedBool == true) {
      await this.initProvider();
      await this.initAccount();
      await this.initContract();
      await this.readContract();
      this.listenTxOfAccount();

      this.tips = `Account switched successfully: ${this.account}`;
      }
    },


    // Listen transactions related to the account, do as follows:
    // 1. Listen new release of blocks.
    // 2. Filter transactions of the account when new blocks release. Then read erc20 contract(including coin balance in the instance "readContract")
    async listenTxOfAccount() {
      this.blockEventHandler = async blockNumber => {this.blockListener(blockNumber)};
      this.provider.on('block', this.blockEventHandler);
      this.initializationSteps += 1;
    },


    async blockListener(blockNumber) {
      try{
        let block = await this.provider.getBlockWithTransactions(blockNumber);
        for (let tx of block.transactions) {
          if (tx.from !== null && tx.to !== null && (tx.from.toLowerCase() === this.account.toLowerCase() || tx.to.toLowerCase() === this.account.toLowerCase())) {
            await this.readContract();
          }
        }
        // Get the current coin price via Binance API
        let response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${this.coinUSDCPair}`);
        if (!response.ok) {
          throw new Error(`Binance API responded with ${response.statusText}`);
          }
        let data = await response.json();
        this.coinPrice = "$" + data.price.toString();
        // console.log(`Current Block Number: ${blockNumber} & Current ${this.coinSymbol} Price: ${this.coinPrice}`)
      } catch (error) {
        console.error(error);
      }
    },


    stopListeningToBlocks() {
      if (this.blockEventHandler) {
        this.provider.off('block', this.blockEventHandler);
        this.blockEventHandler = null;
      }
    },


    // ---------------------------------------------------- Core Functions ----------------------------------------------------    

    async swapEstimate() {
      this.slippageChecker = null;
      this.executeErrorMessage = null;
      // Check amountIn:
      if ((isNaN(parseFloat(+this.AmountInForSwap))) || (isNaN(parseInt(+this.AmountInForSwap))) || +this.AmountInForSwap < 0) {
        this.amountInChecker = "Invalid amount, please input again."
        this.AmountInForSwap = null;
      } else {
        this.amountInChecker = null;
      }
      // Check slippage:
      if ((isNaN(parseFloat(+this.slippage))) || (isNaN(parseInt(+this.slippage))) || +this.slippage < 0 || +this.slippage >= 100) {
        this.slippageChecker = "Invalid slippage, please input again."
        this.slippage = null;
      } else {
        this.slippageChecker = null;
      }
      if (+this.AmountInForSwap > 0) {
        const amountIn = ethers.utils.parseEther(this.AmountInForSwap);
        const path = [this.WrappedCoinAddress, this.USDCProxyAddress]; 
        if (+this.slippage >= 0 && +this.slippage < 100) {
        // Get the demical length after decimal point. And plus the percent-decimal length(2).
        const slippageDecimalLength = await this.countDecimalsForFloat(+this.slippage) + 2;
        const multiplyFactor = ethers.BigNumber.from(10 ** slippageDecimalLength);
        const slippageConverted = ethers.BigNumber.from(+this.slippage * (multiplyFactor / 100));
        const USDCdecimal = 1 * 10 ** this.decimal;
        const amountsOutResponse = await this.routerContract.getAmountsOut(amountIn, path);
        const estimatedAmountOut = amountsOutResponse[1];                   // The function call will return an array. The value of index 1 is the one we want.
        const factorMinusSlippage = multiplyFactor.sub(slippageConverted);
        const amountOutMinRes = estimatedAmountOut.mul(factorMinusSlippage).div(1 * multiplyFactor);
        const amountOutMinDivided = parseFloat(amountOutMinRes.toString()) / USDCdecimal;
        const amountOutMin = amountOutMinDivided.toString();
        this.swapEstimateOut = amountOutMin;
        } else {
          this.swapEstimateOut = null;
        };
      } else {
        this.swapEstimateOut = 0;
      }
      return this.swapEstimateOut;
    },


    // Buy token using an exact amount of coin within the current blockchain network.
    async swapExactCoinForToken() {
      let USDCTransferred;
      let to;
      const amountIn = ethers.utils.parseEther(this.AmountInForSwap).toString();
      if (this.isIntraSwap == true) {
        to = this.destinationAddrIntra;
      } else {
        to = this.account;                // In the case of crosschain swap: Swapped USDC will be transferred to the same account as the one who inputs coin.
      }                                                
      const path = [this.WrappedCoinAddress, this.USDCProxyAddress];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;           // deadline = current time + 10 minutes 
      const amountOutMin = await this.swapEstimate();
      const amountOutMinInWei = (ethers.utils.parseUnits(amountOutMin, Number(this.decimal))).toString();
      // Then, get the transaction hash.
      let tx;
      // Notice: The function name of the router contract deployed on Avalanche or Avalanche-Fuji Testnet, differs from those on the other chain.
      if (this.chainId == 43114 || this.chainId == 43113) {
        tx = await this.routerContract.swapExactAVAXForTokens(amountOutMinInWei, path, to, deadline, { value: amountIn });
      } else {
        tx = await this.routerContract.swapExactETHForTokens(amountOutMinInWei, path, to, deadline, { value: amountIn });
      }
      const txHash = tx.hash;
      console.log('Transaction Hash:', txHash);
      // if conduct an intra-chain swap, output the Txhash to the front end.
      if (this.isIntraSwap == true) {
        this.TxHash = txHash;
        this.txURL = this.scanURL + 'tx/' + this.TxHash;
      }
      try {
      const txReceipt = await tx.wait(); 
      const transferEvents = txReceipt.logs.filter((log) => {
        return log.address.toLowerCase() === this.USDCProxyAddress.toLowerCase() && log.topics[0] == ethers.utils.id("Transfer(address,address,uint256)");
        });
      transferEvents.forEach((event) => {
      const parsedEvent = this.erc20Token.interface.parseLog(event);
      // USDCTransferred is in basic unit 
      USDCTransferred = ethers.BigNumber.from(parsedEvent.args.value);
      console.log(`Transferred amount of USDC in basic unit: ${USDCTransferred}`);
      }); 
      return USDCTransferred;
      } catch(error) {
        console.error(`Error happened when execute swapExactCoinForToken: ${error}`);
      }
    },


    async intraSwap() {
      if ((isNaN(parseInt(this.AmountInForSwap))) || (isNaN(parseFloat(this.AmountInForSwap))) || this.AmountInForSwap <= 0) {
        this.executeErrorMessage = "The amount you pay is valid, please check.";
      } else if  ((isNaN(parseFloat(+this.slippage))) || (isNaN(parseInt(+this.slippage))) || +this.slippage < 0 || +this.slippage >= 100) {
        this.executeErrorMessage = "Invalid slippage, please check.";
      } else {
      this.errorMessage = null;
      this.TxHash = null;
      this.txURL = null;
      this.isIntraSwap = true;
      this.destinationAddressChecker();
      await this.swapExactCoinForToken();
      this.isIntraSwap = false;
      }
    },

    // 改：
    // 1. 修正 this.MessageTransmitterContract 初始化合约实例的变量名为 settler 的错误（接收变量由 const settler 改为 this.MessageTransmitterContract）;
    // 2. 将代码 "const destination = this.destinationAddrCrosschain;"改为 let 声明，并在此之后，将 settler 合约的实例化移出并放到调用 settler 合约的专属 EOA 的脚本之中；此外，还完善了对 situation 的判断代码和注释，以此明确是否调用 settler 合约，和调用其中的哪一个函数;
    // 3. STEP 5 修改最开始的判断条件：是否是给自己swap并且余额足够，将(this.swapToMeBool == true && payableBool == true)改为(situationNum == 1);
    // 4. STEP 5 最开始的判断条件若不满足（即 situationNum != 1 ）时，则增加返回值: destination 和 situationNum;
    // 5. 对 STEP 5 的注释进行全面更新;
    // Cross chain via CCTP
    // 1. Check the inputs first
    // 2. Set all infomation related to the target chain 
    // 3. Call gasEstimateAndPayableChecker() function which estimates the total gas cost on the target chain. The coin balance on the target chain will be obtained in gasEstimateAndPayableChecker() function.
    // 4. Call 
    async crosschainSwap() {
      if (this.targetChainChecker() != true) {
        // Do the check inside the targetChainChecker function.
        // Then，check if the inputs are valid:
        } else if ((isNaN(parseInt(this.AmountInForSwap))) || (isNaN(parseFloat(this.AmountInForSwap))) || this.AmountInForSwap <= 0) {
          this.executeErrorMessage = "The amount you pay is valid, please check.";
        } else if ((isNaN(parseFloat(+this.slippage))) || (isNaN(parseInt(+this.slippage))) || +this.slippage < 0 || +this.slippage >= 100) {
          this.executeErrorMessage = "Invalid slippage, please check.";
        } else {
        this.inProcessBool = true;
        // Set all values of the variables about target chain.
        this.setTargetChain();
        // Estimate the total gas cost.
        const payableBool = await this.gasEstimateAndPayableChecker();
        // Destination address on the target chain.
        this.destinationAddressChecker();
        let destination = this.destinationAddrCrosschain;
        // Based on destination address and whether the recipient can afford gas, check the situation:
        // Situation 1: Destination address is the same as the one of the sender, and the sender's address on the target chain have enough coin to pay for gas. 
        // Situation 2: Destination address is the same as the one of the sender, and the sender's address on the target chain have insufficient coin to pay for gas.
        // Situation 3: Destination address is another one, and the recipient's address on the target chain can afford the gas.
        // Situation 4: Destination address is another one, and the recipient's address on the target chain can not afford the gas.
        let situationNum;
        if (destination == this.account && payableBool == true) {
          situationNum = 1;
        } else if (destination == this.account && payableBool != true) {
          situationNum = 2;
        } else if (destination != this.account && payableBool == true) {
          situationNum = 3;
        } else if (destination != this.account && payableBool != true) {
          situationNum = 4;
        }
        const destinationAddressInBytes32 = await this.addressToBytes32(destination);
        const DESTINATION_DOMAIN = this.TargetChainDomain;
        // The amount of USDC that will be transferred.
        // swapExactCoinForToken() will execute an intra-chain swap from coin to USDC with the input AmountInForSwap.
        const USDCAmount = await this.swapExactCoinForToken();
        console.log(`USDCAmount: ${USDCAmount}`);

        // STEP 1: Approve TokenMessenger contract to withdraw USDC from our wallet address on the source chain.
        const approveTxGas = await this.erc20Token.estimateGas.approve(this.TokenMessengerAddr, USDCAmount);
        const approveTx = await this.erc20Token.approve(this.TokenMessengerAddr, USDCAmount, { gasLimit: approveTxGas });
        const approveTxReceipt = await approveTx.wait();
        console.log('ApproveTxReceipt: ', approveTxReceipt);

        // STEP 2: Burn USDC.
        const burnTxGas = await this.TokenMessagerContract.estimateGas.depositForBurn(USDCAmount, DESTINATION_DOMAIN, destinationAddressInBytes32, this.USDCProxyAddress);
        const burnTx = await this.TokenMessagerContract.depositForBurn(USDCAmount, DESTINATION_DOMAIN, destinationAddressInBytes32, this.USDCProxyAddress, { gasLimit: burnTxGas });
        const burnTxReceipt = await burnTx.wait();
        console.log('burnTxGas: ', burnTxGas);
        console.log('BurnTxReceipt: ', burnTxReceipt);

        // STEP 3: Retrieve message bytes from logs.
        // Get the transaction receipt using the transaction hash.
        const transactionReceipt = await this.provider.getTransactionReceipt(burnTx.hash);
        // Define the event signature hash.
        const eventTopic = ethers.utils.id('MessageSent(bytes)');
        // Find the log with the corresponding event signature.
        const log = transactionReceipt.logs.find(log => log.topics.indexOf(eventTopic) !== -1); 
        // Decode the log data to get the message bytes.
        const messageBytes = ethers.utils.defaultAbiCoder.decode(['bytes'], log.data)[0];
        // Hash the message bytes.
        const messageHash = ethers.utils.keccak256(messageBytes);
        console.log(`MessageBytes: ${messageBytes}`);
        console.log(`MessageHash: ${messageHash}`);

        // STEP 4: Fetch attestation signature.
        let attestationResponse = {status: 'pending'};
        while(attestationResponse.status != 'complete') {
            const response = await fetch(`https://iris-api-sandbox.circle.com/attestations/${messageHash}`);
            attestationResponse = await response.json();
            await new Promise(r => setTimeout(r, 2000));
        } 
        const attestationSignature = attestationResponse.attestation;
        console.log(`Signature: ${attestationSignature}`);

        // STEP 5: If situationNum == 1, go ahead to this step. if situationNum != 1, return destination and situationNum.
        // First of all, user will be requested to switch to the target chain.
        // After the switch of network, initialize the MessageTransmitter contract on the target chain.
        // Next, by calling receiveMessage funtion of MessageTransmitter contract, message bytes and attestation, which are generated from the previous step, will be input as the parameters of the function.
        // Finally, get the transaction hash and its blockscan URL.
        if (situationNum == 1) {
        this.switchForCrossChainSwapBool = true;
        this.SourceChainIdInHexa = this.TargetChainIdInHexa;
        await this.switchToOtherNetwork();

        const targetChainSigner = this.signer;
        // Initialize MessageTransmitter contract on the target chain.
        this.MessageTransmitterContract = new ethers.Contract(this.MessageTransmitterAddr, await this.getContractABI(this.MessageTransmitterAddr), targetChainSigner);
        const receiveTxGas = await this.MessageTransmitterContract.estimateGas.receiveMessage(messageBytes, attestationSignature);
        const receiveTx = await this.MessageTransmitterContract.receiveMessage(messageBytes, attestationSignature, { gasLimit: receiveTxGas });
        const receiveTxReceipt = await receiveTx.wait();
        console.log('ReceiveTxReceipt: ', receiveTxReceipt);
        this.TxHash = receiveTx.hash;
        this.tips = "Transaction finished" + receiveTx.hash;
        this.txURL = this.scanURLTargetChain + 'tx/' + this.TxHash;
        console.log(`txURL: ${this.txURL}`);
        } else {
          return { destination, situationNum };
        }
      }
      this.inProcessBool = false;
    },


    // ---------------------------------------------------- Checkers ----------------------------------------------------    

    // This function is to check if the connection has already finished without any errors.
    async connectionChecker() {
      // Check if none error is reported, then show the tip to let user know successful connection.
      // Notice: the second judgement is to check if all functions related to wallet connection are all set.
      if (this.errorMessage == null && this.initializationSteps == 5) {
      this.tips = "Successfully connected";
      }
    },


    targetChainChecker() {
      // Divided networks into 2 types: mainnet(1) & testnet(9)
      let sourceChainType;
      let targetChainType;
      if (this.SourceChainIdInHexa == "0x1" || this.SourceChainIdInHexa == "0xa86a" || this.SourceChainIdInHexa == "0xa" || this.SourceChainIdInHexa == "0xa4b1" || this.SourceChainIdInHexa == "0x2105") {
        sourceChainType = 1;
      } else {
        sourceChainType = 9;
      }
      if (this.TargetChainIdInHexa == "0x1" || this.TargetChainIdInHexa == "0xa86a" || this.TargetChainIdInHexa == "0xa" || this.TargetChainIdInHexa == "0xa4b1" || this.TargetChainIdInHexa == "0x2105") {
        targetChainType = 1;
      } else {
        targetChainType = 9;
      }
      
      // Check if the target chain haven't been selected.
      if (this.TargetChainIdInHexa == null) {
        this.executeErrorMessage = "Invalid Target Network, please check.";
      // Check if the target chain and the source chain are the same.
      } else if (this.TargetChainIdInHexa == this.SourceChainIdInHexa) { 
        this.executeErrorMessage = "The target chain is the same as the source chain. If needed, click the Intra-chain Swap button";
      // Check if the user is trying to swap between mainnet and testnet.
      } else if (sourceChainType != targetChainType) {
        this.executeErrorMessage = "Swap between mainnet and testnet is not supported.";
      } else {
        return true;
      }
      return false;
    },


    destinationAddressChecker() {
      // DestinationJudge = 0: Destination is the same as the current one; 
      // DestinationJudge = 1: Destination is an address of someone else.
      let destinationJudge = document.forms['DestinationAddressJudge']['DestinationJudge'].value;
      if (destinationJudge == 1) {
        this.swapToMeBool = false;
        //In this case, no matter what address is input, the address here is always set the address of Settler contract.
        this.destinationAddrIntra = this.destinationAddrInput;
        this.destinationAddrCrosschain = this.settlerAddress;
      } else if (destinationJudge == 0 && destinationJudge != null) {
        this.swapToMeBool = true;
        this.destinationAddrIntra = this.account;
        this.destinationAddrCrosschain = this.account;
      }
    },


    addressInputChecker() {
      if (this.destinationAddrInput == null) {
        this.AddressInputChecker = "Please input the recipient addresss.";
      } else if (this.destinationAddrInput.length != 42) {
        this.AddressInputChecker = "The recipient addresss is valid or incomplete.";
      } else {
        this.AddressInputChecker = null;
      }
    },


    // Estimate the gas total cost of calling MessageTransmitter's receiveMessage function on the target chain.
    async gasEstimateAndPayableChecker() {
      let balanceOfRecipient;
      let gasAmountEstimated;
      // First， check if the balance of the destination addresss is enough to pay for total gas cost.
      // Notice：The ‘await’ before this.TargetChainScanApiKey should be reserved, or the response will be incorrect.
      fetch(`${this.TargetChainScanApiURL}?module=account&action=balance&address=${this.account}&tag=latest&apikey=${await this.TargetChainScanApiKey}`)
      .then(response => {
        if (response.ok) {
          return response.json(); 
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        balanceOfRecipient = data.result;
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });

      const totalGasPrice = await getGasPrice();

      console.log(`baseFee 与 priorityFee 相加获得的 gasPrice: ${totalGasPrice}`);
  
      const gasCostEstimated = totalGasPrice * gasAmountEstimated;

      if (gasCostEstimated <= balanceOfRecipient) {
        return true;
      } else {
        return false;
      }
    },


    // ---------------------------------------------------- Gas Estimates ----------------------------------------------------

    async getGasPrice() {
      let baseFee;
      let priorityFee;
      try {
        const provider = new ethers.providers.JsonRpcProvider(this.targetNodeRPCURL);
        const block = await provider.getBlock('latest');

        // Get the base fee per gas of the current network
        baseFee = block.baseFeePerGas;
        const baseFeeInGwei = ethers.utils.formatUnits(baseFee.toString(), 'gwei');
        
        // Get the average amount of priority fee per gas within the past several transactions which satisfy the standard of EIP-1559
        let totalPriorityFee = ethers.BigNumber.from(0);
        let minPriorityFee = ethers.BigNumber.from(ethers.constants.MaxUint256);
        let transactionCounter = 0;
        let currentBlockNumber = await provider.getBlockNumber();
        TxLoop:
        while (transactionCounter < 3 && currentBlockNumber > 0) {
          const block = await provider.getBlockWithTransactions(currentBlockNumber);
          if (block && Array.isArray(block.transactions)) {
          for (const tx of block.transactions) {
              // Check if the tx satisfy the standard of EIP-1559
              if (tx.maxPriorityFeePerGas) {
                  totalPriorityFee = totalPriorityFee.add(tx.maxPriorityFeePerGas);
                  minPriorityFee = minPriorityFee.gt(tx.maxPriorityFeePerGas) ? tx.maxPriorityFeePerGas : minPriorityFee;
                  transactionCounter++;
                  console.log(`第${transactionCounter}笔交易：优先费为${tx.maxPriorityFeePerGas}, 区块高度${currentBlockNumber}`);
                  if (transactionCounter >= 3) {
                    break TxLoop;
                  }
                }
              }
          }
          // move to the previous block.
          currentBlockNumber--;
        }
        console.log(`Minimum Priority Fee: ${ethers.utils.formatUnits(minPriorityFee.toString(), 'gwei')} gwei`); 

        priorityFee = minPriorityFee;
        const priorityFeeInGwei = ethers.utils.formatUnits(priorityFee.toString(), 'gwei');
        console.log(`Base Fee: ${baseFeeInGwei} gwei`);
        console.log(`Priority Fee: ${priorityFeeInGwei} gwei`);
        const totalGasPrice = baseFee.add(priorityFee);
        return totalGasPrice;
      } catch (error) {
          console.error(error);
          return null;
      }
    },
    

    // ---------------------------------------------------- Utils ----------------------------------------------------

    async addressToBytes32(addr) {
      const address = ethers.utils.getAddress(addr);
      const addressBytes32 = ethers.utils.hexZeroPad(address, 32);
      return addressBytes32;
    },


    async countDecimalsForFloat(value) {
      if (Math.floor(value) === value) {
        return 0;
      } 
        return value.toString().split(".")[1].length || 0; // To avoid the former return undefined, so use || here.
    },


    // ---------------------------------------------------- For Front Page ----------------------------------------------------

    buttonMouseEnter() {
      if (this.connectedBool) {
        this.buttonText = "Disconnect";
      } else {
        this.buttonText = "Connect";
      }
    },


    buttonMouseLeave() {
      if (this.connectedBool) {
        this.buttonText = "Connected";
      }
    },
  },

}


  // ---------------------------------------------------- For Operation ----------------------------------------------------

  const express = require('express');
  const app = express();
  const port = 3000;

  app.use(express.json());
  

</script>

<template>
  <div>
    <div style="display: flex; align-items: center;">
      <!-- 图片 -->
      <img 
        src="https://pbs.twimg.com/profile_images/1648741748707819552/oh3R_XDJ_400x400.png" 
        alt="开发者" 
        style="width: 70px; height: 70px; margin-right: 30px;" 
      />
      <!-- 标题 -->
      <h1 style="font-size: 36px; font-weight: bold; color: orange; margin-top: 30px;">Circle Cross-chain Swap</h1> <span style="color: gray; font-size: 18px; margin-top: 35px; margin-left: 18px;">v0.2 Beta</span>
    </div>
  </div>

  <div >
    <!-- This button is used to connect/disconnect to user's wallet  -->
    <button @click="connect" @mouseenter="buttonMouseEnter" @mouseleave="buttonMouseLeave" style="font-size: 20px; font-weight: bold;" :disabled="connectButtonDisabled"> {{ buttonText}} </button>
    <span style="color: red; font-size: 16px; font-weight: bold;">{{ errorMessage }}</span><br />
    <span style="color: green; font-size: 18px; font-weight: bold;">{{ tips }}</span>
    <br />
    <div>
    Wallet Address : {{  account }}
  </div>
      <div class="block"> 
        <span style="color: #0099ff; font-weight: bold;">Current Network:</span> {{ chainName }} <br />
        <span style="color: #0099ff; font-weight: bold;">{{ coinSymbol }} Price :</span> {{ coinPrice }} <br />
        <span style="color: #0099ff; font-weight: bold;">Token Name :</span> {{ name  }} <br />
        <span style="color: #0099ff; font-weight: bold;">Token Symbol :</span> {{  symbol }} <br />
        <span style="color: #0099ff; font-weight: bold;">Token Decimal :</span> {{  decimal }} <br />
        <span style="color: #0099ff; font-weight: bold;">Token Supply :</span> {{  supply }} <br />
        <span style="color: #0099ff; font-weight: bold;">My Token Balance :</span> {{ tokenBalance }} <br />
        <span style="color: #0099ff; font-weight: bold;">My {{ coinSymbol }} Balance :</span> {{ coinBalance }}
      </div>

      <div class="block">
      <h2 style="font-size: 26px; font-weight: bold; color: orangered;">Cross-chain Swap:</h2>
      <div >
        <label for="sourceChainSelection" style="color: mediumslateblue; font-weight: bold;">Source Network:</label>
        <select id="sourceChainSelection" v-model="SourceChainIdInHexa" @change="switchToOtherNetwork" :disabled="unconnectedDisabled" style="margin-left: 15px;">
        <option value="0x1" type="text">Ethereum Mainnet</option>
        <option value="0xa86a" type="text">Avalanche C-Chain</option>
        <option value="0xa" type="text">Optimism Mainnet</option>
        <option value="0xa4b1" type="text">Arbitrum One</option>
        <option value="0x2105" type="text">Base</option>
        <option value="0x5" type="text">Ethereum Goerli Testnet</option>
        <option value="0xa869" type="text">Avalanche Fuji Testnet</option>
        <option value="0x1a4" type="text">Optimism Goerli Testnet</option>
        <option value="0x66eed" type="text">Arbitrum Goerli Testnet</option>
        <option value="0x14a33" type="text">Base Goerli Testnet</option>
        </select>
        <br />
        <label for="sourceChainSelection" style="color: mediumslateblue; font-weight: bold;">Target Network:</label>
        <select id="sourceChainSelection" v-model="TargetChainIdInHexa" @change="setTargetChain" :disabled="unconnectedDisabled" style="margin-left: 19px;">
        <option value="0x1" type="text">Ethereum Mainnet</option>
        <option value="0xa86a" type="text">Avalanche C-Chain</option>
        <option value="0xa" type="text">Optimism Mainnet</option>
        <option value="0xa4b1" type="text">Arbitrum One</option>
        <option value="0x2105" type="text">Base</option>
        <option value="0x5" type="text">Ethereum Goerli Testnet</option>
        <option value="0xa869" type="text">Avalanche Fuji Testnet</option>
        <option value="0x1a4" type="text">Optimism Goerli Testnet</option>
        <option value="0x66eed" type="text">Arbitrum Goerli Testnet</option>
        <option value="0x14a33" type="text">Base Goerli Testnet</option>
        </select>
        <br />
        <label for="AmountIn" style="color: lightsalmon; font-weight: bold;">Pay:</label>
        <input id="AmountIn" type="text" v-model="AmountInForSwap" @input="swapEstimate" :disabled="unconnectedDisabled" style="margin-left: 12px;"/> {{ coinSymbol }}
        <span style="color: red; font-size: 16px; margin-left: 15px;">{{ amountInChecker }}</span>
        <br />
        <label for="Slippage" style="color: mediumslateblue; font-weight: bold;">Slippage:</label>
        <input id="Slippage" type="text" v-model="slippage" @input="swapEstimate" :disabled="unconnectedDisabled" style="margin-left: 12px;"/> %
        <span style="color: red; font-size: 16px; margin-left: 15px;">{{ slippageChecker }}</span>
        <br />
        <label for="AmountIn" style="color: lightsalmon; font-weight: bold;">Receive: </label>
        <span id="AmountIn" v-show="showUSDCSymbol" style="color: darkorange; margin-left: 7px; font-size: 20px; font-weight: bold;"> {{ swapEstimateOut }} </span>
        <span id="AmountIn" v-show="showUSDCSymbol" style="color: #0099ff; font-size: 20px; margin-left: 7px;"> {{ symbol }} </span> 
        <br />
        <form name="DestinationAddressJudge" action="#">
        <span style="font-size: 16px; font-weight: bold;"> Swap to: </span>
        <br />
        <input type="radio" id="mineCurrent" :disabled="unconnectedDisabled" name="DestinationJudge" value="0" @click="destinationAddressChecker">
        <label for="mineCurrent" style="font-size: 16px"> Me </label>
        <br />
        <input type="radio" id="others" :disabled="unconnectedDisabled" name="DestinationJudge" value="1" @click="destinationAddressChecker">
        <label for="others" style="font-size: 16px"> Others </label>
        <input type="text" v-model="destinationAddrInput" v-show="addrInputShow" placeholder="input recipient address" @input="addressInputChecker" style="margin-left: 12px;"/>
        <span style="color: red; font-size: 16px; margin-left: 15px;">{{ AddressInputChecker}}</span>
        <br />
        </form>
        <label for="Tx" v-show="showTxButton" style="color: lightgreen; font-weight: bold;">Transaction:</label>
        <a :href="txURL" target="_blank">
        <button id="Tx" v-show="showTxButton" style="color: lightgreen; margin-left: 10px; font-size: 16px; font-weight: bold; margin-left: 12px;"> Transaction Link </button>
        </a>
        <br />
        <button @click="intraSwap" :disabled="unconnectedDisabled" style="font-size: 18px; font-weight: bold;"> Intra-chain Swap </button>
        <button @click="crosschainSwap" :disabled="unconnectedDisabled" style="font-size: 18px; font-weight: bold; margin-left: 25px;"> Cross-chain Swap </button>
        <button @click="gasEstimateAndPayableChecker" :disabled="unconnectedDisabled" style="font-size: 18px; font-weight: bold; margin-left: 25px;"> gasEstimate & PayableCheck </button>
        <button @click="getGasPrice" :disabled="unconnectedDisabled" style="font-size: 18px; font-weight: bold; margin-left: 25px;"> getGasPrice </button>
        <br />
        <span style="color: red; font-size: 16px; font-weight: bold;">{{ executeErrorMessage }}</span>
        <br />

      </div>
      </div>

  </div>

</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.4rem;
  color: firebrick;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

div {
  font-size: 1.2rem;
}

.block {
  margin: 5px;
  padding: 5px;
  border-style: solid;
  border-width: 1px;
}
</style>