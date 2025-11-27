const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockExpenseTracker - Basic Tests", function () {
let tracker, owner;

beforeEach(async () => {
[owner] = await ethers.getSigners();
const Factory = await ethers.getContractFactory("MockExpenseTracker");
tracker = await Factory.deploy();
await tracker.waitForDeployment();
});

it("Should deploy correctly", async () => {
expect(await tracker.getExpenseCount(owner.address)).to.equal(0);
});

it("Should add expense correctly (mock FHE)", async () => {
const timestamp = Math.floor(Date.now() / 1000);
const tx = await tracker.connect(owner).addExpense(1, timestamp, 100);
await tx.wait();

const count = await tracker.getExpenseCount(owner.address);
const [, , amount, isDeleted] = await tracker.getEncryptedExpense(owner.address, 0);

expect(count).to.equal(1);
expect(amount).to.equal(100);
expect(isDeleted).to.equal(false);
});

it("Should delete correctly", async () => {
const timestamp = Math.floor(Date.now() / 1000);

await tracker.addExpense(1, timestamp, 100);
await tracker.deleteExpense(0);

const [, , amount, isDeleted] = await tracker.getEncryptedExpense(owner.address, 0);
const total = await tracker.getEncryptedGlobalTotal(owner.address);

expect(isDeleted).to.equal(true);
expect(amount).to.equal(0);
expect(total).to.equal(0);
});
});