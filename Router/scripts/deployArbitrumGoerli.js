// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const USDCAddr = "0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63";
    const messageTransmitterAddr = "0x109bc137cb64eab7c0b1dddd1edf341467dc2d35";
    const routerAddr = "0x81cD91B6BD7D275a7AeebBA15929AE0f0751d18C";
    const wrappedCoinAddr = "0xEe01c0CD76354C383B8c7B4e65EA88D00B06f36f";
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
