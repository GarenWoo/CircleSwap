// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const USDCAddr = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
    const messageTransmitterAddr = "0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca";
    const routerAddr = "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506";
    const wrappedCoinAddr = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
    const SetterContract = await hre.ethers.getContractFactory("Settler");
    const Settler = await SetterContract.deploy(USDCAddr, messageTransmitterAddr, routerAddr, wrappedCoinAddr);
    await Settler.deployed();
    console.log("Settler contract has been deployed at: " + Settler.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
