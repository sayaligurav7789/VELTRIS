const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProductVerification", () => {
  let c, owner, maker, other;
  const h = (s) => ethers.keccak256(ethers.toUtf8Bytes(s));

  beforeEach(async () => {
    [owner, maker, other] = await ethers.getSigners();
    c = await ethers.deployContract("ProductVerification");
    await c.setManufacturer(maker.address, true);
  });

  it("registers and verifies a genuine product", async () => {
    await c.connect(maker).registerProduct("P-1", h("details"));
    const r = await c.verifyProduct("P-1", h("details"));
    expect(r.authentic).to.equal(true);
    expect(r.manufacturer).to.equal(maker.address);
  });

  it("rejects tampered details and unknown IDs", async () => {
    await c.connect(maker).registerProduct("P-1", h("details"));
    expect((await c.verifyProduct("P-1", h("fake"))).authentic).to.equal(false);
    expect((await c.verifyProduct("P-2", h("details"))).registered).to.equal(false);
  });

  it("blocks duplicates and unauthorized registration", async () => {
    await c.connect(maker).registerProduct("P-1", h("a"));
    await expect(c.connect(maker).registerProduct("P-1", h("a"))).to.be.revertedWith("Product ID already registered");
    await expect(c.connect(other).registerProduct("P-9", h("a"))).to.be.revertedWith("Not an authorized manufacturer");
  });

  it("revoked products fail verification", async () => {
    await c.connect(maker).registerProduct("P-1", h("a"));
    await c.connect(maker).revokeProduct("P-1");
    expect((await c.verifyProduct("P-1", h("a"))).authentic).to.equal(false);
  });
});
