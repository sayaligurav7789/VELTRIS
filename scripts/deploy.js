const { ethers, artifacts } = require("hardhat");
const fs = require("fs");

async function main() {
  const contract = await ethers.deployContract("ProductVerification");
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const { chainId } = await ethers.provider.getNetwork();
  const { abi } = await artifacts.readArtifact("ProductVerification");

  fs.writeFileSync(
    "frontend/contract-config.js",
    "window.CONTRACT = " + JSON.stringify({ address, chainId: Number(chainId), abi }) + ";\n"
  );
  console.log("Deployed to:", address, "(chain", chainId.toString() + ")");
  console.log("Frontend config written to frontend/contract-config.js");
}

main().catch((e) => { console.error(e); process.exit(1); });
