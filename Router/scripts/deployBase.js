// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const USDCAddr = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    const messageTransmitterAddr = "0xAD09780d193884d503182aD4588450C416D6F9D4";
    const routerAddr = "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
    const wrappedCoinAddr = "0x4200000000000000000000000000000000000006";
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
