const { ethers, artifacts, network, run } = require("hardhat");
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

  // Auto-verify on Etherscan when deploying to a public network.
  if (network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for 5 confirmations before verifying...");
    await contract.deploymentTransaction().wait(5);
    try {
      await run("verify:verify", { address, constructorArguments: [] });
      console.log("Verified: https://sepolia.etherscan.io/address/" + address + "#code");
    } catch (e) {
      if (/already verified/i.test(e.message)) {
        console.log("Already verified.");
      } else {
        console.error("Verification failed (you can retry with npm run verify:sepolia):", e.message);
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });