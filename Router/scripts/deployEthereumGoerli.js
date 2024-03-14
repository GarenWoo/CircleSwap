// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const USDCAddr = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
    const messageTransmitterAddr = "0x26413e8157cd32011e726065a5462e97dd4d03d9";
    const routerAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const wrappedCoinAddr = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";
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
