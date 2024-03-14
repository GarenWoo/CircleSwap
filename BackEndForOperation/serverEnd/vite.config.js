import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dotenv from 'dotenv';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.ETHEREUM_RPC_URL': JSON.stringify(process.env.ETHEREUM_RPC_URL),
    'process.env.ETHEREUM_GOERLI_RPC_URL': JSON.stringify(process.env.ETHEREUM_GOERLI_RPC_URL),
    'process.env.AVALANCHE_RPC_URL': JSON.stringify(process.env.AVALANCHE_RPC_URL),
    'process.env.AVALANCHE_FUJI_RPC_URL': JSON.stringify(process.env.AVALANCHE_FUJI_RPC_URL),
    'process.env.OPTIMISM_RPC_URL': JSON.stringify(process.env.OPTIMISM_RPC_URL),
    'process.env.OPTIMISM_GOERLI_RPC_URL': JSON.stringify(process.env.OPTIMISM_GOERLI_RPC_URL),
    'process.env.ARBITRUM_RPC_URL': JSON.stringify(process.env.ARBITRUM_RPC_URL),
    'process.env.ARBITRUM_GOERLI_RPC_URL': JSON.stringify(process.env.ARBITRUM_GOERLI_RPC_URL),
    'process.env.BASE_RPC_URL': JSON.stringify(process.env.BASE_RPC_URL),
    'process.env.BASE_GOERLI_RPC_URL': JSON.stringify(process.env.BASE_GOERLI_RPC_URL),
    'process.env.POLYGON_RPC_URL': JSON.stringify(process.env.POLYGON_RPC_URL),
    'process.env.POLYGON_MUMBAI_RPC_URL': JSON.stringify(process.env.POLYGON_MUMBAI_RPC_URL),

    'process.env.ETHERSCAN_API_KEY': JSON.stringify(process.env.ETHERSCAN_API_KEY),
    'process.env.SNOWTRACE_API_KEY': JSON.stringify(process.env.SNOWTRACE_API_KEY),
    'process.env.OPTIMISMSCAN_API_KEY': JSON.stringify(process.env.OPTIMISMSCAN_API_KEY),
    'process.env.ARBISCAN_API_KEY': JSON.stringify(process.env.ARBISCAN_API_KEY),
    'process.env.BASE_API_KEY': JSON.stringify(process.env.BASE_API_KEY),
    'process.env.POLYGONSCAN_API_KEY': JSON.stringify(process.env.POLYGONSCAN_API_KEY),
  }
  ,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
