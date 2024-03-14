// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const USDCAddr = "0x0b2c639c533813f4aa9d7837caf62653d097ff85";
    const messageTransmitterAddr = "0x4d41f22c5a0e5c74090899e5a8fb597a8842b3e8";
    const routerAddr = "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858";
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
