// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const USDCAddr = "0xe05606174bac4a6364b31bd0eca4bf4dd368f8c6";
    const messageTransmitterAddr = "0x9ff9a4da6f2157a9c82ce756f8fd7e0d75be8895";
    const routerAddr = "0x8F1f2A89930dC9aaa7B5a799AC695dF809B0fbe5";
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
