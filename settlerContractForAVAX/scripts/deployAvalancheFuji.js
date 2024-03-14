// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const USDCAddr = "0x5425890298aed601595a70ab815c96711a31bc65";
    const messageTransmitterAddr = "0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79";
    const routerAddr = "0x3705aBF712ccD4fc56Ee76f0BD3009FD4013ad75";
    const wrappedCoinAddr = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
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
