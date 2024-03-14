      const express = require('express');
      const ethers = require('ethers');
      const cors = require('cors');
      const dotenv = require('dotenv').config();
      const settlerAbi= require('./deployments/abi/Settler.json');
      const settlerForAVAXAbi = require('./deployments/abi/SettlerForAVAX.json');
      const routerAbi = require('./deployments/abi/Router.json');
      const routerForAVAXAbi = require('./deployments/abi/RouterForAVAX.json');
      const axios = require('axios');
      const app = express();
      const port = 3000;

      app.use(cors());
      app.use(express.json());

      class main {

        async callSettler(targetChainIdInHexa, gasCostEstimated) {

          // initialize network and wallet object.
          let targetChainInfo = networksInstance.setTargetChain(targetChainIdInHexa);
          let gasCost = gasCostEstimated.toString();
          let targetChainScanApiURL = targetChainInfo.targetChainScanApiURL;
          let targetChainScanApiKey = targetChainInfo.targetChainScanApiKey;
          let targetNodeRPCURL = targetChainInfo.targetNodeRPCURL;
          let targetChainRouterAddr = targetChainInfo.targetChainRouterAddr;
          let USDCProxyAddress = targetChainInfo.USDCProxyAddress;
          let WrappedCoinAddress = targetChainInfo.WrappedCoinAddress;
          let scanURL = targetChainInfo.scanURL;

          let providerTrialCounter = 0;
          let provider = null;
          while (providerTrialCounter < 30) {
            try {
              provider = new ethers.providers.JsonRpcProvider(targetNodeRPCURL);
              await provider.getBlockNumber(); 
              break;
            } catch (error) {
              console.error('Connection attempt failed:', error);
              provider = null; 
              providerTrialCounter++; 
              await new Promise(resolve => setTimeout(resolve, 300)); 
            }
          }
          if (provider == null) {
            throw new Error(`Failed to connect to RPC URL after several attempts`);
          }

          const wallet = new ethers.Wallet(privateKey, provider);
          if (targetChainIdInHexa == "0xa86a" || targetChainIdInHexa == "0xa869") {
          global.settler = new ethers.Contract(settlerAddress, settlerForAVAXAbi, wallet);
          global.router = new ethers.Contract(targetChainRouterAddr, routerForAVAXAbi, wallet);
          } else {
          global.settler = new ethers.Contract(settlerAddress, settlerAbi, wallet);
          global.router = new ethers.Contract(targetChainRouterAddr, routerAbi, wallet);
          }

          const path = [WrappedCoinAddress, USDCProxyAddress];
          const estimatedAmountOut = await router.getAmountsOut(gasCost, path);
          const gasCostInUSDC = estimatedAmountOut[1]; 
          console.log(`gasCostInUSDC: ${gasCostInUSDC}`);
          let Tx = null;
          let TxTrialCounter = 0;

          while (TxTrialCounter < 30) {
            try {
              Tx = await settler.tokenSettleWithFee(messageBytes, attestation, recipient, gasCostInUSDC);
              console.log(`Tx: ${Tx}`);
              const txHash = Tx.hash;
              console.log(`txHash:${txHash}`);
              const txURL = scanURL + 'tx/' + txHash;
              console.log(`txURL: ${txURL}`);
              if (Tx != null) {
                return txURL;
              }
            } catch(error) {
              console.error('Connection attempt failed:', error);
              TxTrialCounter++;
              await new Promise(resolve => setTimeout(resolve, 200)); 
            } 
          }

          if (Tx == null) {
            throw new Error(`After several attempts, it's still fail to get Tx because of the timeout of RPC URL.`);
          } 
        };


        // async gasAmountEstimate(targetChainIdInHexa) {
        //   let targetChainInfo = networksInstance.setTargetChain(targetChainIdInHexa);
        //   let targetChainScanApiURL = targetChainInfo.targetChainScanApiURL;
        //   let targetChainScanApiKey = targetChainInfo.targetChainScanApiKey;
        //   let targetNodeRPCURL = targetChainInfo.targetNodeRPCURL;
        //   let targetChainRouterAddr = targetChainInfo.targetChainRouterAddr;
          
        //   let providerTrialCounter = 0;
        //   let provider = null;
        //   while (providerTrialCounter < 30) {
        //     try {
        //       provider = new ethers.providers.JsonRpcProvider(targetNodeRPCURL);
        //       await provider.getBlockNumber(); 
        //       break; 
        //     } catch (error) {
        //       console.error('Connection attempt failed:', error);
        //       provider = null; 
        //       providerTrialCounter++; 
        //       await new Promise(resolve => setTimeout(resolve, 100)); 
        //     }
        //   }
        //   if (provider == null) {
        //     throw new Error(`Failed to connect to RPC URL after several attempts`);
        //   }

        //   const wallet = new ethers.Wallet(privateKey, provider);
        //   let settlerAbi = null;
        //   let routerAbi = null;
        //   while (settlerAbi == null) {
        //       try {
        //         settlerAbi = await componentsInstance.getContractABI(settlerAddress, targetChainScanApiURL, targetChainScanApiKey);
        //         if (settlerAbi != null) {
        //             global.settler = new ethers.Contract(settlerAddress, settlerAbi, wallet);
        //             break; 
        //         }
        //     } catch (error) {
        //         console.error('Caught error: ', error);
        //         await new Promise(resolve => setTimeout(resolve, 200));
        //     }
        //   }

        //   while (routerAbi == null) {
        //       try {
        //         routerAbi = await componentsInstance.getContractABI(targetChainRouterAddr, targetChainScanApiURL, targetChainScanApiKey);
        //         if (routerAbi != null) {
        //             global.router = new ethers.Contract(targetChainRouterAddr, routerAbi, wallet);
        //             break; 
        //         }
        //     } catch (error) {
        //         console.error('Caught error: ', error);
        //         await new Promise(resolve => setTimeout(resolve, 200));
        //     }
        //   }

        //   const messageExample = "0x000000000000000000000001000000000003aa02000000000000000000000000d0c3da58f55358142b8d3e06c1c30c5c6114efe8000000000000000000000000eb08f243e5d3fcff26a9e38ae5520a669f4019d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007865c6e87b9f70255377e024ace6630c1eaa37f0000000000000000000000003490ff3bc24146aa6140e1efd5b0a0faaeda39e900000000000000000000000000000000000000000000000000000000002746f20000000000000000000000009314f15a04d9a69bce94758e535e49c4e6c6770e";
        //   const attestationExample = "0xa131db3f59bce694f89b60cbf6425cb23d8f7bbeb0626333c6a4ac0a228917252f65d9b90d9e4c1cf84d0e2e49ef25c69120673d260ae2363ba290a92b841a6b1b9a0b37c3d00a889722a2cb8a2fe9a1ed66b8cfa7f66e38acbd3600a53454a3ff0e709163664f1ff9bec6030ea24b9c888c8a1f5584c1960acf0df56bc933a11b1c";
        //   let gasAmountEstimated = await settler.estimateGas.tokenSettleWithFee(messageExample, attestationExample, recipient, 100000);
        //   console.log(`gasAmountEstimated: ${gasAmountEstimated}`);
        //   return gasAmountEstimated;
        // };
      };


      class Networks {

        setTargetChain(targetChainIdInHexa) {
          let targetChainScanApiURL;
          let targetChainScanApiKey;
          let targetNodeRPCURL;
          let targetChainRouterAddr;
          let USDCProxyAddress;
          let WrappedCoinAddress;
          let scanURL;
          switch (targetChainIdInHexa) {
            // Target chain is Ethereum Mainnet:
            case "0x1":
            targetChainScanApiURL = 'https://api.etherscan.io/api';
            targetChainScanApiKey = process.env.ETHERSCAN_API_KEY;
            targetNodeRPCURL = process.env.ETHEREUM_RPC_URL;
            targetChainRouterAddr = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
            USDCProxyAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
            WrappedCoinAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
            scanURL = 'https://etherscan.io/';
            break;
            // Target chain is Avalanche C-Chain:
            case "0xa86a":
            targetChainScanApiURL = 'https://api.snowtrace.io/api';
            targetChainScanApiKey = process.env.SNOWTRACE_API_KEY;
            targetNodeRPCURL = process.env.AVALANCHE_RPC_URL;
            targetChainRouterAddr = '0x60ae616a2155ee3d9a68541ba4544862310933d4';
            USDCProxyAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
            WrappedCoinAddress = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7';
            scanURL = 'https://snowtrace.io/';
            break;
            // Target chain is Optimism Mainnet:
            case "0xa":
            targetChainScanApiURL = 'https://api-optimistic.etherscan.io/api';
            targetChainScanApiKey = process.env.OPTIMISMSCAN_API_KEY;
            targetNodeRPCURL = process.env.OPTIMISM_RPC_URL;
            targetChainRouterAddr = '0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858';
            USDCProxyAddress = '0x0b2c639c533813f4aa9d7837caf62653d097ff85';
            WrappedCoinAddress = '0x4200000000000000000000000000000000000006';
            scanURL = 'https://optimistic.etherscan.io/';
            break;
            // Target chain is Arbitrum One:
            case "0xa4b1":
            targetChainScanApiURL = 'https://api.arbiscan.io/api';
            targetChainScanApiKey = process.env.ARBISCAN_API_KEY;
            targetNodeRPCURL = process.env.ARBITRUM_RPC_URL;
            targetChainRouterAddr = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506';
            USDCProxyAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831';
            WrappedCoinAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
            scanURL = 'https://arbiscan.io/';
            break;
            // Target chain is Base:
            case "0x2105":
            targetChainScanApiURL = 'https://api.basescan.org/api';
            targetChainScanApiKey = process.env.BASE_API_KEY;
            targetNodeRPCURL = process.env.BASE_RPC_URL;
            targetChainRouterAddr = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86';
            USDCProxyAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
            WrappedCoinAddress = '0x4200000000000000000000000000000000000006';
            scanURL = 'https://basescan.org/';
            break;
            // Target chain is Ethereum-Goerli:
            case "0x5":
            targetChainScanApiURL = 'https://api-goerli.etherscan.io/api';
            targetChainScanApiKey = process.env.ETHERSCAN_API_KEY;
            targetNodeRPCURL = process.env.ETHEREUM_GOERLI_RPC_URL;
            targetChainRouterAddr = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
            USDCProxyAddress = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F';
            WrappedCoinAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
            scanURL = 'https://goerli.etherscan.io/';
            break;
            // Target chain is Avalanche-Fuji:
            case "0xa869":
            targetChainScanApiURL = 'https://api-testnet.snowtrace.io/api';
            targetChainScanApiKey = process.env.SNOWTRACE_API_KEY;
            targetNodeRPCURL = process.env.AVALANCHE_FUJI_RPC_URL;
            targetChainRouterAddr = '0x3705aBF712ccD4fc56Ee76f0BD3009FD4013ad75';
            USDCProxyAddress = '0x5425890298aed601595a70ab815c96711a31bc65';
            WrappedCoinAddress = '0xd00ae08403B9bbb9124bB305C09058E32C39A48c';
            scanURL = 'https://testnet.snowtrace.io/';
            break;
            // Target chain is Optimism-Goerli:
            case "0x1a4":
            targetChainScanApiURL = 'https://api-goerli-optimistic.etherscan.io/api';
            targetChainScanApiKey = process.env.OPTIMISMSCAN_API_KEY;
            targetNodeRPCURL = process.env.OPTIMISM_GOERLI_RPC_URL;
            targetChainRouterAddr = '0x8F1f2A89930dC9aaa7B5a799AC695dF809B0fbe5';
            USDCProxyAddress = '0xe05606174bac4a6364b31bd0eca4bf4dd368f8c6';
            WrappedCoinAddress = '0x4200000000000000000000000000000000000006';
            scanURL = 'https://goerli-optimistic.etherscan.io/';
            break;
            // Target chain is Arbitrum-Goerli:
            case "0x66eed":
            targetChainScanApiURL = 'https://api-goerli.arbiscan.io/api';
            targetChainScanApiKey = process.env.ARBISCAN_API_KEY;
            targetNodeRPCURL = process.env.ARBITRUM_GOERLI_RPC_URL;
            targetChainRouterAddr = '0x81cD91B6BD7D275a7AeebBA15929AE0f0751d18C';
            USDCProxyAddress = '0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63';
            WrappedCoinAddress = '0xEe01c0CD76354C383B8c7B4e65EA88D00B06f36f';
            scanURL = 'https://goerli.arbiscan.io/';
            break;
            // Target chain is Base-Goerli:
            case "0x14a33":
            targetChainScanApiURL = 'https://api-goerli.basescan.org/api';
            targetChainScanApiKey = process.env.BASE_API_KEY;
            targetNodeRPCURL = process.env.BASE_GOERLI_RPC_URL;
            targetChainRouterAddr = '0x9E3A2a71a5134EA25b547C3EE9131192da7B3DE5';
            USDCProxyAddress = '0xf175520c52418dfe19c8098071a252da48cd1c19';
            WrappedCoinAddress = '0x4200000000000000000000000000000000000006';
            scanURL = 'https://goerli.basescan.org/';
            break;
          }
          return { targetChainScanApiURL, targetChainScanApiKey, targetNodeRPCURL, targetChainRouterAddr, USDCProxyAddress, WrappedCoinAddress, scanURL };
        };

      };

      class components {

        async getContractABI(contractAddress, scanApiURL, scanApiKey) {
          const fetch = (await import('node-fetch')).default;
          const url = `${scanApiURL}?module=contract&action=getabi&address=${contractAddress}&apikey=${scanApiKey}`;
          try {
            // const fetchedABI = await fetch(`${scanApiURL}?module=contract&action=getabi&address=${contractAddress}&apikey=${scanApiKey}`);
            const fetchedABI = await fetch(url);
            const contractABI = await fetchedABI.json();
            if (contractABI.status === '1') {
              return JSON.parse(contractABI.result);
            } else {
              console.error('contractABI.status !== 1');
              return null;
            }
          } catch (error) {
            console.error(error);
            return null;
          }
        };

      };


      const mainInstance = new main();
      const networksInstance = new Networks();
      const componentsInstance = new components();
      const privateKey = process.env.PRIVATE_KEY;


      app.post('/crosschain-dataTransfer', async (req, res) => {
        const data = req.body;
        console.log('transferred data:', data);
        global.recipient = data.recipient;
        global.gasCostEstimated = (data.gasCostEstimated.hex).toString();
        global.targetChainIdInHexa = data.targetChainIdInHexa;
        global.settlerAddress = data.settlerAddress;
        global.messageBytes = data.messageBytes;
        global.attestation = data.attestation;
        console.log(`recipient: ${recipient}`);
        console.log(`gasCostEstimated: ${gasCostEstimated}`);
        console.log(`targetChainIdInHexa: ${targetChainIdInHexa}`);
        console.log(`settlerAddress: ${settlerAddress}`);
        console.log(`messageBytes: ${messageBytes}`);
        console.log(`attestation: ${attestation}`);
        try {
          const txURL = await mainInstance.callSettler(targetChainIdInHexa, gasCostEstimated);
          res.json( {txURL: txURL} );
        } catch(error) {

        }
      });

      // app.get('/gasEstimated-dataTransfer', async (req, res) => {
      //   try {
      //     const gasAmountEstimated = await mainInstance.gasAmountEstimate(targetChainIdInHexa);
      //     res.json({ gasAmountEstimated }); 
      //   } catch (error) {
      //     console.error('Server error:', error);
      //     res.status(500).send('Internal Server Error');
      //   }    
      // });


      app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
      });
