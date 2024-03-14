// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const USDCAddr = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
    const messageTransmitterAddr = "0x8186359af5f57fbb40c6b14a588d2a59c0c29880";
    const routerAddr = "0x60ae616a2155ee3d9a68541ba4544862310933d4";
    const wrappedCoinAddr = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
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
