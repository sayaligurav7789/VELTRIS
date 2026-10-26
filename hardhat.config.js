require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

const networks = {
  localhost: {
    url: "http://127.0.0.1:8545",
  },
};

const key = PRIVATE_KEY?.startsWith("0x")
  ? PRIVATE_KEY
  : `0x${PRIVATE_KEY || ""}`;

if (SEPOLIA_RPC_URL && /^0x[0-9a-fA-F]{64}$/.test(key)) {
  networks.sepolia = {
    url: SEPOLIA_RPC_URL,
    accounts: [key],
  };
}

module.exports = {
  solidity: "0.8.24",
  networks,
  // Etherscan API V2: one key works for Sepolia, mainnet, etc.
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || "",
  },
  sourcify: {
    enabled: false,
  },
};