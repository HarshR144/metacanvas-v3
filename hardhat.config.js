require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// const NEXT_PUBLIC_POLYGON_MUMBAI_RPC = "https://rpc-amoy.polygon.technology/";
// const NEXT_PUBLIC_HOLESKY_RPC = "https://ethereum-holesky.publicnode.com/";

const URL = process.env.HOLESKY_URL;
const URL_OPTIONAL = process.env.HOLESKY_URL;
const KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "matic",
  networks: {
    hardhat: {
      forking: {
        url: process.env.HOLSKEY_RPC_URL,
        // Optional: specify block number to fork from
        // blockNumber: 1234567
      }
    },
    // polygon_amoy: {
    //   url: NEXT_PUBLIC_POLYGON_MUMBAI_RPC,
    //   accounts: [`0x${NEXT_PUBLIC_PRIVATE_KEY}`],
    // },
    holesky: {
      url: process.env.HOLSKEY_RPC_URL,
      chainId: 17000,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
